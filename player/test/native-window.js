'use strict';
// Hidden native window only: never moves/focuses or takes over a monitor.
const {app,BrowserWindow}=require('electron');
const assert=require('node:assert/strict');
const {exhibitionOptions}=require('../display');
let win;
app.whenReady().then(async()=>{
 const bounds={x:100,y:100,width:640,height:480};
 win=new BrowserWindow({...exhibitionOptions(bounds),show:false,backgroundColor:'#000000',webPreferences:{sandbox:true,nodeIntegration:false,contextIsolation:true}});
 win.setHasShadow(false);if(process.platform==='darwin')win.setWindowButtonVisibility(false);
 await win.loadURL('data:text/html,<html style="margin:0;background:black"><body style="margin:0;background:black"></body></html>');
 assert.equal(win.isVisible(),false);assert.equal(win.hasShadow(),false);
 assert.deepEqual(win.getBounds(),bounds);
 assert.deepEqual(win.getContentBounds(),bounds);
 console.log('NATIVE_WINDOW_PASS '+JSON.stringify({visible:win.isVisible(),hasShadow:win.hasShadow(),bounds:win.getBounds(),contentBounds:win.getContentBounds(),roundedCornersRequested:false}));
}).catch(e=>{console.error(e);process.exitCode=1;}).finally(()=>{if(win)win.destroy();app.quit();});
