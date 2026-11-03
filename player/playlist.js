/* Playlist RNG is separate from every artwork's original RNG. */
(function(root,factory){if(typeof module==='object'&&module.exports)module.exports=factory();else root.ArtworkPlaylist=factory();})(globalThis,()=>{
 'use strict';
 function createPlaylist(count,repetitions,{shuffle=true,random=Math.random}={}){
  if(!Number.isInteger(count)||count<1||!Number.isInteger(repetitions)||repetitions<1)throw Error('Invalid playlist dimensions');
  const successors=new WeakMap();
  function bag(last){
   const order=Array.from({length:count},(_,i)=>i);
   if(shuffle){
    for(let i=count-1;i>0;i--){const j=Math.floor(random()*(i+1));[order[i],order[j]]=[order[j],order[i]];}
    if(count>1&&order[0]===last){const j=1+Math.floor(random()*(count-1));[order[0],order[j]]=[order[j],order[0]];}
   }
   return Object.freeze(order);
  }
  function position(order,slot,repeat,round){return {index:order[slot],slot,repeat,round,order};}
  return {
   initial:()=>position(bag(),0,0,0),
   next(p){
    if(p.repeat+1<repetitions)return position(p.order,p.slot,p.repeat+1,p.round);
    if(p.slot+1<count)return position(p.order,p.slot+1,0,p.round);
    // Preload may peek repeatedly; never reshuffle/consume a round twice.
    if(!successors.has(p.order))successors.set(p.order,bag(p.index));
    return position(successors.get(p.order),0,0,p.round+1);
   }
  };
 }
 return {createPlaylist};
});
