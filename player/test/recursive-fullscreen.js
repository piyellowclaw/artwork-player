'use strict';
const {app,BrowserWindow}=require('electron');
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),crypto=require('node:crypto');
const {createServer}=require('../server'),{loadConfig}=require('../config'),{isAllowedRequest}=require('../security');
const root=path.resolve(__dirname,'../..'),out=path.join(root,'audit/recursive-fullscreen'),artDir=path.join(root,'artworks/2022-Recursive-and-Blocks');
const hash=s=>crypto.createHash('sha256').update(s).digest('hex');
const fixedSeed='oo123456789abcdefghijkmnopqrstuvwxyzABCDEFGHJKLMNPQRST';
const results={startedAt:new Date().toISOString(),runtime:process.versions,seed:fixedSeed,offline:true,windowed:true,cases:[]};
let server,win,active;
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const js=code=>win.webContents.executeJavaScript(code);
const frame="[...document.querySelectorAll('iframe')].find(f=>f.style.opacity==='1')";
const inArt=fn=>js(frame+'.contentWindow.eval('+JSON.stringify('('+fn.toString()+')()')+')');
async function until(code,label,timeout=900000){const end=Date.now()+timeout;while(Date.now()<end){if(await js('Boolean('+code+')'))return;const state=await js('playerState()');if(state.current?.failed||/TIMEOUT/.test(state.status))throw Error(label+': '+JSON.stringify(state));await sleep(150);}throw Error('Timed out '+label);}
function save(){fs.writeFileSync(path.join(out,'results.json'),JSON.stringify(results,null,2));}
function inspect(){
 const c=document.querySelector('canvas'),r=c.getBoundingClientRect(),ctx=c.getContext('2d');
 const expected=document.createElement('canvas');expected.width=c.width;expected.height=c.height;expected.getContext('2d').drawImage(mainCanvas.canvas,0,0,c.width,c.height);
 const actual=ctx.getImageData(0,0,c.width,c.height).data,ref=expected.getContext('2d').getImageData(0,0,c.width,c.height).data;
 const padX=Math.max(1,Math.floor(100*scaler*c.width/mainCanvas.width)-1),padY=Math.max(1,Math.floor(100*scaler*c.height/mainCanvas.height)-1);
 let marginMismatch=0;
 let differing=0,maxDelta=0,transparent=0;const colors=new Set();const edges={top:{black:0,n:0},bottom:{black:0,n:0},left:{black:0,n:0},right:{black:0,n:0}};
 for(let y=0;y<c.height;y++)for(let x=0;x<c.width;x++){
  const i=(y*c.width+x)*4;let diff=false;for(let k=0;k<4;k++){const d=Math.abs(actual[i+k]-ref[i+k]);if(d)diff=true;maxDelta=Math.max(maxDelta,d);}if(diff)differing++;
  if(x<padX||x>=c.width-padX||y<padY||y>=c.height-padY){for(let k=0;k<4;k++)if(actual[i+k]!==actual[k]){marginMismatch++;break;}}
  if(actual[i+3]!==255)transparent++;colors.add((actual[i]<<16)|(actual[i+1]<<8)|actual[i+2]);
  for(const key of [y===0?'top':null,y===c.height-1?'bottom':null,x===0?'left':null,x===c.width-1?'right':null].filter(Boolean)){edges[key].n++;if(actual[i]<4&&actual[i+1]<4&&actual[i+2]<4)edges[key].black++;}
 }
 return {viewport:{width:innerWidth,height:innerHeight},rect:{x:r.x,y:r.y,width:r.width,height:r.height},backing:{width:c.width,height:c.height},main:{width:mainCanvas.width,height:mainCanvas.height},canvasWidth,canvasHeight,longSide,drawFinished,looping:isLooping(),fxhash,features:window.$fxhashFeatures,differing,maxDelta,transparent,colors:colors.size,edges,margin:{padX,padY,mismatch:marginMismatch},p5Version:p5.VERSION};
}
app.whenReady().then(async()=>{
 fs.mkdirSync(out,{recursive:true});
 const upstream=fs.readFileSync(path.join(artDir,'upstream/sketch.js'),'utf8').replace(/\r\n/g,'\n'),local=fs.readFileSync(path.join(artDir,'sketch.js'),'utf8').replace(/\r\n/g,'\n'),meta=JSON.parse(fs.readFileSync(path.join(artDir,'LOCAL-CHANGES.json')));
 results.source={upstreamSha256:hash(fs.readFileSync(path.join(artDir,'upstream/sketch.js'))),localSha256:hash(fs.readFileSync(path.join(artDir,'sketch.js')))};
 assert.equal(results.source.upstreamSha256,meta.upstreamSha256);assert.equal(results.source.localSha256,meta.localSketchSha256);
 const segment=(s,start,end)=>s.slice(s.indexOf(start),s.indexOf(end));
 assert.equal(segment(local,'async function NYRect(','function getViewportCanvasSize(').trim(),segment(upstream,'async function NYRect(','function draw()').trim());
 assert.equal(local.slice(local.indexOf('function sleep(ms)')),upstream.slice(upstream.indexOf('function sleep(ms)')));assert.ok(local.includes('// await NYRandomTextureLines();'));results.source.algorithmsAndRngUnchanged=true;
 const config=loadConfig(root,{shuffle:false,repetitions:1,holdMs:3600000,fadeMs:0,watchdogMs:900000});config.artworks=config.artworks.filter(a=>a.id==='2022-Recursive-and-Blocks');
 server=createServer(root,config);await new Promise(r=>server.listen(0,'127.0.0.1',r));const origin='http://127.0.0.1:'+server.address().port;
 win=new BrowserWindow({width:800,height:450,useContentSize:true,show:true,fullscreen:false,alwaysOnTop:false,webPreferences:{nodeIntegration:false,contextIsolation:true,sandbox:true,backgroundThrottling:false}});
 win.webContents.session.webRequest.onBeforeRequest((d,cb)=>{if(!isAllowedRequest(d.url,origin)){if(active)active.blocked.push(d.url);return cb({cancel:true});}if(d.url.includes('/2022-Recursive-and-Blocks/index.html?')&&!d.url.includes('fxhash='))return cb({redirectURL:d.url+'&fxhash='+fixedSeed});cb({cancel:false});});
 win.webContents.session.webRequest.onCompleted(d=>{if(active&&d.statusCode>=400)active.httpFailures.push({url:d.url,status:d.statusCode});});
 win.webContents.on('console-message',e=>{if(active&&e.level==='error')active.consoleErrors.push(e.message);});
 for(const [name,w,h] of [['wide',800,450],['portrait',450,800],['square',600,600]]){
  active={name,requested:{width:w,height:h},blocked:[],httpFailures:[],consoleErrors:[]};results.cases.push(active);const began=Date.now();win.setContentSize(w,h);assert.equal(win.isFullScreen(),false);assert.equal(win.isAlwaysOnTop(),false);
  await win.loadURL(origin+'/?exhibition=1');await until('playerState().current?.done&&!playerState().advancing','genuine setup completion');active.elapsedMs=Date.now()-began;active.state=await js('playerState()');assert.ok(active.state.status.includes('completed: setup'));
  active.pixels=await inArt(inspect);const p=active.pixels;assert.deepEqual(p.viewport,{width:w,height:h});assert.deepEqual(p.rect,{x:0,y:0,width:w,height:h});assert.equal(Math.max(p.main.width,p.main.height),2000);assert.equal(p.main.width/p.main.height,w/h);assert.equal(p.drawFinished,true);assert.equal(p.looping,false);assert.equal(p.fxhash,fixedSeed);assert.equal(p.differing,0,'final display must equal complete mainCanvas composite, every pixel');assert.equal(p.transparent,0);assert.ok(p.colors>100);assert.ok(p.margin.padX>1&&p.margin.padY>1);assert.equal(p.margin.mismatch,0,'all four padding bands preserve uniform paper color');for(const e of Object.values(p.edges))assert.equal(e.black,0,'no black letterbox edge');assert.equal(active.blocked.length,0);assert.equal(active.httpFailures.length,0);assert.equal(active.consoleErrors.length,0);
  const before=await inArt(()=>document.querySelector('canvas').toDataURL());await sleep(200);assert.equal(await inArt(()=>document.querySelector('canvas').toDataURL()),before);active.finalFrameStable=true;
  active.screenshot='audit/recursive-fullscreen/'+name+'.png';fs.writeFileSync(path.join(root,active.screenshot),(await win.webContents.capturePage()).toPNG());active.pass=true;save();console.log('CASE_PASS '+JSON.stringify(active));
 }
 results.verdict='PASS';save();console.log('RECURSIVE_FULLSCREEN_PASS');
}).catch(e=>{results.verdict='CONTINUE';results.error=e.stack;fs.mkdirSync(out,{recursive:true});save();console.error(e);process.exitCode=1;}).finally(()=>{if(win)win.destroy();if(server)server.close();app.exit(process.exitCode||0);});
