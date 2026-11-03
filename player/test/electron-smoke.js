'use strict';
// Synthetic fixtures only. All waits are bounded conditions, never timing guesses.
const {app,BrowserWindow}=require('electron'),fs=require('node:fs'),os=require('node:os'),path=require('node:path'),assert=require('node:assert/strict');
const {createServer}=require('../server'),{isAllowedRequest}=require('../security');
let server,root,win;const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const js=code=>win.webContents.executeJavaScript(code);
async function until(code,label,timeout=6000){const end=Date.now()+timeout;while(Date.now()<end){const value=await js('Boolean('+code+')');if(value)return value;await sleep(15);}throw Error('Condition timeout: '+label+' '+JSON.stringify(await js('playerState()')));}
async function assertBlack(){const pixel=(await win.webContents.capturePage({x:20,y:20,width:1,height:1})).getBitmap();assert.deepEqual([...pixel.subarray(0,3)],[0,0,0],'artwork area must remain black');}
const key=()=>js('window.dispatchEvent(new KeyboardEvent("keydown",{key:"ArrowRight"}))');
const frame='[...document.querySelectorAll("iframe")].find(f=>f.src.includes(playerState().current.token))';
const art=(body)=>'<!doctype html><body><canvas width="64" height="64"></canvas><script>window.executed=true;window.firstDraw=()=>{const c=document.querySelector("canvas");const ctx=c.getContext("2d");ctx.fillStyle="#ff66aa";ctx.fillRect(0,0,64,64);window.drew=true;};'+body+'</script>';
app.whenReady().then(async()=>{
 root=fs.mkdtempSync(path.join(os.tmpdir(),'art-player-electron-'));fs.cpSync(path.resolve(__dirname,'..'),root+'/player',{recursive:true});fs.mkdirSync(root+'/artworks');
 const put=(name,content)=>fs.writeFileSync(root+'/artworks/'+name+'.html',content);
 put('fx',art('function fxpreview(){};firstDraw();setTimeout(()=>fxpreview(),80)'));
 put('p5',art('window.p5=function(){};p5.prototype.noLoop=function(){};firstDraw();setTimeout(()=>new p5().noLoop(),80)'));
 const config={shuffle:false,repetitions:3,holdMs:220,fadeMs:60,readyTimeoutMs:2000,watchdogMs:4000,artworks:[{id:'fx',path:'artworks/fx.html',completion:'fxpreview'},{id:'p5',path:'artworks/p5.html',completion:'noLoop'}]};
 server=createServer(root,config);await new Promise(r=>server.listen(0,'127.0.0.1',r));const origin='http://127.0.0.1:'+server.address().port;
 win=new BrowserWindow({width:640,height:480,show:true,fullscreen:false,webPreferences:{nodeIntegration:false,contextIsolation:true,sandbox:true,backgroundThrottling:false}});
 win.webContents.session.webRequest.onBeforeRequest((d,cb)=>cb({cancel:!isAllowedRequest(d.url,origin)}));
 win.webContents.on('console-message',e=>console.log('RENDERER',e.message));
 await win.loadURL(origin);
 await until('playerState().current?.done&&!playerState().advancing','first completion');
 let state=await js('playerState()');assert.equal(state.current.id,'fx');assert.equal(state.frames,2);
 assert.equal(await js('[...document.querySelectorAll("iframe")].find(f=>f.style.opacity!=="1").contentWindow.executed'),undefined);console.log('PASS hidden preload inert');
 const token=state.current.token;
 await js('window.postMessage({artworkPlayer:true,token:"stale",kind:"complete",source:"fxpreview"},location.origin)');
 assert.equal((await js('playerState()')).current.token,token);
 await until('playerState().current?.id==="fx"&&playerState().current.repeat===1&&!playerState().advancing','second repeat');
 await until('playerState().current?.id==="fx"&&playerState().current.repeat===2&&!playerState().advancing','third repeat');
 await until('playerState().current?.id==="p5"&&playerState().current.done&&!playerState().advancing','next artwork noLoop');
 state=await js('playerState()');assert.ok(state.frames<=2);console.log('PASS three reps, completion hold, noLoop and stale messages');
 await key();await until('playerState().current?.token!=='+JSON.stringify(state.current.token)+'&&playerState().current?.started&&!playerState().advancing','manual next');
 assert.equal(await js(frame+'.contentWindow.fetch("https://example.com/offline-test").then(()=>false).catch(()=>true)'),true);console.log('PASS keyboard next and actual network denial');
 // Controlled first draw: no wall-clock assumptions, scripts have run but no pixels yet.
 put('out',art('firstDraw();window.retiredComplete=()=>fxpreview();function fxpreview(){}'));
 put('delayed',art('window.onlyFrameAtStart=parent.document.querySelectorAll("iframe").length;window.release=()=>{firstDraw();};function fxpreview(){};window.finish=()=>fxpreview();'));
 config.artworks=[{id:'out',path:'artworks/out.html',completion:'fxpreview'},{id:'delayed',path:'artworks/delayed.html',completion:'fxpreview'}];config.repetitions=1;config.holdMs=10000;
 await win.loadURL(origin);await until('playerState().current?.started&&!playerState().advancing&&playerState().pending?.ready','outgoing visible');
 await js('window.oldFrame='+frame+';window.oldToken=playerState().current.token');
 await key();await until('playerState().phase==="fade-out"','outgoing fades');
 assert.equal(await js('window.oldFrame.style.opacity'), '0');
 // Completion arrives while retired (previous race), before removal.
 await js('window.oldFrame.contentWindow.retiredComplete()');
 await until('playerState().current?.id==="delayed"&&'+frame+'.contentWindow.executed','incoming scripts executed while black');
 assert.equal(await js('window.oldFrame.isConnected'),false);assert.equal(await js(frame+'.contentWindow.onlyFrameAtStart'),1);
 assert.equal(await js('getComputedStyle('+frame+').opacity'),'0');assert.equal((await js('playerState()')).current.started,false);
 assert.equal((await js('playerState()')).current.done,false);await assertBlack();
 await js(frame+'.contentWindow.release()');await until('playerState().phase==="fade-in"||playerState().phase==="idle"','first canvas paint fades in');
 assert.equal((await js('playerState()')).current.done,false);assert.equal(await js(frame+'.contentWindow.drew'),true);
 await until('!playerState().advancing','incoming fade completed');
 assert.equal((await js('playerState()')).current.id,'delayed');console.log('PASS outgoing removed before incoming activation, black until first frame, realtime generation and retired completion race');
 await js(frame+'.contentWindow.finish()');await until('playerState().current.done','genuine completion accepted');
 // Gate an actual local JS response; ready must not acknowledge unfinished preload.
 const originalRequest=server.listeners('request')[0];server.removeAllListeners('request');
 let releaseLocal=false,localResponse,announceLocal;const requestedLocal=new Promise(r=>announceLocal=r);
 const respondLocal=res=>{res.setHeader('Content-Type','text/javascript');res.setHeader('Cache-Control','max-age=3600');res.end('window.localScriptExecuted=true;');};
 server.on('request',(req,res)=>{if(req.url.includes('delayed-local.js')){if(releaseLocal)respondLocal(res);else {localResponse=res;announceLocal();}}else originalRequest(req,res);});
 put('local',art('firstDraw();')+'<script src="delayed-local.js"></script>');config.artworks=[{id:'local',path:'artworks/local.html',completion:'manual'}];
 await win.loadURL(origin);await Promise.race([requestedLocal,new Promise((_,reject)=>{const t=setTimeout(()=>reject(Error('Local script was not requested')),6000);t.unref();})]);
 await until('playerState().phase==="ready"','local script waiting');assert.equal((await js('playerState()')).current,null);assert.equal(await js('[...document.querySelectorAll("iframe")].every(f=>getComputedStyle(f).opacity==="0"&&!f.contentWindow.executed)'),true);
 releaseLocal=true;respondLocal(localResponse);await until('playerState().current?.started&&!playerState().advancing','local script ready and activated');assert.equal(await js(frame+'.contentWindow.localScriptExecuted'),true);console.log('PASS local scripts awaited while black and inert');
 // First pixels alone are insufficient while an original module is still activating.
 put('module',art('firstDraw();')+'<script type="module">await new Promise(r=>window.releaseModule=r);window.moduleFinished=true;</script>');
 config.artworks=[{id:'module',path:'artworks/module.html',completion:'manual'}];
 await win.loadURL(origin);await until('playerState().phase==="activation"&&'+frame+'.contentWindow.releaseModule','delayed local module activation');
 assert.equal(await js(frame+'.contentWindow.drew'),true);assert.equal((await js('playerState()')).current.started,false);assert.equal(await js('getComputedStyle('+frame+').opacity'),'0');
 await assertBlack();await js(frame+'.contentWindow.releaseModule()');await until('playerState().current.started&&!playerState().advancing','module finished then first paint');assert.equal(await js(frame+'.contentWindow.moduleFinished'),true);console.log('PASS local module completion gates first-paint handshake while black');
 // Skip a live activation wait without waiting for timeout, and reject its late messages.
 config.artworks=[{id:'delayed',path:'artworks/delayed.html',completion:'manual'},{id:'out',path:'artworks/out.html',completion:'manual'}];
 await win.loadURL(origin);await until('playerState().phase==="activation"&&'+frame+'.contentWindow.executed','manual cancel activation');await key();await until('playerState().current?.id==="out"&&playerState().current.started&&!playerState().advancing','skip active start wait');console.log('PASS manual skip cancels activation wait');
 // Explicit non-canvas start, error blackouts, timeout and manual recovery.
 put('explicit','<!doctype html><body><script>window.executed=true;window.release=()=>window.dispatchEvent(new Event("artwork-player-started"));</script>');
 config.artworks=[{id:'explicit',path:'artworks/explicit.html',completion:'manual'}];
 await win.loadURL(origin);await until('playerState().phase==="activation"&&'+frame+'.contentWindow.executed','explicit start waiting');assert.equal(await js('getComputedStyle('+frame+').opacity'),'0');
 await js(frame+'.contentWindow.release()');await until('playerState().current.started&&!playerState().advancing','explicit start accepted');
 config.watchdogMs=100;
 put('manual',art('firstDraw();'));
 config.artworks=[{id:'manual',path:'artworks/manual.html',completion:'manual'}];
 await win.loadURL(origin);await until('playerState().status.includes("WATCHDOG")','watchdog warning');assert.equal((await js('playerState()')).current.done,false);console.log('PASS explicit start and watchdog never auto-complete');
 put('reject',art('async function setup(){throw Error("intentional failure");}window.addEventListener("load",()=>setup());'));
 config.watchdogMs=4000;config.artworks=[{id:'reject',path:'artworks/reject.html',completion:'setup'},{id:'manual',path:'artworks/manual.html',completion:'manual'}];
 await win.loadURL(origin);await until('playerState().current?.failed&&!playerState().advancing','rejected setup');assert.equal((await js('playerState()')).current.done,false);assert.equal(await js('[...document.querySelectorAll("iframe")].every(f=>getComputedStyle(f).opacity==="0")'),true);
 await assertBlack();await key();await until('playerState().current?.id==="manual"&&playerState().current.started&&!playerState().advancing','error skip recovery');console.log('PASS setup rejection stays black, skip recovers');
 put('broken',art('firstDraw();throw Error("intentional script failure");')+'<script>parent.executedAfterFailure=true;</script>');
 config.artworks=[{id:'broken',path:'artworks/broken.html',completion:'manual'}];
 await win.loadURL(origin);await until('playerState().current?.failed&&!playerState().advancing','inline script failure');assert.equal((await js('playerState()')).current.started,false);assert.equal(await js('window.executedAfterFailure'),undefined);assert.equal(await js('[...document.querySelectorAll("iframe")].every(f=>getComputedStyle(f).opacity==="0")'),true);console.log('PASS script error stops activation chain before fade-in');
 put('never',art('window.never=true;'));config.readyTimeoutMs=200;config.artworks=[{id:'never',path:'artworks/never.html',completion:'manual'},{id:'manual',path:'artworks/manual.html',completion:'manual'}];
 await win.loadURL(origin);await until('playerState().status.includes("ACTIVATION TIMEOUT")&&!playerState().advancing','activation timeout');assert.equal(await js('[...document.querySelectorAll("iframe")].every(f=>getComputedStyle(f).opacity==="0")'),true);
 await key();await until('playerState().current?.id==="manual"&&playerState().current.started&&!playerState().advancing','timeout skip recovery');console.log('PASS activation timeout stays black, manual skip recovery');
 config.artworks=[{id:'missing',path:'artworks/missing.html',completion:'manual'}];
 await win.loadURL(origin);await until('playerState().status.includes("READY TIMEOUT")&&!playerState().advancing','ready timeout');assert.equal((await js('playerState()')).current,null);console.log('PASS ready timeout cleanup');
 // Async setup: start is first paint; completion is successful promise settlement.
 put('setup',art('async function setup(){firstDraw();await new Promise(r=>window.finishSetup=r);window.finalDraw=true;}window.addEventListener("load",()=>setup());'));
 config.readyTimeoutMs=2000;config.artworks=[{id:'setup',path:'artworks/setup.html',completion:'setup'}];
 await win.loadURL(origin);await until('playerState().current?.started&&!playerState().advancing','async setup visible before done');assert.equal((await js('playerState()')).current.done,false);
 await js(frame+'.contentWindow.finishSetup()');await until('playerState().current.done','async setup genuine done');assert.equal(await js(frame+'.contentWindow.finalDraw'),true);console.log('PASS async setup paints before completion');

 put('shuffle',art('firstDraw();'));
 config.shuffle=true;config.repetitions=3;config.holdMs=100000;config.fadeMs=0;
 config.artworks=Array.from({length:8},(_,i)=>({id:'shuffle-'+i,path:'artworks/shuffle.html',completion:'manual'}));
 await win.loadURL(origin);await until('playerState().current?.started&&!playerState().advancing','shuffle first frame');
 const observed=[];
 for(let n=0;n<48;n++){
  const current=(await js('playerState()')).current;observed.push(current);
  assert.equal(current.round,Math.floor(n/24));assert.equal(current.slot,Math.floor(n/3)%8);assert.equal(current.repeat,n%3);
  if(n%3)assert.equal(current.id,observed[n-1].id);
  if(n<47){await key();await until('playerState().current?.token!=='+JSON.stringify(current.token)+'&&playerState().current?.started&&!playerState().advancing','shuffle generation '+n);}
 }
 for(let r=0;r<2;r++){const ids=observed.slice(r*24,(r+1)*24).filter((_,i)=>i%3===0).map(a=>a.id);assert.equal(new Set(ids).size,8);}
 assert.notEqual(observed[23].id,observed[24].id);
 console.log('PASS two shuffled rounds: each of 8 works exactly once, 3 consecutive generations, no seam repeat');
 console.log('ELECTRON_INTEGRATION_PASS');
}).catch(e=>{console.error(e);process.exitCode=1;}).finally(()=>{if(win)win.destroy();if(server)server.close();if(root)fs.rmSync(root,{recursive:true,force:true});app.exit(process.exitCode||0);});
