'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),vm=require('node:vm'),fs=require('node:fs'),path=require('node:path');
const source=fs.readFileSync(path.join(__dirname,'../renderer.js'),'utf8');
async function harness(overrides={}){
 let now=0,id=0;const timers=new Map(),frames=[],events={},starts=[];
 const config={repetitions:3,holdMs:10000,fadeMs:600,readyTimeoutMs:30000,watchdogMs:900000,artworks:[{id:'a',path:'a'},{id:'b',path:'b'}],...overrides};
 const status={classList:{toggle(){}},textContent:''};
 const document={body:{classList:{toggle(){}},prepend:f=>frames.unshift(f)},querySelector:()=>status,querySelectorAll:()=>frames,createElement:()=>{
  const frame={style:{opacity:'0'},setAttribute(){},remove(){const i=frames.indexOf(frame);if(i>=0)frames.splice(i,1);},contentWindow:{postMessage(m){starts.push({frame,m,frames:[...frames],time:now});}}};return frame;
 }};
 const window={addEventListener:(k,fn)=>events[k]=fn};
 vm.runInNewContext(source,{document,window,location:{href:'http://local/',origin:'http://local'},URL,crypto:{randomUUID:()=>String(++id)},fetch:async()=>({json:async()=>config}),console:{log(){}},setTimeout:(fn,ms)=>{const key=++id;timers.set(key,{fn,time:now+ms});return key;},clearTimeout:key=>timers.delete(key)});
 const flush=async()=>{for(let n=0;n<12;n++)await Promise.resolve();};
 async function tick(ms=0){const target=now+ms;await flush();for(;;){const due=[...timers].filter(([,t])=>t.time<=target).sort((a,b)=>a[1].time-b[1].time)[0];if(!due)break;now=due[1].time;timers.delete(due[0]);due[1].fn();await flush();}now=target;await flush();}
 function message(frame,kind,extra={}){events.message({origin:'http://local',source:frame.contentWindow,data:{artworkPlayer:true,token:new URL(frame.src,'http://local').searchParams.get('run'),kind,...extra}});}
 const skip=()=>events.keydown({key:'ArrowRight',preventDefault(){}});
 await flush();return {frames,starts,message,skip,tick,state:()=>window.playerState(),config};
}
test('serial fade removes outgoing before start; first paint gates fade, not completion',async()=>{
 const h=await harness();const a=h.frames[0];h.message(a,'ready');await h.tick();assert.equal(h.state().phase,'activation');assert.equal(a.style.opacity,'0');
 h.message(a,'start-ready');await h.tick(600);assert.equal(h.state().phase,'idle');const b=h.frames.find(f=>f!==a);h.message(b,'ready');
 h.skip();await h.tick(599);assert.equal(h.starts.length,1);assert.ok(h.frames.includes(a));
 h.message(a,'complete',{source:'setup'});assert.equal(h.state().current.done,false);
 await h.tick(1);assert.equal(h.starts.length,2);assert.ok(!h.frames.includes(a));assert.equal(h.starts[1].frames.length,1);assert.equal(b.style.opacity,'0');
 await h.tick(1000);assert.equal(h.state().phase,'activation');assert.equal(h.state().current.done,false);assert.equal(b.style.opacity,'0');
 h.message(b,'start-ready');await h.tick();assert.equal(b.style.opacity,'1');assert.equal(h.state().current.done,false);await h.tick(600);assert.equal(h.state().phase,'idle');
});
test('completion before fade-in uses genuine hold once, without stale advancement',async()=>{
 const h=await harness({holdMs:100,fadeMs:600});const a=h.frames[0];h.message(a,'ready');await h.tick();h.message(a,'complete',{source:'setup'});await h.tick(100);assert.equal(h.state().phase,'activation');
 h.message(a,'start-ready');await h.tick(600);assert.equal(h.state().phase,'fade-out');const b=h.frames.find(f=>f!==a);h.message(b,'ready');await h.tick(600);h.message(b,'start-ready');await h.tick(600);assert.equal(h.state().current.repeat,1);assert.equal(h.state().current.done,false);await h.tick(1000);assert.equal(h.state().current.repeat,1);
});
test('activation timeout and activation error stay black; manual skip recovers',async()=>{
 for(const mode of ['timeout','error']){
  const h=await harness({readyTimeoutMs:1000});const a=h.frames[0];h.message(a,'ready');await h.tick();
  if(mode==='error')h.message(a,'error',{message:'broken'});else await h.tick(1000);
  await h.tick();assert.equal(h.state().current.failed,true);assert.equal(h.frames.includes(a),false);assert.equal(h.state().advancing,false);
  const b=h.frames[0];h.message(b,'ready');h.skip();await h.tick(600);h.message(b,'start-ready');await h.tick(600);assert.equal(h.state().current.failed,false);assert.equal(b.style.opacity,'1');
 }
});
test('manual skip cancels delayed activation immediately and stale start cannot reveal it',async()=>{
 const h=await harness();const a=h.frames[0];h.message(a,'ready');await h.tick();h.skip();await h.tick();assert.equal(h.frames.includes(a),false);const b=h.frames[0];h.message(a,'start-ready');h.message(b,'ready');await h.tick(600);assert.equal(h.state().current.started,false);assert.equal(b.style.opacity,'0');h.message(b,'start-ready');await h.tick(600);assert.equal(b.style.opacity,'1');
});

test('failure after an early completion cancels expired hold and never auto-advances',async()=>{
 const h=await harness({holdMs:10});const a=h.frames[0];h.message(a,'ready');await h.tick();h.message(a,'complete',{source:'setup'});await h.tick(10);h.message(a,'error',{message:'late failure'});await h.tick(2000);assert.equal(h.state().current.failed,true);assert.equal(h.state().current.done,false);assert.equal(h.starts.length,1);assert.equal(h.state().advancing,false);
});
