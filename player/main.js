'use strict';
const {app,BrowserWindow,screen,session}=require('electron');
const path=require('node:path');
const {loadConfig}=require('./config');
const {createServer}=require('./server');
const {isAllowedRequest}=require('./security');
const root=path.resolve(__dirname,'..'),args=process.argv.slice(2);
let server;
app.whenReady().then(async()=>{
 const displays=screen.getAllDisplays(),primary=screen.getPrimaryDisplay();
 if(args.includes('--list-displays')){console.log(JSON.stringify(displays.map(d=>({id:d.id,label:d.label,bounds:d.bounds,scaleFactor:d.scaleFactor,primary:d.id===primary.id})),null,2));app.quit();return;}
 const displayAt=args.indexOf('--display');
 const requested=displayAt>=0?args[displayAt+1]:null;
 const target=displays.find(d=>String(d.id)===requested)||displays.find(d=>d.id!==primary.id)||primary;
 if(requested&&!displays.some(d=>String(d.id)===requested))console.warn('Display '+requested+' unavailable; falling back to '+target.id);
 const config=loadConfig(root,args.includes('--smoke')?{holdMs:200,fadeMs:100,watchdogMs:10000}:{});
 server=createServer(root,config);await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 const origin='http://127.0.0.1:'+server.address().port;
 const offline=session.fromPartition('artwork-player-'+Date.now());
 offline.setPermissionRequestHandler((wc,p,cb)=>cb(false));
 offline.webRequest.onBeforeRequest((details,cb)=>{const allowed=isAllowedRequest(details.url,origin); if(!allowed)console.warn('OFFLINE BLOCK',details.url);cb({cancel:!allowed});});
 const windowed=args.includes('--windowed');
 const win=new BrowserWindow({...(windowed?{width:1000,height:700,show:true}:{...target.bounds,frame:false,show:true,resizable:false,movable:false}),backgroundColor:'#000000',autoHideMenuBar:true,webPreferences:{session:offline,nodeIntegration:false,contextIsolation:true,sandbox:true,webSecurity:true,backgroundThrottling:false}});
 win.webContents.setWindowOpenHandler(()=>({action:'deny'}));
 win.webContents.on('will-navigate',(e,url)=>{if(!url.startsWith(origin+'/'))e.preventDefault();});
 win.webContents.on('before-input-event',(e,input)=>{if(input.type!=='keyDown')return;if(input.key==='Escape'){e.preventDefault();win.close();return;}const key=({Right:'ArrowRight',Space:' '})[input.key]||input.key;if(['ArrowRight',' ','Enter'].includes(key)){e.preventDefault();win.webContents.executeJavaScript('window.dispatchEvent(new KeyboardEvent(\"keydown\",{key:'+JSON.stringify(key)+'}))').catch(console.error);}});
 win.webContents.on('console-message',(event)=>{console.log('[renderer]',event.message);});
 await win.loadURL(origin+(windowed?'':'/?exhibition=1'));
 if(args.includes('--smoke')){
  setTimeout(async()=>{try{const state=await win.webContents.executeJavaScript('window.playerState()');console.log('SMOKE_STATE '+JSON.stringify(state));if(!state.current||state.frames>2)process.exitCode=1;}catch(e){console.error(e);process.exitCode=1;}finally{win.close();}},15000);
 }
}).catch(e=>{console.error(e);process.exitCode=1;app.quit();});
app.on('window-all-closed',()=>app.quit());app.on('will-quit',()=>{if(server)server.close();});
