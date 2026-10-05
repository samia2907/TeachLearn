// Actual React screens + shared subscription code, with isolated in-memory Firebase.
import { spawn } from 'node:child_process';
import { mkdtemp } from 'node:fs/promises';
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
  await wait('document.querySelector("input[type=search]")');
  await input('input[type=search]','TM-100');await wait('document.querySelectorAll(".access-results button").length===1');
  await evaluate('document.querySelector(".access-results button").click()');
  await input('form select[required]','p1');await pause(150);
  await input('form textarea','Internal note');
  await evaluate('fixture.records.set("lessons/third",{id:"third",programId:"p1",lessonType:"commercial",status:"published",order:3,title:{en:"Third lesson"}});fixture.publish()');
  await evaluate('document.querySelector("form").requestSubmit()');await wait('fixture.records.has("programAccess/student_p1")');
  assert.equal(await evaluate('fixture.calls.find(call=>call.name==="manageProgramAccess").data.userId'),'student');
  await input('form select:has(option[value="range"])','selected');
  await wait('document.querySelectorAll(".access-lesson-options input").length===2');
  assert.ok(!(await evaluate('document.querySelector(".access-lesson-options").textContent')).includes('First lesson'));
  await evaluate('document.querySelectorAll(".access-lesson-options input")[0].click()');
  await evaluate('document.querySelector("form").requestSubmit()');
  await wait('fixture.records.get("programAccess/student_p1").accessScope==="selected"');
  assert.deepEqual(await evaluate('fixture.records.get("programAccess/student_p1").lessonIds'),['second']);
  await input('form select:has(option[value="range"])','range');
  await input('form input[type="number"]:last-of-type','1');
  await evaluate('(()=>{const input=document.querySelectorAll("form input[type=number]")[1];const setter=Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,"value").set;setter.call(input,"2");input.dispatchEvent(new Event("input",{bubbles:true}));input.dispatchEvent(new Event("change",{bubbles:true}));})()');
  await evaluate('document.querySelector("form").requestSubmit()');
  await wait('fixture.records.get("programAccess/student_p1").lessonIds.length===2');
  assert.deepEqual(await evaluate('fixture.records.get("programAccess/student_p1").lessonIds'),['second','third']);
  console.log('PASS selected lesson and lesson range UI resolve to exact lesson IDs');
  await evaluate('fixture.records.set("lessons/draft",{id:"draft",programId:"p1",lessonType:"commercial",status:"draft",order:4,title:{en:"Draft lesson"}});fixture.publish()');
  await wait('document.querySelector(".access-status-badge[data-status=draft]")');
  assert.equal(await evaluate('document.querySelector(".access-status-badge[data-status=draft]").textContent'),'Draft');
  assert.ok(await evaluate('Boolean(document.querySelector(".access-status-badge[data-status=published]"))'));
  await evaluate('document.querySelectorAll("[role=tab]")[2].click()');
  await wait('document.body.textContent.includes("Assign mission parent lessons")');
  await input('.access-detail select','draft');await clickText('Save');
  await wait('fixture.records.get("lessons/first").parentLessonId==="draft"');
  for (const language of ['ar','he']) {
    await input('.access-header select',language);
    await wait(`document.querySelector('.access-page')?.dir==='rtl'`);
    assert.equal(await evaluate('document.documentElement.scrollWidth<=innerWidth'),true);
  }
  await input('.access-header select','en');
  await input('.access-detail select','');await clickText('Save');
  await wait('fixture.records.get("lessons/first").parentLessonId===null');
  await evaluate('fixture.records.delete("lessons/draft");fixture.publish()');
  console.log('PASS owner draft/published badges, explicit mission mapping/unmapping, Arabic/Hebrew RTL');
  await evaluate('fixture.records.get("programs/p1").createdBy="owner";fixture.records.get("programs/p1").lessonCount=99;mount("/owner/programs","owner")');
  await wait('document.body.textContent.includes("2 lessons • 1 missions")');
  console.log('PASS owner card counts actual content types instead of stale lessonCount');
  await evaluate('mount("/owner/programs/p1/lessons","owner")');
  await wait('document.querySelectorAll(".owner-lesson-card").length===3');
  assert.deepEqual(await evaluate('Array.from(document.querySelectorAll(".owner-lesson-number strong"),el=>el.textContent.trim())'),['1','2','🎯']);
  assert.ok((await evaluate('document.body.textContent')).includes('Build Mission'));
  console.log('PASS owner content separates missions and numbers only real lessons');
  await evaluate('mount("/owner/access","owner")');
  await wait('document.querySelector("input[type=search]")');
  await evaluate('document.querySelectorAll("[role=tab]")[3].click()');await wait('document.querySelector("tbody tr")');
  await clickText('Revoke');await wait('fixture.records.get("programAccess/student_p1").active===false');
  await evaluate('document.querySelectorAll("[role=tab]")[1].click()');await wait('document.querySelectorAll("tbody tr").length===2');
  await clickText('Review / note');await wait('document.querySelector("form.access-detail")');await evaluate('document.querySelector("form.access-detail").requestSubmit()');
  await wait('fixture.records.get("accessRequests/student_p1").status==="approved"');
  await clickText('Review / note');await wait('document.querySelector("form.access-detail")');await clickText('Reject');await wait('fixture.records.get("accessRequests/teacher_p1").status==="rejected"');
  console.log('PASS owner: search by student code, UID grant, revoke, approve and reject');
  await evaluate('fixture.records.delete("programAccess/student_p1");fixture.records.delete("accessRequests/student_p1");mount("/programs/p1")');
  await wait('document.querySelectorAll(".program-lesson-item").length===2');
  assert.ok((await evaluate('document.querySelector(".program-lessons-list").textContent')).includes('Free preview'));
  assert.ok(!(await evaluate('document.body.textContent')).includes('FULL_ACCESS_ONLY'));
  await evaluate('document.querySelectorAll(".program-lesson-item")[1].click()');await wait('currentRoute==="/programs/p1/access"');await wait('document.querySelector(".access-whatsapp")');
  await clickText('Request access');await wait('fixture.records.has("accessRequests/student_p1")');
  assert.equal(await evaluate('document.querySelector(".access-primary").disabled'),true);
  const link=await evaluate('document.querySelector(".access-whatsapp").href');assert.ok(decodeURIComponent(link).includes('student@example.test'));assert.ok(decodeURIComponent(link).includes('Computing'));
  for(const language of ['ar','he','en']) {
    await input('.access-header select',language);await wait(`document.documentElement.lang==='${language}'`);
    assert.equal(await evaluate('document.querySelector(".access-page").dir'),language==='en'?'ltr':'rtl');
    for(const width of [390,1280]) {await call('Emulation.setDeviceMetricsOverride',{width,height:900,deviceScaleFactor:1,mobile:width<500});assert.equal(await evaluate('document.documentElement.scrollWidth<=innerWidth'),true);}
  }
  console.log('PASS locked page: metadata only, duplicate request button, localized WhatsApp, Arabic/Hebrew RTL and mobile layout');
  await evaluate('fixture.records.set("programAccess/student_p1",{userId:"student",programId:"p1",accessType:"manual",active:true,expiresAt:null});fixture.publish()');
  await wait('currentRoute==="/programs/p1"');await wait('document.querySelectorAll(".program-lesson-item").length===2');
  await evaluate('document.querySelectorAll(".program-lesson-item")[1].click()');await clickText('▶️ Start Lesson');
  await wait('document.body.textContent.includes("FULL_ACCESS_ONLY")');
  await evaluate('fixture.records.get("programAccess/student_p1").active=false;fixture.publish()');await wait('currentRoute==="/programs/p1/access"');
  await evaluate('fixture.records.set("programAccess/student_p1",{userId:"student",programId:"p1",accessType:"manual",active:true,expiresAt:fixture.stamp(Date.now()+1500)});mount("/programs/p1/lessons/second")');
  await wait('document.body.textContent.includes("FULL_ACCESS_ONLY")');await wait('currentRoute==="/programs/p1/access"');
  console.log('PASS live grant unlock, revoke relock and expiration timer');
  await evaluate('fixture.records.delete("programAccess/student_p1");mount("/programs/p1/lessons/first")');
  await wait('document.querySelector(".mission-player")');
  assert.ok((await evaluate('document.body.textContent')).includes('Free preview'));
  await evaluate('fixture.records.get("lessons/first").parentLessonId="second";fixture.records.set("programAccess/student_p1",{userId:"student",programId:"p1",accessType:"manual",accessScope:"selected",lessonIds:["second"],active:true,expiresAt:null});fixture.publish()');
  await wait('document.querySelector(".mission-player") && !document.body.textContent.includes("Free preview")');
  await evaluate('fixture.records.get("programAccess/student_p1").lessonIds=[];fixture.publish()');
  await wait('currentRoute==="/programs/p1/access"');
  await evaluate('fixture.records.get("programAccess/student_p1").lessonIds=["second"];fixture.records.get("lessons/second").status="draft";mount("/programs/p1/lessons/first")');
  await wait('currentRoute==="/programs/p1/access"');
  await evaluate('fixture.records.get("lessons/second").status="published";fixture.records.get("programAccess/student_p1").lessonIds=["first"];mount("/programs/p1/lessons/first")');
  await wait('document.querySelector(".mission-player")');
  console.log('PASS browser inherited mission access, locked/draft parent denial, existing mission grant compatibility');
  await evaluate('fixture.records.get("lessons/first").parentLessonId=null;fixture.records.delete("programAccess/student_p1")');
  for(const uid of ['student','teacher']) {
    await evaluate('delete fixture.records.get("programs/p1").paddlePriceIds;delete fixture.records.get("programs/p1").paymentProductId;delete fixture.records.get("programs/p1").paymentProvider;delete fixture.records.get("programs/p1").price');
    await evaluate(`mount('/programs','${uid}')`);
    await wait('Array.from(document.querySelectorAll("button")).some(b=>b.textContent.trim()==="Request access")');
    assert.equal(await evaluate('document.querySelector(".marketplace-buy-button").disabled'),false, `${uid}: paid manual CTA must be enabled without Paddle configuration`);
    assert.equal(await evaluate('document.querySelector(".marketplace-buy-button").hasAttribute("disabled")'),false);
    await clickText('Request access');await wait('currentRoute==="/programs/p1/access"');
    await evaluate(`mount('/programs','${uid}','ar')`);
    await wait('Array.from(document.querySelectorAll("button")).some(b=>b.textContent.trim()==="اطلب فتح البرنامج")');
    assert.equal(await evaluate('document.querySelector(".marketplace-buy-button").disabled'),false);
    await clickText('اطلب فتح البرنامج');await wait('currentRoute==="/programs/p1/access"');
    assert.ok(!(await evaluate('document.body.textContent')).includes('Continue with Paddle'));
    await evaluate(`fixture.records.get('users/${uid}').pendingPurchase={type:'program',programId:'p1'};mount('/checkout?type=program','${uid}')`);
    await wait('currentRoute==="/programs/p1/access"');
  }
  for (const uid of ['teacher', 'student']) {
    await evaluate(`delete fixture.records.get('programs/p1').accessType;fixture.records.delete('accessRequests/${uid}_p1');mount('/programs','${uid}')`);
    await wait('Array.from(document.querySelectorAll("button")).some(b=>b.textContent.trim()==="Request access")');
    assert.equal(await evaluate('document.querySelector(".marketplace-buy-button").disabled'), false);
    await clickText('Request access');await wait('currentRoute==="/programs/p1/access" && document.querySelector(".access-whatsapp")');
    assert.ok((await evaluate('document.querySelector("h1").textContent')).includes('Computing'));
    assert.ok(!(await evaluate('document.body.textContent')).includes('FULL_ACCESS_ONLY'));
    await clickText('Request access');await wait(`fixture.records.get('accessRequests/${uid}_p1')?.status==='pending'`);
    assert.equal(await evaluate('document.querySelector(".access-primary").disabled'), true);
    await evaluate(`fixture.records.get('programs/p1').accessType='class';mount('/programs','${uid}')`);
    await wait('Array.from(document.querySelectorAll("button")).some(b=>b.textContent.trim()==="Class access required")');
    assert.equal(await evaluate('document.querySelector(".marketplace-buy-button").disabled'), true);
  }
  console.log('PASS teacher/student legacy CTA, contact details, pending request and explicit class-only exception');
  await evaluate('fixture.records.get("programs/p1").accessType="free";mount("/programs","teacher")');
  await wait('Array.from(document.querySelectorAll("button")).some(b=>b.textContent.trim()==="Open / Continue")');
  await clickText('Open / Continue');await wait('currentRoute==="/programs/p1"');
  await evaluate('fixture.records.get("programs/p1").accessType="paid";fixture.records.set("programAccess/teacher_p1",{userId:"teacher",programId:"p1",accessType:"manual",active:true,expiresAt:null});mount("/programs","teacher")');
  await wait('Array.from(document.querySelectorAll("button")).some(b=>b.textContent.trim()==="Open / Continue")');
  await clickText('Open / Continue');await wait('currentRoute==="/programs/p1"');
  console.log('PASS student/teacher paid marketplace and retained checkout links use manual access; free and entitled programs open');
  for(const language of ['ar','he']) { await evaluate(`mount('/owner/access','owner','${language}')`);await wait(`document.querySelector('.access-page')?.dir==='rtl'`);assert.equal(await evaluate('document.documentElement.scrollWidth<=innerWidth'),true); }
  assert.deepEqual(errors,[]);console.log('PASS preview mission opens without paid progress writes; owner RTL screens render');
} finally { ws?.close(); chrome.kill(); }
