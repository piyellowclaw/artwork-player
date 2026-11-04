'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),vm=require('node:vm'),fs=require('node:fs'),path=require('node:path');
const dir=path.resolve(__dirname,'../../artworks/2022-Recursive-and-Blocks');
const source=fs.readFileSync(dir+'/sketch.js','utf8'),original=fs.readFileSync(dir+'/upstream/sketch.js','utf8');
function load(code=source,extra={}){const context=vm.createContext({console,...extra});vm.runInContext(code,context);return context;}
test('Recursive drawing buffer follows wide, portrait, square and ultrawide viewport ratio',()=>{
 const c=load();for(const [w,h]of [[1920,1080],[1080,1920],[1000,1000],[3440,1440],[1,10000]]){
  const size=c.getViewportCanvasSize(w,h,2000);assert.equal(Math.max(size.width,size.height),2000);assert.ok(size.width>=1&&size.height>=1);assert.ok(Math.abs(size.width-size.height*w/h)<=Math.max(1,w/h));
 }
});
test('Recursive image composites full viewport without fixed orientation or letterbox',()=>{
 const images=[],c=load(source,{width:1920,height:1080,BLEND:'blend',blendMode(){},image:(...args)=>images.push(args)});vm.runInContext('mainCanvas={};draw();',c);assert.equal(images.length,1);assert.deepEqual(images[0].slice(1),[0,0,1920,1080]);
});
test('Recursive grid has no fixed paper margins and covers complete buffer',async()=>{
 const calls=[],c=load(source,{capture:(...a)=>calls.push(a)});vm.runInContext('gridW=2;gridH=3;canvasWidth=1600;canvasHeight=900;NYRect=async(...args)=>capture(...args);',c);await c.startDraw();assert.equal(calls.length,6);assert.equal(Math.min(...calls.map(a=>a[0])),0);assert.equal(Math.min(...calls.map(a=>a[1])),0);assert.equal(Math.max(...calls.map(a=>a[0]+a[2])),1600);assert.equal(Math.max(...calls.map(a=>a[1]+a[3])),900);
});
test('Recursive core shape, color and random algorithms remain byte-for-byte function-identical',()=>{
 const a=load(original),b=load();for(const name of ['NYRect','NYTriangle','NYLine','NYRandomColor','NYNoiseMap','fxRandom','sleep'])assert.equal(vm.runInContext(name+'.toString()',a),vm.runInContext(name+'.toString()',b),name);
});
test('Recursive texture remains skipped and final composite precedes noLoop',()=>{
 const active=source.replace(/\/\/[^\r\n]*/g,'');assert.ok(!active.includes('await NYRandomTextureLines()'));assert.match(active,/draw\(\);\s*noLoop\(\);/);
});
