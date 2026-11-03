'use strict';
function listDisplays(displays,primary){return displays.map((d,index)=>({index,id:d.id,label:d.label,bounds:d.bounds,scaleFactor:d.scaleFactor,primary:d.id===primary.id}));}
function selectDisplay(displays,primary,args){
 if(!displays.length)throw Error('No connected displays');
 const flags=['--display','--display-index','--display-id'].filter(f=>args.includes(f));
 if(flags.length>1)throw Error('Use only one display selector');
 if(!flags.length)return displays.find(d=>d.id!==primary.id)||primary;
 const flag=flags[0],value=args[args.indexOf(flag)+1];
 if(value===undefined||!/^\d+$/.test(value))throw Error(flag+' requires a nonnegative integer');
 const n=Number(value);
 if(!Number.isSafeInteger(n))throw Error('Invalid display selector');
 const target=flag==='--display-id'?displays.find(d=>d.id===n):displays[n];
 if(!target)throw Error('Display '+(flag==='--display-id'?'ID ':'index ')+n+' not found; use --list-displays');
 return target;
}
function exhibitionOptions(bounds){return {...bounds,frame:false,roundedCorners:false,hasShadow:false,thickFrame:false,transparent:false,show:true,resizable:false,movable:false};}
module.exports={listDisplays,selectDisplay,exhibitionOptions};
