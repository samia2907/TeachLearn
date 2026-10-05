import { spawn } from 'node:child_process';
import { mkdtemp } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import assert from 'node:assert/strict';
const base='http://127.0.0.1:5193';
const profile=await mkdtemp(join(tmpdir(),'techminds-progress-'));
const chrome=spawn('C:/Program Files/Google/Chrome/Application/chrome.exe',['--headless=new','--disable-gpu','--no-first-run','--remote-debugging-port=9358',`--user-data-dir=${profile}`,'about:blank'],{windowsHide:true,stdio:'ignore'});
let ws; const errors=[]; const pause=ms=>new Promise(r=>setTimeout(r,ms));
try {
 let targets; for(let i=0;i<60;i++){try{targets=await(await fetch('http://127.0.0.1:9358/json')).json();break;}catch{await pause(200);}}
 assert.ok(targets);
 ws=new WebSocket(targets.find(t=>t.type==='page').webSocketDebuggerUrl);
 await new Promise(r=>ws.addEventListener('open',r,{once:true}));
 let id=0; const pending=new Map();
 const call=(method,params={})=>new Promise((resolve,reject)=>{const key=++id;pending.set(key,{resolve,reject});ws.send(JSON.stringify({id:key,method,params}));});
 ws.addEventListener('message',async event=>{
  const data=JSON.parse(event.data);
  if(data.id){const p=pending.get(data.id);pending.delete(data.id);data.error?p.reject(data.error):p.resolve(data.result);}
  if(data.method==='Runtime.exceptionThrown')errors.push(data.params.exceptionDetails.exception?.description||data.params.exceptionDetails.text);
  if(data.method!=='Fetch.requestPaused')return;
  const {requestId,request}=data.params;const url=new URL(request.url);let body;
  if(url.pathname==='/__progress-test')body='<html><head><meta name="viewport" content="width=device-width,initial-scale=1"></head><body><div id="root"></div></body></html>';
  else if(url.pathname==='/src/firebase/firebase.js')body='export const auth={get currentUser(){return window.fixture?.auth.currentUser}};export const functions={};export const db={};';
  else if(url.pathname.includes('firebase_functions.js'))body='export const httpsCallable=(_functions,name)=>data=>window.fixture.call(name,data);';
  if(body!==undefined)await call('Fetch.fulfillRequest',{requestId,responseCode:200,responseHeaders:[{name:'Content-Type',value:url.pathname==='/__progress-test'?'text/html':'application/javascript'}],body:Buffer.from(body).toString('base64')});
  else if(url.origin!==base)await call('Fetch.failRequest',{requestId,errorReason:'BlockedByClient'});
  else await call('Fetch.continueRequest',{requestId});
 });
 const evaluate=async expression=>{const result=await call('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true});if(result.exceptionDetails)throw Error(JSON.stringify(result.exceptionDetails));return result.result.value;};
 const wait=async expression=>{for(let i=0;i<100;i++){if(await evaluate(`Boolean(${expression})`))return;await pause(100);}throw Error('Timed out: '+expression+'\n'+errors.join('\n')+'\n'+await evaluate('JSON.stringify({html:document.body.innerHTML,records:fixture.records,writes:fixture.writes,kind:window.kind})')); };
 await call('Page.enable');await call('Runtime.enable');await call('Fetch.enable',{patterns:[{urlPattern:'*'}]});
 await call('Page.navigate',{url:base+'/__progress-test'});await wait('document.querySelector("#root")');
 await evaluate(`import('${base}/@vite/client')`);
 await evaluate(`import('${base}/@react-refresh').then(({default:r})=>{r.injectIntoGlobalHook(window);window.$RefreshReg$=()=>{};window.$RefreshSig$=()=>type=>type;window.__vite_plugin_react_preamble_installed__=true;})`);
 await evaluate(`import('${base}/tests/progress-browser-fixture.jsx')`);
 for(const kind of ['lesson','mission','quiz','coding']){
  if(await evaluate('Boolean(document.querySelector("output"))')) { await evaluate('mount("en",false)'); await pause(350); }
  await evaluate(`localStorage.clear();fixture.records=[{contentId:'c1',lastSectionIndex:2,status:'in_progress',state:{}}];fixture.writes=[];mount('en',true,'/programs/p1','${kind}')`);
  await wait('document.querySelector("output")?.dataset.ready==="true" && document.querySelector("output").textContent==="2"');
  await evaluate('document.querySelector("#next").click()');
  await wait('document.querySelector("output").textContent==="3"');
  await evaluate('mount("en",false)'); // Navigate before debounce: cleanup must flush last slide.
  await wait('fixture.writes.some(item=>item.lastSectionIndex===3)');
  await evaluate(`mount('en',true,'/programs/p1','${kind}')`);
  await wait('document.querySelector("output")?.dataset.ready==="true" && document.querySelector("output").textContent==="3"');
 }
 console.log('PASS shared resume, exact slide restore and navigation flush for lesson/mission/quiz/coding');
 for(const [lang,title,dir] of [['en','Continue where you left off','ltr'],['ar','أكمل من حيث توقفت','rtl'],['he','המשך מהמקום שבו הפסקת','rtl']]){
  await call('Emulation.setDeviceMetricsOverride',{width:375,height:812,deviceScaleFactor:1,mobile:true});
  await evaluate(`mount('${lang}',false,'/login?next=%2Fprograms%2Fp1%2Flessons%2Fc1')`);
  await wait(`document.querySelector('h2')?.textContent===${JSON.stringify(title)}`);
  assert.equal(await evaluate('document.documentElement.dir'),dir);
  assert.equal(await evaluate('document.querySelectorAll(".guest-menu-toggle").length'),1);
  await evaluate('document.querySelector(".guest-menu-toggle").click()');
  await wait('document.querySelector(".guest-menu-panel")');
  assert.equal(await evaluate('new URL(document.querySelector(".guest-menu-start").href).searchParams.get("next")'),'/programs/p1/lessons/c1');
  assert.equal(await evaluate('document.documentElement.scrollWidth<=innerWidth'),true);
 }
 console.log('PASS English/Arabic/Hebrew labels, RTL/LTR, single public menu, return links and mobile width');
 await evaluate('mount("en",false)');await pause(350);
 await evaluate('localStorage.clear();fixture.records=[];fixture.readCalls=0;fixture.writes=[];fixture.legacyWrites=0;fixture.readGate=new Promise(r=>fixture.resolveRead=r);fixture.legacyGate=new Promise(r=>fixture.resolveLegacy=r);mountMission()');
 await wait('document.querySelector(".mission-player h1") && fixture.readCalls===1 && fixture.legacyCalls===1');
 assert.equal(await evaluate('fixture.lastRead.contentId'),'c1');
 assert.equal(await evaluate('fixture.writes.length+fixture.legacyWrites'),0);
 assert.equal(await evaluate('Boolean(document.querySelector(".mission-card"))'),false);
 await evaluate('fixture.resolveRead()');await pause(150);
 assert.equal(await evaluate('fixture.writes.length+fixture.legacyWrites'),0);
 await evaluate('fixture.resolveLegacy()');
 await wait('document.querySelector(".mission-card")');
 assert.equal(await evaluate('fixture.readCalls'),1);
 console.log('PASS actual mission header renders before progress; reads start in parallel; hydration blocks writes and interactions');
 await evaluate('mount("en",false)');await pause(350);
 await evaluate('fixture.readCalls=0;fixture.readGate=Promise.reject(new Error("offline"));fixture.readGate.catch(()=>{});fixture.legacyGate=Promise.resolve();mountMission()');
 await wait('document.querySelector(".mission-player [role=alert]")');
 await pause(600);
 assert.equal(await evaluate('fixture.readCalls'),1);
 assert.ok(await evaluate('Boolean(document.querySelector(".mission-player h1"))'));
 console.log('PASS failed progress request does not retry in a render loop or hide mission header');
 
 assert.deepEqual(errors,[]);
}finally{ws?.close();chrome.kill();}
