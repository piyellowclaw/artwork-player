'use strict';
const http=require('node:http'),fs=require('node:fs'),path=require('node:path');
const mime={'.html':'text/html','.js':'text/javascript','.json':'application/json','.css':'text/css','.svg':'image/svg+xml','.png':'image/png','.jpg':'image/jpeg','.jpeg':'image/jpeg','.woff':'font/woff','.woff2':'font/woff2','.webp':'image/webp','.mp4':'video/mp4','.glsl':'text/plain'};
function prepareHtml(html, artworkPath=""){
 const tree=require('parse5').parse(html,{sourceCodeLocationInfo:true}),edits=[];
 let insert=0;
 function walk(node){
  const loc=node.sourceCodeLocation;
  if(node.nodeName==='#documentType'&&loc)insert=Math.max(insert,loc.endOffset);
  if(node.tagName==='head'&&loc&&loc.startTag)insert=loc.startTag.endOffset;
  for(const attr of node.attrs||[]){
   if(node.tagName!=='script'&&/^on/i.test(attr.name)&&loc&&loc.attrs&&loc.attrs[attr.name]){const at=loc.attrs[attr.name];edits.push({start:at.startOffset,end:at.startOffset+attr.name.length,text:'data-art-event-'+attr.name});}
  }
  if(node.tagName==='script'&&loc&&loc.startTag){
   const src=node.attrs.find(a=>a.name==='src')?.value;
   const body=html.slice(loc.startTag.endOffset,loc.endTag?.startOffset||loc.endOffset);
   const analytics=src&&/^https:\/\/www\.googletagmanager\.com\/gtag\/js\?/.test(src);
   const analyticsInit=!src&&/^\s*window\.dataLayer\s*=/.test(body)&&body.includes("gtag('config', 'G-D3VYKTX0TN')");
   const unused=artworkPath==='artworks/2023-Human-Flow/index.html'&&src==='colorSetting.js';
   if(analytics||analyticsInit||unused){edits.push({start:loc.startOffset,end:loc.endOffset,text:'<!-- player omitted: '+(unused?'audited unused upstream 404':'analytics')+' -->'});return;}
   const type=node.attrs.find(a=>a.name==='type');
   if(!type||['','text/javascript','application/javascript','module'].includes(type.value.toLowerCase())){
    const start=loc.startTag.startOffset,end=loc.startTag.endOffset;
    let tag=html.slice(start,end);
    if(type){const at=loc.attrs.type;tag=tag.slice(0,at.startOffset-start)+tag.slice(at.endOffset-start);}
    const original=type?' data-art-type="'+type.value.replace(/&/g,'&amp;').replace(/"/g,'&quot;')+'"':'';
    tag=tag.slice(0,-1)+' data-art-held="true" type="application/x-artwork-held"'+original+'>';
    edits.push({start,end,text:tag});
   }
  }
  for(const child of node.childNodes||[])walk(child);
 }
 walk(tree);edits.push({start:insert,end:insert,text:'<script src="/player/artwork-bridge.js"></script>'});
 for(const e of edits.sort((a,b)=>b.start-a.start))html=html.slice(0,e.start)+e.text+html.slice(e.end);
 return html;
}
function createServer(root,config){
 root=fs.realpathSync(root);
 const server=http.createServer((req,res)=>{
  res.setHeader('Cache-Control','no-store'); res.setHeader('X-Content-Type-Options','nosniff');
  try{
   const url=new URL(req.url,'http://localhost');
   if(url.pathname==='/config.json'){res.setHeader('Content-Type','application/json');return res.end(JSON.stringify(config));}
   let rel=decodeURIComponent(url.pathname).replace(/^\//,''); if(!rel)rel='player/index.html';
   if(!(rel.startsWith('player/')||rel.startsWith('artworks/')))throw Error('Forbidden');
   const file=path.resolve(root,rel); if(!file.startsWith(root+path.sep))throw Error('Forbidden');
   const real=fs.realpathSync(file); if(!real.startsWith(root+path.sep))throw Error('Forbidden');
   let data=fs.readFileSync(real); const ext=path.extname(file).toLowerCase();
   if(ext!=='.html')res.setHeader('Cache-Control','private, max-age=3600');
   res.setHeader('Content-Type',mime[ext]||'application/octet-stream');
   if(ext==='.html'&&rel.startsWith('artworks/'))data=prepareHtml(data.toString(),rel);
   res.end(data);
  }catch(e){res.statusCode=404;res.end('Not found');}
 }); return server;
}
module.exports={createServer,prepareHtml};
