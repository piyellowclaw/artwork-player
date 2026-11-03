'use strict';
// Run: electron player/test/real-artworks.js (windowed, offline, unmodified source).
const {app,BrowserWindow}=require('electron');
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {createServer}=require('../server'),{loadConfig}=require('../config'),{isAllowedRequest}=require('../security');
const root=path.resolve(__dirname,'../..'),out=path.join(root,'audit/real-artworks');
fs.mkdirSync(out,{recursive:true});
const results=[];let win,server,active;
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
app.whenReady().then(async()=>{
 const config=loadConfig(root,{repetitions:1,holdMs:3600000,fadeMs:50,watchdogMs:900000});
 const all=[...config.artworks];
 server=createServer(root,config);await new Promise(r=>server.listen(0,'127.0.0.1',r));
 const origin='http://127.0.0.1:'+server.address().port;
 win=new BrowserWindow({width:800,height:600,fullscreen:false,show:true,webPreferences:{nodeIntegration:false,contextIsolation:true,sandbox:true,backgroundThrottling:false}});
 win.webContents.session.webRequest.onBeforeRequest((d,cb)=>{const allowed=isAllowedRequest(d.url,origin);if(!allowed&&active)active.blocked.push(d.url);cb({cancel:!allowed});});
 win.webContents.session.webRequest.onCompleted(d=>{if(active&&d.statusCode>=400)active.httpFailures.push({url:d.url,status:d.statusCode});});
 win.webContents.session.webRequest.onErrorOccurred(d=>{if(active)active.networkFailures.push({url:d.url,error:d.error});});
 win.webContents.on('console-message',e=>{if(active&&e.message!=='')active.console.push({level:e.level,message:e.message});});
 for(const art of all){
  active={id:art.id,completion:art.completion,startedAt:new Date().toISOString(),blocked:[],httpFailures:[],networkFailures:[],console:[]};results.push(active);config.artworks=[art];
  const began=Date.now();await win.loadURL(origin);
  let state;
  while(Date.now()-began<900000){
   await sleep(250);state=await win.webContents.executeJavaScript('playerState()');
   if(state.current?.done||state.status.includes(' · error:')||state.status.includes('WATCHDOG')||state.status.includes('READY TIMEOUT'))break;
  }
  active.elapsedMs=Date.now()-began;active.state=state;
  active.canvas=await win.webContents.executeJavaScript(`(()=>{const f=[...document.querySelectorAll('iframe')].find(f=>f.style.opacity==='1');const w=f?.contentWindow,c=f?.contentDocument.querySelector('canvas');if(!c)return null;const d=c.getContext('2d').getImageData(0,0,c.width,c.height).data;let min=255,max=0,opaque=0;const colors=new Set();for(let i=0;i<d.length;i+=4){if(d[i+3])opaque++;min=Math.min(min,d[i],d[i+1],d[i+2]);max=Math.max(max,d[i],d[i+1],d[i+2]);colors.add((d[i]<<16)|(d[i+1]<<8)|d[i+2]);}return {width:c.width,height:c.height,min,max,opaque,colors:colors.size,setupType:typeof w.setup,fxrandType:typeof w.fxrand,fxhash:w.fxhash};})()`);
  active.screenshot=path.relative(root,path.join(out,art.id+'.png'));fs.writeFileSync(path.join(root,active.screenshot),(await win.webContents.capturePage()).toPNG());
  active.pass=!!state.current?.done&&state.status.includes('completed: setup')&&active.canvas?.colors>16&&!active.blocked.length&&!active.httpFailures.length&&!active.networkFailures.length;
  fs.writeFileSync(path.join(out,'results.json'),JSON.stringify(results,null,2));console.log('ARTWORK_RESULT',JSON.stringify({...active,console:undefined}));
 }
 assert.equal(results.filter(r=>r.pass).length,all.length,'All actual artworks must complete offline and be nonblank');
 console.log('REAL_ARTWORKS_PASS');
}).catch(e=>{console.error(e);process.exitCode=1;}).finally(()=>{if(win)win.destroy();if(server)server.close();app.quit();});
