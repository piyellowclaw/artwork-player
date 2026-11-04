'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict');
const {listDisplays,selectDisplay,exhibitionOptions}=require('../display');
const displays=[{id:22,label:'Built-in',bounds:{x:0,y:0,width:1920,height:1080}},{id:99,label:'External',bounds:{x:-2560,y:0,width:2560,height:1440}}],primary=displays[0];
test('display list exposes zero-based indices independent of OS IDs',()=>assert.deepEqual(listDisplays(displays,primary).map(d=>[d.index,d.id]),[[0,22],[1,99]]));
test('display selects index, alias and legacy explicit ID',()=>{assert.equal(selectDisplay(displays,primary,['--display','0']),displays[0]);assert.equal(selectDisplay(displays,primary,['--display-index','1']),displays[1]);assert.equal(selectDisplay(displays,primary,['--display-id','99']),displays[1]);});
test('unspecified selects external then primary',()=>{assert.equal(selectDisplay(displays,primary,[]),displays[1]);assert.equal(selectDisplay([primary],primary,[]),primary);});
for(const args of [['--display'],['--display','-1'],['--display','1.5'],['--display','99'],['--display','NaN'],['--display-id','999'],['--display','0','--display-id','22']])test('invalid display selection fails rather than choosing unintended monitor: '+args.join(' '),()=>assert.throws(()=>selectDisplay(displays,primary,args)));
test('exhibition windows are square opaque shadowless and exact bounds',()=>{const o=exhibitionOptions(displays[1].bounds);for(const k of ['frame','roundedCorners','hasShadow','thickFrame','transparent'])assert.equal(o[k],false);for(const k of ['x','y','width','height'])assert.equal(o[k],displays[1].bounds[k]);});

test('macOS exhibition uses above-menu level; preview makes no native changes',()=>{
 const {configureExhibitionWindow}=require('../display'),calls=[];
 const win={setHasShadow:(...a)=>calls.push(['shadow',...a]),setWindowButtonVisibility:(...a)=>calls.push(['buttons',...a]),setAlwaysOnTop:(...a)=>calls.push(['top',...a])};
 configureExhibitionWindow(win,{windowed:true,platform:'darwin'});assert.deepEqual(calls,[]);
 configureExhibitionWindow(win,{platform:'darwin'});assert.deepEqual(calls,[['shadow',false],['buttons',false],['top',true,'screen-saver']]);
 calls.length=0;configureExhibitionWindow(win,{platform:'linux'});assert.deepEqual(calls,[['shadow',false],['top',true]]);
});
test('exhibition is configured hidden before showing, avoiding ordinary-level flash',()=>assert.equal(exhibitionOptions(displays[0].bounds).show,false));
