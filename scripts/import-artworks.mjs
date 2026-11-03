import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
const names=['2023-Generative-Succulent','2023-Folding','2023-Human-Flow','2023-Refractions','2023-Sketching-Clouds','2023-Wire-City','2023-Zen-Pots','2022-Recursive-and-Blocks'];
const root=path.resolve('artworks');
const manifest=[];
for(const id of names){if(await fs.stat(path.join(root,id)).catch(()=>null))throw Error('Artwork folder already exists; importer refuses to overwrite local edits: '+id);}
for(const id of names){
 const base=new URL('https://sketch.newyellow.xyz/'+id+'/');
 const queue=['index.html'],seen=new Set(),files=[];
 while(queue.length){
  const rel=queue.shift();if(seen.has(rel))continue;seen.add(rel);
  const url=new URL(rel,base);if(!url.href.startsWith(base.href))throw Error('outside base '+url);
  const res=await fetch(url);if(!res.ok){console.error('MISSING',url.href,res.status);files.push({path:rel,status:res.status,url:url.href});continue;}
  const bytes=Buffer.from(await res.arrayBuffer()),dest=path.join(root,id,rel);
  await fs.mkdir(path.dirname(dest),{recursive:true});await fs.writeFile(dest,bytes);
  files.push({path:rel,bytes:bytes.length,sha256:crypto.createHash('sha256').update(bytes).digest('hex'),url:url.href});
  if(/\.(html|js|css)$/i.test(rel)&& !/(p5|jquery|three|paper|fxhash).*min\.js$/i.test(rel)){
   const src=bytes.toString(),refs=[];
   if(/\.html$/.test(rel))for(const m of src.matchAll(/(?:src|href)\s*=\s*['"]([^'"#]+)['"]/g))refs.push(m[1]);
   for(const m of src.matchAll(/(?:loadImage|loadFont|loadJSON|loadStrings|loadShader|loadSound|fetch|importScripts)\s*\(\s*['"]([^'"]+)['"]/g))refs.push(m[1]);
   if(/\.css$/.test(rel))for(const m of src.matchAll(/url\(['"]?([^)'"\s]+)['"]?\)/g))refs.push(m[1]);
   for(const ref of refs){
    if(/^(data:|https?:|\/\/|mailto:|javascript:)/i.test(ref))continue;
    const target=new URL(ref,url);if(!target.href.startsWith(base.href))throw Error('relative escapes artwork: '+target);
    const r=decodeURIComponent(target.pathname.slice(base.pathname.length));if(r&&!seen.has(r))queue.push(r);
   }
  }
 }
 await fs.writeFile(path.join(root,id,'SOURCE.json'),JSON.stringify({source:base.href,importedAt:new Date().toISOString(),files},null,2)+'\n');
 manifest.push({id,title:id.replace(/^202[23]-/,'').replaceAll('-',' '),path:'artworks/'+id+'/index.html',completion:'manual'});
 console.log(id,files.length,files.reduce((n,f)=>n+(f.bytes||0),0));
}
await fs.writeFile(path.join(root,'manifest.json'),JSON.stringify({artworks:manifest},null,2)+'\n');
