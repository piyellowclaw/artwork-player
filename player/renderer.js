(() => {
 'use strict'; document.body.classList.toggle('exhibition',new URL(location.href).searchParams.get('exhibition')==='1');
 let config,current=null,pending=null,loading=null,queued=false,advancing=false,phase='idle',position={index:0,repeat:0},holdTimer;
 const status=document.querySelector('#status');
 const say=(message,error=false)=>{status.textContent=message;status.classList.toggle('error',error);console.log('[player]',message);};
 const label=f=>(f.art.title||f.art.id)+' · '+(f.position.repeat+1)+'/'+config.repetitions;
 const next=p=>p.repeat+1<config.repetitions?{index:p.index,repeat:p.repeat+1}:{index:(p.index+1)%config.artworks.length,repeat:0};
 const wait=ms=>new Promise(resolve=>setTimeout(resolve,ms));
 function dispose(f){if(!f)return;clearTimeout(f.readyTimer);clearTimeout(f.activationTimer);clearTimeout(f.watchdog);f.iframe.remove();}
 function preload(p){
  const art=config.artworks[p.index],iframe=document.createElement('iframe'),token=crypto.randomUUID();
  const f={art,iframe,token,position:p,ready:false,active:false,done:false};
  f.readyPromise=new Promise(resolve=>{f.resolve=resolve;});
  iframe.title=art.title||art.id;iframe.setAttribute('sandbox','allow-scripts allow-same-origin');
  iframe.src='/'+art.path+'?run='+encodeURIComponent(token);document.body.prepend(iframe);
  f.readyTimer=setTimeout(()=>{f.failed=true;f.resolve(false);},config.readyTimeoutMs);
  return f;
 }
 function fail(f,message){
  f.failed=true;f.active=false;f.done=false;f.holdDue=false;clearTimeout(f.watchdog);clearTimeout(holdTimer);
  f.iframe.style.transition='none';f.iframe.style.opacity='0';
  f.resolve(false);if(f.resolveActivation)f.resolveActivation(false);
  dispose(f);say(message+' — press → to skip',true);
 }
 function finished(f,source){
  if(f!==current||!f.active||f.failed||f.done)return;
  f.done=true;clearTimeout(f.watchdog);
  say(label(f)+(source==='configured-duration'?' · configured duration reached (not a completion signal)':' · completed: '+source));
  holdTimer=setTimeout(()=>{if(current!==f||!f.active||f.failed)return;if(advancing)f.holdDue=true;else advance();},f.art.holdMs??config.holdMs);
 }
 async function advance(){
  if(advancing){queued=true;if(phase==='ready'||phase==='activation'){const f=loading||current;if(f){f.cancelled=true;f.resolve(false);if(f.resolveActivation)f.resolveActivation(false);}}return;}
  advancing=true;clearTimeout(holdTimer);
  const old=current;
  // Retire before any await: late completion cannot schedule a stale hold/advance.
  if(old){old.active=false;clearTimeout(old.watchdog);phase='fade-out';old.iframe.style.transition='opacity '+config.fadeMs+'ms linear';old.iframe.style.opacity='0';await wait(config.fadeMs);dispose(old);}
  current=null;
  const incoming=pending||preload(old?next(old.position):position);pending=null;loading=incoming;position=incoming.position;
  phase='ready';const ready=await incoming.readyPromise;loading=null;
  if(!ready||incoming.failed||incoming.cancelled){if(!incoming.cancelled)say((incoming.error?'PRELOAD ERROR: '+incoming.error:'READY TIMEOUT: '+label(incoming))+' — press → to skip',true);dispose(incoming);}
  else {
   current=incoming;incoming.active=true;phase='activation';
   incoming.activationPromise=new Promise(resolve=>{incoming.resolveActivation=resolve;});
   incoming.activationTimer=setTimeout(()=>fail(incoming,'ACTIVATION TIMEOUT: '+label(incoming)),config.readyTimeoutMs);
   incoming.iframe.contentWindow.postMessage({token:incoming.token,command:'start',options:incoming.art},location.origin);
   say(label(incoming)+' · starting (black)');
   const activated=await incoming.activationPromise;clearTimeout(incoming.activationTimer);
   if(activated&&!incoming.failed&&!incoming.cancelled){
    phase='fade-in';incoming.iframe.style.transition='opacity '+config.fadeMs+'ms linear';
    // Commit opacity zero before starting the incoming-only fade.
    void incoming.iframe.offsetWidth;incoming.iframe.style.opacity='1';
    if(!incoming.done)say(label(incoming)+' · rendering');
    incoming.watchdog=setTimeout(()=>{if(current===incoming&&!incoming.done&&!incoming.failed)say('WATCHDOG: '+label(incoming)+' has not completed — → skip / Enter confirm manually',true);},incoming.art.watchdogMs??config.watchdogMs);
    await wait(config.fadeMs);
   }else {incoming.active=false;dispose(incoming);}
  }
  advancing=false;phase=incoming.failed?'failed':'idle';pending=preload(next(position));
  if(queued||(incoming.holdDue&&!incoming.failed&&!incoming.cancelled)){queued=false;if(current===incoming)incoming.holdDue=false;advance();}
 }
 window.addEventListener('message',event=>{
  const m=event.data;if(event.origin!==location.origin||!m||m.artworkPlayer!==true)return;
  const f=[current,pending,loading].find(f=>f&&f.token===m.token&&event.source===f.iframe.contentWindow);
  if(!f)return;
  if(m.kind==='ready'&&!f.failed){f.ready=true;clearTimeout(f.readyTimer);f.resolve(true);}
  else if(m.kind==='start-ready'&&f===current&&f.active&&!f.failed){f.started=true;if(f.resolveActivation)f.resolveActivation(true);}
  else if(m.kind==='complete')finished(f,m.source);
  else if(m.kind==='error'){if(f===current&&!f.active)return;if(f===current)fail(f,label(f)+' · error: '+m.message);else {f.failed=true;f.error=m.message;clearTimeout(f.readyTimer);f.resolve(false);}}
  else if(m.kind==='warning'&&f===current)say(label(f)+' · warning: '+m.message,true);
 });
 window.addEventListener('keydown',e=>{
  if(e.key==='Escape'){window.close();return;}
  if(e.key==='ArrowRight'||e.key===' '){e.preventDefault();advance();}
  if(e.key==='Enter'&&current)finished(current,'manual confirmation');
 });
 window.playerState=()=>({current:current&&{id:current.art.id,repeat:current.position.repeat,done:current.done,started:!!current.started,failed:!!current.failed,token:current.token},pending:pending&&{id:pending.art.id,ready:pending.ready},phase,advancing,frames:document.querySelectorAll('iframe').length,status:status.textContent});
 fetch('/config.json').then(r=>r.json()).then(c=>{config=c;pending=preload(position);advance();}).catch(e=>say('Cannot start: '+e.message,true));
})();
