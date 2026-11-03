import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
let unchanged=0,modified=0,missing=0;
for(const dir of await fs.readdir('artworks')){
 const meta=path.join('artworks',dir,'SOURCE.json');if(!await fs.stat(meta).catch(()=>null))continue;
 const source=JSON.parse(await fs.readFile(meta,'utf8'));
 for(const f of source.files){
  if(f.status){missing++;continue;}
  let data=await fs.readFile(path.join('artworks',dir,f.path));
  const hash=b=>crypto.createHash('sha256').update(b).digest('hex');
  if(hash(data)===f.sha256){unchanged++;continue;}
  if(dir==='2022-Recursive-and-Blocks'&&f.path==='sketch.js'){
   const restored=data.toString().replace('  // Background texture pass removed for local playback (requested by Newyellow).\n  // await NYRandomTextureLines();','  await NYRandomTextureLines();');
   if(hash(restored)!==f.sha256)throw Error('Unexpected Recursive source change');
   modified++;continue;
  }
  throw Error('Unexpected source change: '+dir+'/'+f.path);
 }
}
console.log(JSON.stringify({unchanged,intentionallyModified:modified,upstreamMissing:missing}));
if(modified!==1||missing!==1)throw Error('Unexpected import inventory');
