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
      export const writeBatch=()=>{throw Error('Unexpected content reorder')};
      export const addDoc=()=>{throw Error('Unexpected content write')};
      export const updateDoc=()=>{throw Error('Unexpected content write')};
      export const runTransaction=async(_db,fn)=>fn({get:async ref=>window.fixture.read(ref),set:(ref,data)=>window.fixture.records.set(ref.path,data)});`;
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
﻿  await evaluate(`
    window.setupCompletion = async () => {
      if(window.testRoot){testRoot.unmount();window.testRoot=null;}
      await new Promise(resolve=>setTimeout(resolve,300));
      localStorage.clear();
      fixture.progress=[];fixture.completions=[];fixture.awards=0;
      fixture.records.get('programs/p1').accessType='free';
      for(const key of [...fixture.records.keys()])if(key.startsWith('lessons/')||key.startsWith('lessonProgress/')||key.startsWith('lessonCompletions/'))fixture.records.delete(key);
      for(const [id,order,type] of [['a',1,'lesson'],['b',2,'mission'],['c',3,'lesson']]){
        fixture.records.set('lessons/'+id,{id,order,programId:'p1',lessonType:'commercial',activityType:type,status:'published',xp:100,xpReward:100,
          title:{en:'Content '+id,ar:'المحتوى '+id,he:'תוכן '+id},
          sections:[{id:'s',type:type==='mission'?'story':'content',title:'Screen '+id,body:'Read',content:'Read'}]});
      }
    };
    const originalCall=fixture.call.bind(fixture);
    fixture.call=async(name,data)=>{
      if(name==='getPurchasedProgram')return {data:{role:'student',program:fixture.records.get('programs/p1'),fullAccess:true,lessons:[...fixture.records.entries()].filter(([k])=>k.startsWith('lessons/')).map(([,v])=>({...v,locked:false}))}};
      if(name==='getContentProgress')return {data:{progress:fixture.progress.filter(p=>!data.contentId||p.contentId===data.contentId)}};
      if(name==='saveContentProgress'){
        fixture.progress=fixture.progress.filter(p=>p.contentId!==data.contentId);
        fixture.progress.push({...data,status:fixture.records.has('lessonCompletions/student_'+data.contentId)?'completed':data.status});
        return {data:{success:true}};
      }
      if(name==='completeLesson'){
        fixture.completions.push(data);
        const path='lessonCompletions/student_'+data.lessonId;
        const alreadyCompleted=fixture.records.has(path);
        if(data.readOnly&&!alreadyCompleted)throw Error('not completed');
        if(!alreadyCompleted){
          fixture.records.set(path,{xpReward:100});fixture.awards++;
          fixture.records.set('lessonProgress/student_'+data.lessonId,{mission:data.mission,status:'completed'});
        }
        const pending=['a','b','c'].filter(id=>!fixture.records.has('lessonCompletions/student_'+id));
        return {data:{xp:100,alreadyCompleted,totalXp:fixture.awards*100,level:1,programCompleted:pending.length===0,programCompletedNow:!alreadyCompleted&&pending.length===0,nextLessonId:pending[0]||null,nextLessonTitle:pending[0]?fixture.records.get('lessons/'+pending[0]).title:null}};
      }
      return originalCall(name,data);
    };
  `);
  for(const [lang,width] of [['en',1440],['ar',320],['he',768]]){
    await call('Emulation.setDeviceMetricsOverride',{width,height:900,deviceScaleFactor:1,mobile:width<600});
    await evaluate(`await setupCompletion();mount('/programs/p1/lessons/a','student','${lang}')`);
    await wait('document.querySelector(".player-next") && !document.querySelector(".player-next").disabled');
    await evaluate('document.querySelector(".player-next").click()');
    await wait('document.querySelector(".complete-next")');
    assert.equal(await evaluate('getComputedStyle(document.querySelector(".program-player-complete")).direction'),lang==='en'?'ltr':'rtl');
    assert.equal(await evaluate('document.documentElement.scrollWidth<=innerWidth'),true);
    await writeFile('artifacts/completion-lesson-'+lang+'.png',Buffer.from((await call('Page.captureScreenshot',{format:'png'})).data,'base64'));
    await evaluate('document.querySelector(".complete-next").click()');
    await wait('currentRoute==="/programs/p1/lessons/b" && document.querySelector(".mission-navigation .mission-primary")');
    assert.equal(await evaluate('fixture.completions.filter(c=>c.lessonId==="a"&&!c.readOnly).length'),1);
    await evaluate('document.querySelector(".mission-navigation .mission-primary").click()');
    await wait('document.querySelector(".mission-next .mission-primary")');
    assert.equal(await evaluate('document.documentElement.scrollWidth<=innerWidth'),true);
    await writeFile('artifacts/completion-mission-'+lang+'.png',Buffer.from((await call('Page.captureScreenshot',{format:'png'})).data,'base64'));
    await evaluate('document.querySelector(".mission-complete-actions button").click()');
    await wait('document.querySelector("#mission-screen-title")');
    await evaluate('document.querySelector(".mission-navigation .mission-primary").click()');
    await wait('document.querySelector(".mission-next .mission-primary")');
    assert.equal(await evaluate('fixture.awards'),2);
    await evaluate('document.querySelector(".mission-next .mission-primary").click()');
    await wait('currentRoute==="/programs/p1/lessons/c" && document.querySelector(".player-next") && !document.querySelector(".player-next").disabled');
    assert.equal(await evaluate('fixture.completions.filter(c=>c.lessonId==="b"&&!c.readOnly).length'),1);
    await evaluate('document.querySelector(".player-next").click()');
    await wait('document.querySelector(".program-player-complete")');
    assert.equal(await evaluate('Boolean(document.querySelector(".complete-next"))'),false);
    assert.equal(await evaluate('fixture.awards'),3);
    await evaluate(`mount('/programs/p1/lessons/b','student','${lang}')`);
    await wait('document.querySelector(".mission-complete")');
    assert.equal(await evaluate('Boolean(document.querySelector(".mission-next"))'),false);
    assert.equal(await evaluate('fixture.awards'),3);
    assert.equal(await evaluate('fixture.completions.at(-1).readOnly'),true);
    await evaluate(`mount('/programs/p1/lessons/a','student','${lang}')`);
    await wait('document.querySelector(".program-player-complete") && fixture.completions.at(-1).lessonId==="a" && fixture.completions.at(-1).readOnly');
    assert.equal(await evaluate('fixture.awards'),3);
    console.log('PASS lesson → mission → lesson, review, last content, reopen and XP once',lang,width);
  }
  assert.deepEqual(errors,[]);
} finally {ws?.close();chrome.kill();}
