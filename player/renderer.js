(() => {
 'use strict'; document.body.classList.toggle('exhibition',new URL(location.href).searchParams.get('exhibition')==='1');
 let config,current=null,pending=null,loading=null,queued=false,advancing=false,position={index:0,repeat:0},holdTimer;
 const status=document.querySelector('#status');
 const say=(message,error=false)=>{status.textContent=message;status.classList.toggle('error',error);console.log('[player]',message);};
 const label=f=>(f.art.title||f.art.id)+' · '+(f.position.repeat+1)+'/'+config.repetitions;
 const next=p=>p.repeat+1<config.repetitions?{index:p.index,repeat:p.repeat+1}:{index:(p.index+1)%config.artworks.length,repeat:0};
 function dispose(f){if(!f)return;clearTimeout(f.readyTimer);clearTimeout(f.watchdog);f.iframe.remove();}
 function preload(p){
  const art=config.artworks[p.index],iframe=document.createElement('iframe'),token=crypto.randomUUID();
  const f={art,iframe,token,position:p,ready:false,active:false,done:false};
  iframe.title=art.title||art.id;iframe.setAttribute('sandbox','allow-scripts allow-same-origin');
  iframe.src='/'+art.path+'?run='+encodeURIComponent(token);document.body.prepend(iframe);
  f.readyPromise=new Promise(resolve=>{f.resolve=resolve;});
  f.readyTimer=setTimeout(()=>{f.failed=true;f.resolve(false);say('READY TIMEOUT: '+label(f)+' — press → to retry/skip',true);},config.readyTimeoutMs);
  return f;
 }
 function finished(f,source){
  if(f!==current||!f.active||f.done)return;
  f.done=true;clearTimeout(f.watchdog);
  const timed=source==='configured-duration';
  say(label(f)+(timed?' · configured duration reached (not a completion signal)':' · completed: '+source));
  holdTimer=setTimeout(()=>{if(current===f&&f.active)advance();},f.art.holdMs??config.holdMs);
 }
 async function advance(){
  if(advancing){queued=true;return;}advancing=true;clearTimeout(holdTimer); if(current){current.active=false;clearTimeout(current.watchdog);}
  let incoming=pending;pending=null;
  if(!incoming)incoming=preload(current?next(current.position):position);
  loading=incoming;const ready=await incoming.readyPromise;loading=null;
  if(!ready){dispose(incoming);advancing=false;pending=preload(next(incoming.position));return;}
  const old=current;current=incoming;position=incoming.position;incoming.active=true;
  incoming.iframe.style.transition='opacity '+config.fadeMs+'ms linear';
  incoming.iframe.style.zIndex='2';
  // Start only at the visible transition boundary, never during hidden preload.
  incoming.iframe.style.opacity='1';
  incoming.iframe.contentWindow.postMessage({token:incoming.token,command:'start',options:incoming.art},location.origin);
  say(label(incoming)+' · rendering');
  incoming.watchdog=setTimeout(()=>{
   if(current!==incoming||incoming.done)return;
   say('WATCHDOG: '+label(incoming)+' has not completed — → skip / Enter confirm manually',true);
  },incoming.art.watchdogMs??config.watchdogMs);
  if(old){old.active=false;clearTimeout(old.watchdog);old.iframe.style.transition='opacity '+config.fadeMs+'ms linear';old.iframe.style.opacity='0';}
  await new Promise(resolve=>setTimeout(resolve,config.fadeMs));
  dispose(old);incoming.iframe.style.zIndex='1';advancing=false;
  pending=preload(next(position));
  if(queued){queued=false;advance();}
 }
 window.addEventListener('message',event=>{
  const m=event.data;if(event.origin!==location.origin||!m||m.artworkPlayer!==true)return;
  const f=[current,pending,loading].find(f=>f&&f.token===m.token&&event.source===f.iframe.contentWindow);
  // Initial startup frame is assigned to pending before asynchronous messages arrive.
  if(!f)return;
  if(m.kind==='ready'&&!f.failed){f.ready=true;clearTimeout(f.readyTimer);f.resolve(true);}
  else if(m.kind==='complete')finished(f,m.source);
  else if((m.kind==='error'||m.kind==='warning')&&f===current)say(label(f)+' · '+m.kind+': '+m.message,true);
 });
 window.addEventListener('keydown',e=>{
  if(e.key==='Escape'){window.close();return;}
  if(e.key==='ArrowRight'||e.key===' '){e.preventDefault();advance();}
  if(e.key==='Enter'&&current)finished(current,'manual confirmation');
 });
 window.playerState=()=>({current:current&&{id:current.art.id,repeat:current.position.repeat,done:current.done,token:current.token},pending:pending&&{id:pending.art.id,ready:pending.ready},advancing,frames:document.querySelectorAll('iframe').length,status:status.textContent});
 fetch('/config.json').then(r=>r.json()).then(c=>{config=c;pending=preload(position);advance();}).catch(e=>say('Cannot start: '+e.message,true));
})();
