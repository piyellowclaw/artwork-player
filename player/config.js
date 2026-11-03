'use strict';
const fs = require('node:fs');
const path = require('node:path');
const defaults = {shuffle:true,repetitions:3,holdMs:10000,fadeMs:600,readyTimeoutMs:30000,watchdogMs:900000};
function loadConfig(root, override={}) {
 const raw=JSON.parse(fs.readFileSync(path.join(root,'artworks/manifest.json'),'utf8'));
 const artworks=Array.isArray(raw)?raw:raw.artworks;
 if(!Array.isArray(artworks)||!artworks.length) throw Error('Manifest must contain artworks');
 const config={...defaults,...(!Array.isArray(raw)&&raw.config||{}),...override};
 if(typeof config.shuffle!=='boolean')throw Error('Invalid shuffle');
 for(const key of Object.keys(defaults).filter(key=>key!=='shuffle')) if(!Number.isFinite(config[key])||config[key]<(key==='repetitions'?1:0)) throw Error('Invalid '+key);
 config.repetitions=Math.floor(config.repetitions);
 const ids=new Set();
 config.artworks=artworks.map(a=>{
  if(!a.id||ids.has(a.id)) throw Error('Missing/duplicate artwork id'); ids.add(a.id);
  if(typeof a.path!=='string'||!a.path.startsWith('artworks/')||path.isAbsolute(a.path)||a.path.split('/').includes('..')) throw Error('Unsafe artwork path');
  if(!fs.statSync(path.join(root,a.path)).isFile()) throw Error('Missing artwork '+a.path);
  const completion=a.completion||'manual';
  if(!['fxpreview','noLoop','either','setup','manual','timeout'].includes(completion)) throw Error('Unknown completion '+completion);
  if(completion==='timeout'&&!(a.durationMs>0)) throw Error('timeout completion requires durationMs');
  for(const k of ['durationMs','completionDelayMs','watchdogMs','holdMs']) if(a[k]!==undefined&&(!Number.isFinite(a[k])||a[k]<0)) throw Error('Invalid artwork '+k);
  return {...a,completion};
 }); return config;
}
function nextPosition(index,repeat,count,repetitions){return repeat+1<repetitions?{index,repeat:repeat+1}:{index:(index+1)%count,repeat:0};}
module.exports={loadConfig,defaults,nextPosition};
