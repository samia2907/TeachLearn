// Actual React screens + shared subscription code, with isolated in-memory Firebase.
import { spawn } from 'node:child_process';
import { mkdtemp, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import assert from 'node:assert/strict';
const base = process.env.TEST_BASE_URL || 'http://127.0.0.1:5191';
const profile = await mkdtemp(join(tmpdir(), 'techminds-access-ui-'));
const chrome = spawn(process.env.CHROME_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe', ['--headless=new', '--disable-gpu', '--no-first-run', '--remote-debugging-port=9356', `--user-data-dir=${profile}`, 'about:blank'], { windowsHide: true, stdio: 'ignore' });
let ws; const errors = [];
const pause = ms => new Promise(resolve => setTimeout(resolve, ms));
try {
  let targets;
  for (let i=0;i<60;i++) { try { targets=await (await fetch('http://127.0.0.1:9356/json')).json(); break; } catch { await pause(200); } }
  assert.ok(targets, 'Chrome started');
  ws = new WebSocket(targets.find(target => target.type === 'page').webSocketDebuggerUrl);
  await new Promise(resolve => ws.addEventListener('open', resolve, { once: true }));
  let id=0; const pending=new Map();
  const call = (method, params={}) => new Promise((resolve,reject) => { const key=++id; pending.set(key,{resolve,reject}); ws.send(JSON.stringify({id:key,method,params})); });
  ws.addEventListener('message', async event => {
    const data=JSON.parse(event.data);
    if(data.id) { const task=pending.get(data.id); pending.delete(data.id); if(data.error)task.reject(data.error);else task.resolve(data.result); }
    if(data.method==='Runtime.exceptionThrown') errors.push(data.params.exceptionDetails.exception?.description || data.params.exceptionDetails.text);
    if(data.method!=='Fetch.requestPaused') return;
    const {requestId,request}=data.params; const url=new URL(request.url); let body;
    if(url.pathname==='/__manual-access-test') body='<html><head><meta name="viewport" content="width=device-width,initial-scale=1"></head><body style="margin:0"><div id="root"></div></body></html>';
    else if(url.pathname==='/src/firebase/firebase.js') body='export const auth=window.fixture.auth; export const db={}; export const functions={}; export const app={}; export default app;';
    else if(url.pathname==='/src/firebase/userProfile.js') body='export const loadUserProfile=async()=>null;';
    else if(url.pathname.includes('firebase_auth.js')) body='export const onAuthStateChanged=(_auth,callback)=>{queueMicrotask(()=>callback(null));return()=>{}};';
    else if(url.pathname.includes('firebase_functions.js')) body='export const httpsCallable=(_functions,name)=>data=>window.fixture.call(name,data);';
    else if(url.pathname.includes('firebase_firestore.js')) body=`
      export const doc=(_db,...parts)=>({path:parts.join('/')});
      export const collection=(_db,path)=>({path,collection:true});
      export const where=(field,op,value)=>({field,value});
      export const query=(ref,filter)=>({...ref,filter});
      export const onSnapshot=(ref,callback)=>window.fixture.subscribe(ref,callback);
      export const getDoc=async ref=>window.fixture.read(ref);
      export const serverTimestamp=()=>null;
      export const increment=value=>value;
      export const writeBatch=()=>{const writes=[];return{update:(ref,data)=>writes.push([ref,data]),commit:async()=>{for(const [ref,data] of writes)Object.assign(window.fixture.records.get(ref.path),data);window.fixture.publish();}}};
      export const addDoc=()=>{throw Error('Unexpected content write')};
      export const updateDoc=async(ref,data)=>{Object.assign(window.fixture.records.get(ref.path),data);window.fixture.publish();};
      export const runTransaction=()=>{throw Error('Unexpected real progress write in preview')};`;
    if(body!==undefined) await call('Fetch.fulfillRequest',{requestId,responseCode:200,responseHeaders:[{name:'Content-Type',value:url.pathname==='/__manual-access-test'?'text/html':'application/javascript'}],body:Buffer.from(body).toString('base64')});
    else if(url.origin!==base) await call('Fetch.failRequest',{requestId,errorReason:'BlockedByClient'});
    else await call('Fetch.continueRequest',{requestId});
  });
  const evaluate=async expression=>{const result=await call('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true,replMode:true});if(result.exceptionDetails)throw new Error(JSON.stringify(result.exceptionDetails));return result.result.value;};
  const wait=async expression=>{for(let i=0;i<120;i++){if(await evaluate(`Boolean(${expression})`))return;await pause(100);}throw Error(`Timed out: ${expression}\n${errors.join('\n')}`);};
  const input=async (selector,value)=>evaluate(`(() => {const input=document.querySelector(${JSON.stringify(selector)});const proto=input.tagName==='SELECT'?HTMLSelectElement.prototype:input.tagName==='TEXTAREA'?HTMLTextAreaElement.prototype:HTMLInputElement.prototype;Object.getOwnPropertyDescriptor(proto,'value').set.call(input,${JSON.stringify(value)});input.dispatchEvent(new Event(input.tagName==='SELECT'?'change':'input',{bubbles:true}));})()`);
  const clickText=async text=>evaluate(`Array.from(document.querySelectorAll('button')).find(button=>button.textContent.trim()===${JSON.stringify(text)}).click()`);
  await call('Page.enable');await call('Runtime.enable');await call('Fetch.enable',{patterns:[{urlPattern:'*'}]});
  await call('Page.navigate',{url:base+'/__manual-access-test'});await wait('document.querySelector("#root")');
  await evaluate(`
    const refresh=(await import('/@react-refresh')).default;refresh.injectIntoGlobalHook(window);window.$RefreshReg$=()=>{};window.$RefreshSig$=()=>type=>type;window.__vite_plugin_react_preamble_installed__=true;
    window.fixture=(await import('/tests/manual-access-browser-fixture.js')).createFixture();
    const pageSource=await (await fetch('/src/pages/OwnerAccessManagement.jsx')).text();
    const mainSource=await (await fetch('/src/main.jsx')).text();
    window.React=(await import(pageSource.match(/"([^"]*deps[/]react[.]js[^"]*)"/)[1])).default;
    const dom=await import(mainSource.match(/"([^"]*react-dom_client[^"]*)"/)[1]);window.createRoot=dom.createRoot||dom.default.createRoot;
    const routing=await import(pageSource.match(/"([^"]*react-router-dom[^"]*)"/)[1]);window.router=routing.MemoryRouter?routing:routing.default;
    window.LanguageProvider=(await import('/src/context/LanguageContext.jsx')).LanguageProvider;
    window.Owner=(await import('/src/pages/OwnerAccessManagement.jsx')).default;
    window.OwnerPrograms=(await import('/src/pages/OwnerPrograms.jsx')).default;
    window.OwnerLessons=(await import('/src/pages/OwnerProgramLessons.jsx')).default;
    window.Marketplace=(await import('/src/pages/ProgramsMarketplace.jsx')).default;
    window.Checkout=(await import('/src/pages/Checkout.jsx')).default;
    window.Access=(await import('/src/pages/ProgramAccess.jsx')).default;
    window.Overview=(await import('/src/pages/ProgramLearning.jsx')).default;
    window.Player=(await import('/src/pages/ProgramLessonPlayer.jsx')).default;
    window.Location=()=>{const loc=router.useLocation();React.useEffect(()=>{window.currentRoute=loc.pathname},[loc]);return null};
    window.mount=(path,uid='student',lang='en')=>{
      if(window.testRoot)window.testRoot.unmount();fixture.auth.currentUser={uid};localStorage.setItem('TechMinds-language',lang);
      window.testRoot=createRoot(document.querySelector('#root'));
      const e=React.createElement;
      testRoot.render(e(LanguageProvider,null,e(router.MemoryRouter,{initialEntries:[path]},e(Location),e(router.Routes,null,
        e(router.Route,{path:'/owner/access',element:e(Owner)}),
        e(router.Route,{path:'/owner/programs',element:e(OwnerPrograms)}),
        e(router.Route,{path:'/owner/programs/:programId/lessons',element:e(OwnerLessons)}),
        e(router.Route,{path:'/programs',element:e(Marketplace)}),
        e(router.Route,{path:'/checkout',element:e(Checkout)}),
        e(router.Route,{path:'/programs/:programId',element:e(Overview)}),
        e(router.Route,{path:'/programs/:programId/access',element:e(Access)}),
        e(router.Route,{path:'/programs/:programId/lessons/:lessonId',element:e(Player)})
      ))));
    };
    mount('/owner/access','owner');
  `);
﻿  await evaluate(`fixture.records.get('programs/p1').createdBy='owner';fixture.records.get('programs/p1').accessType='free';fixture.records.set('lessons/third',{...fixture.records.get('lessons/second'),id:'third',order:3,title:{en:'Long title '.repeat(20),ar:'عنوان طويل '.repeat(20),he:'כותרת ארוכה '.repeat(20)}})`);
  for(const width of [320,390,768,1440]) for(const lang of ['en','ar','he']){
    await call('Emulation.setDeviceMetricsOverride',{width,height:900,deviceScaleFactor:1,mobile:width<600});
    await evaluate(`mount('/owner/programs/p1/lessons','owner','${lang}')`);
    await wait('document.querySelectorAll(".owner-lesson-card").length===3');
    assert.equal(await evaluate('getComputedStyle(document.querySelector(".owner-program-lessons-page")).direction'),lang==='en'?'ltr':'rtl');
    assert.equal(await evaluate('document.documentElement.scrollWidth<=innerWidth'),true,`lessons overflow ${width} ${lang}`);
    assert.equal(await evaluate('Array.from(document.querySelectorAll(".owner-lesson-actions button,.owner-lesson-order-actions button")).every(b=>b.getBoundingClientRect().height>=44)'),true);
    if(lang==='ar'&&(width===390||width===1440))await evaluate('document.querySelector(".owner-lesson-card").scrollIntoView()');
    if(lang==='ar'&&(width===390||width===1440))await writeFile('artifacts/owner-lessons-'+width+'.png',Buffer.from((await call('Page.captureScreenshot',{format:'png'})).data,'base64'));
    assert.equal(await evaluate('Array.from(document.querySelectorAll(".owner-lesson-card")).every(e=>e.scrollWidth<=e.clientWidth)'),true);
    await evaluate('document.querySelector(".owner-edit-lesson-button").click()');
    await wait('document.querySelector(".owner-lesson-modal")');
    assert.equal(await evaluate('document.querySelector(".owner-lesson-modal").scrollWidth<=document.querySelector(".owner-lesson-modal").clientWidth'),true);
    assert.equal(await evaluate('document.documentElement.scrollWidth<=innerWidth'),true);
    await evaluate(`mount('/owner/programs','owner','${lang}')`);
    await wait('document.querySelector(".program-edit-button")');
    await evaluate('document.querySelector(".program-edit-button").click()');
    await wait('document.querySelector(".program-translations")');
    assert.equal(await evaluate('document.documentElement.scrollWidth<=innerWidth'),true,`program overflow ${width} ${lang}`);
    assert.deepEqual(await evaluate('Array.from(document.querySelectorAll(".program-language-fields input")).map(e=>e.dir)'),['rtl','rtl','ltr']);
    assert.equal(await evaluate('document.querySelector(".owner-program-modal").getBoundingClientRect().height<=innerHeight'),true);
    assert.equal(await evaluate('document.querySelector(".owner-program-modal").scrollWidth<=document.querySelector(".owner-program-modal").clientWidth'),true);
    if(lang==='he'&&width===390)await writeFile('artifacts/owner-program-mobile.png',Buffer.from((await call('Page.captureScreenshot',{format:'png'})).data,'base64'));
    console.log('PASS Owner responsive',width,lang);
  }
  await evaluate("mount('/owner/programs/p1/lessons','owner','en')");
  await wait('document.querySelectorAll(".owner-lesson-card").length===3');
  await evaluate('document.querySelector(".owner-lesson-order-actions button:not(:disabled)").click()');
  await wait('fixture.records.get("lessons/second").order===3');
  assert.equal(await evaluate('fixture.records.get("lessons/third").order'),2);
  await evaluate('document.querySelector(".owner-edit-lesson-button").click()');
  await wait('document.querySelector(".owner-lesson-save")');
  await evaluate('document.querySelector(".owner-lesson-save").click()');
  await wait('!document.querySelector(".owner-lesson-modal")');
  console.log('PASS lesson reorder and lesson Edit/Save');
  await evaluate("delete fixture.records.get('programs/p1').title.he;delete fixture.records.get('programs/p1').description.he;mount('/owner/programs','owner','he')");
  await wait('document.querySelector(".program-edit-button")');
  await evaluate('document.querySelector(".program-edit-button").click()');
  await wait('document.querySelector(".program-translations")');
  assert.equal(await evaluate('document.querySelector("input[lang=he]").value'),'');
  assert.equal(await evaluate('document.querySelector("input[lang=he]").required'),false);
  await input('input[lang=he]','תוכנית בדיקה');
  await input('textarea[lang=he]','תיאור בדיקה');
  await evaluate('document.querySelector(".owner-program-save").click()');
  await wait('fixture.records.get("programs/p1").title.he==="תוכנית בדיקה"');
  assert.equal(await evaluate('fixture.records.get("programs/p1").description.he'),'תיאור בדיקה');
  await wait('!document.querySelector(".owner-program-modal")');
  await evaluate('document.querySelector(".program-edit-button").click()');
  await wait('document.querySelector("input[lang=he]")?.value==="תוכנית בדיקה"');
  console.log('PASS legacy empty Hebrew fields, Hebrew save and reload');
  assert.deepEqual(errors,[]);
} finally { ws?.close(); chrome.kill(); }
