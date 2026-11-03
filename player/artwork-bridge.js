/* External response-only adapter; artwork files are never rewritten. */
(() => {
 'use strict';
 const token=new URL(location.href).searchParams.get('run');
 const origin=location.origin;
 let started=false,options={},reported=false,activating=false,failed=false;
 const wrapped=new WeakSet();
 const send=(kind,extra={})=>parent.postMessage({artworkPlayer:true,token,kind,...extra},origin);
 const originalReady=Object.getOwnPropertyDescriptor(Document.prototype,'readyState');
 // Libraries loaded later must see a loading document until all original scripts execute.
 Object.defineProperty(document,'readyState',{configurable:true,get:()=>activating?'loading':originalReady.get.call(document)});
 function complete(source){
  if(!started||reported||failed)return;
  if(options.completion!==source&&options.completion!=='either')return;
  reported=true; requestAnimationFrame(()=>requestAnimationFrame(()=>setTimeout(()=>{if(!failed)send('complete',{source});},options.completionDelayMs||0)));
 }
 function hookFunction(obj,key,source){
  let value=obj[key];
  const wrap=fn=>{if(typeof fn!=='function'||wrapped.has(fn))return fn;const hooked=function(...args){const result=fn.apply(this,args);complete(source);return result;};wrapped.add(hooked);return hooked;};
  value=wrap(value);
  try{Object.defineProperty(obj,key,{configurable:true,enumerable:true,get:()=>value,set:fn=>{value=wrap(fn);}});}catch(e){try{obj[key]=value;if(obj[key]!==value)throw e;}catch{send('warning',{message:'Cannot hook '+key});}}
 }
 hookFunction(window,'fxpreview','fxpreview');
 function hookP5(p){if(p&&p.prototype)hookFunction(p.prototype,'noLoop','noLoop');return p;}
 let p5Value=window.p5;
 Object.defineProperty(window,'p5',{configurable:true,get:()=>p5Value,set:v=>{p5Value=hookP5(v);}});
 let fxValue=window.$fx;
 Object.defineProperty(window,'$fx',{configurable:true,get:()=>fxValue,set:v=>{fxValue=v;if(v)hookFunction(v,'preview','fxpreview');}});
 // Messages from retired frames cannot control this generation.
 window.addEventListener('message',async event=>{
  const m=event.data;
  if(event.source!==parent||event.origin!==origin||!m||m.token!==token||m.command!=='start'||started)return;
  started=true;options=m.options||{};activating=true;
  send('started');
  try{
   for(const el of document.querySelectorAll('*'))for(const attr of [...el.attributes])if(attr.name.startsWith('data-art-event-')){el.setAttribute(attr.name.slice(15),attr.value);el.removeAttribute(attr.name);}
   for(const held of document.querySelectorAll('script[data-art-held]')){
    const type=held.getAttribute('data-art-type');
    if(type&&!['text/javascript','application/javascript','module'].includes(type.toLowerCase()))continue;
    const script=document.createElement('script');
    for(const attr of held.attributes){if(!['type','data-art-held','data-art-type'].includes(attr.name))script.setAttribute(attr.name,attr.value);}
    if(type)script.type=type;script.async=false;script.textContent=held.textContent;
    const loaded=(script.src||type==='module')?new Promise((resolve,reject)=>{script.onload=resolve;script.onerror=()=>reject(Error('Script failed: '+script.src));}):null;
    held.replaceWith(script);if(loaded)await loaded;
    hookFunction(window,'fxpreview','fxpreview');hookP5(window.p5);
   }
   // After classic declarations, preserving original global bindings and RNG order.
   if(options.completion==='setup'){
    const original=window.setup;
    if(typeof original!=='function')throw Error('Audited setup function is missing');
    window.setup=function(...args){
     let result;try{result=original.apply(this,args);}catch(e){failed=true;send('error',{message:String(e)});throw e;}
     Promise.resolve(result).then(()=>complete('setup'),e=>{failed=true;send('error',{message:'setup rejected: '+String(e)});});
     return result;
    };
   }
   activating=false;
   document.dispatchEvent(new Event('DOMContentLoaded',{bubbles:true}));
   window.dispatchEvent(new Event('load'));
   if(options.completion==='timeout')setTimeout(()=>send('complete',{source:'configured-duration'}),options.durationMs);
   send('activated');
  }catch(e){activating=false;send('error',{message:e.message});}
 });
 window.addEventListener('error',e=>{failed=true;send('error',{message:e.message||'Resource error'});});
 window.addEventListener('unhandledrejection',e=>{failed=true;send('error',{message:String(e.reason)});});
 document.addEventListener('DOMContentLoaded',async()=>{
  const scripts=[...document.querySelectorAll('script[data-art-held][src]')];
  await Promise.all(scripts.map(s=>fetch(s.src,{cache:'force-cache'}).catch(()=>null)));
  send('ready');
 },{once:true});
})();
