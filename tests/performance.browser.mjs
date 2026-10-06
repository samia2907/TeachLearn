// Run build-performance-fixture.mjs, then preview dist/performance-fixture on 5194.
import { spawn } from 'node:child_process';
import { mkdtemp } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import assert from 'node:assert/strict';
const base = 'http://127.0.0.1:5194';
const profile = await mkdtemp(join(tmpdir(), 'techminds-performance-'));
const chrome = spawn('C:/Program Files/Google/Chrome/Application/chrome.exe', ['--headless=new', '--disable-gpu', '--no-first-run', '--remote-debugging-port=9361', `--user-data-dir=${profile}`, 'about:blank'], { windowsHide: true, stdio: 'ignore' });
const pause = ms => new Promise(resolve => setTimeout(resolve, ms));
let ws;
try {
  let targets;
  for (let i = 0; i < 60; i++) { try { targets = await (await fetch('http://127.0.0.1:9361/json')).json(); break; } catch { await pause(200); } }
  ws = new WebSocket(targets.find(target => target.type === 'page').webSocketDebuggerUrl);
  await new Promise(resolve => ws.addEventListener('open', resolve, { once: true }));
  let id = 0; const pending = new Map(), requests = [], errors = [];
  const call = (method, params = {}) => new Promise((resolve, reject) => { const key = ++id; pending.set(key, { resolve, reject }); ws.send(JSON.stringify({ id: key, method, params })); });
  ws.addEventListener('message', async event => {
    const data = JSON.parse(event.data);
    if (data.id) { const p = pending.get(data.id); pending.delete(data.id); data.error ? p.reject(data.error) : p.resolve(data.result); }
    if (data.method === 'Runtime.exceptionThrown') errors.push(data.params.exceptionDetails.exception?.description || data.params.exceptionDetails.text);
    if (data.method !== 'Fetch.requestPaused') return;
    const { requestId, request } = data.params; const url = new URL(request.url);
    requests.push(url.pathname);
    // Separate foreground imports from unchanged background PWA precaching.
    if (url.origin !== base || url.pathname === '/registerSW.js') return call('Fetch.failRequest', { requestId, errorReason: 'BlockedByClient' });
    if (/\/(StudentDashboard|ProgramLearning|ProgramLessonPlayer)-.*\.js$/.test(url.pathname)) await pause(900);
    await call('Fetch.continueRequest', { requestId });
  });
  const evaluate = async expression => { const r = await call('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true }); if (r.exceptionDetails) throw Error(JSON.stringify(r.exceptionDetails)); return r.result.value; };
  const wait = async expression => { for (let i = 0; i < 120; i++) { if (await evaluate(`Boolean(${expression})`)) return; await pause(100); } throw Error(`Timed out: ${expression}\n${errors.join('\n')}\n${await evaluate('document.body.innerText.slice(0,1600)')}`); };
  const click = async selector => { await wait(`document.querySelector(${JSON.stringify(selector)})`); await evaluate(`document.querySelector(${JSON.stringify(selector)}).click()`); };
  await call('Page.enable'); await call('Runtime.enable'); await call('Network.enable');
  await call('Network.setCacheDisabled', { cacheDisabled: true });
  await call('Fetch.enable', { patterns: [{ urlPattern: '*' }] });
  for (const [language, direction, loading] of [['en', 'ltr', 'Loading…'], ['ar', 'rtl', 'جارٍ التحميل…'], ['he', 'rtl', 'טוען…']]) {
    await call('Page.addScriptToEvaluateOnNewDocument', { source: `localStorage.setItem('TechMinds-language','${language}')` });
    requests.length = 0;
    await call('Page.navigate', { url: base + '/student' });
    await wait('document.querySelector(".student-card")');
    assert.ok((await evaluate('location.pathname')).includes('login'));
    assert.ok(!requests.some(path => /StudentDashboard-|Owner|Teacher/.test(path)), 'unauthorized routes do not import role pages');
    assert.equal(await evaluate('document.documentElement.dir'), direction);
    await click('.student-card button');
    await click('.student-login-methods button:nth-child(2)');
    await evaluate(`for (const [selector,value] of [['input[type=email]','student@example.test'],['input[type=password]','fixture-password']]) {const el=document.querySelector(selector);Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value').set.call(el,value);el.dispatchEvent(new Event('input',{bubbles:true}));}`);
    await evaluate('document.querySelector("input[type=email]").form.requestSubmit()');
    await wait(`document.querySelector('[role=status]')?.textContent.trim()===${JSON.stringify(loading)}`);
    await click('.marketplace-feature-button');
    await click('.marketplace-open-button');
    await wait('document.querySelector(".program-lesson-item")');
    const reads = await evaluate('fixture.calls.filter(call=>call.name==="getPurchasedProgram").length');
    // Language changes render locally rather than recreating program listeners.
    const alternate = language === 'en' ? 'ar' : 'en';
    await click(`.program-learning-language button:nth-child(${alternate === 'en' ? 1 : 2})`);
    await wait(`document.documentElement.lang===${JSON.stringify(alternate)}`);
    await click(`.program-learning-language button:nth-child(${['en', 'ar', 'he'].indexOf(language) + 1})`);
    await wait(`document.documentElement.lang===${JSON.stringify(language)}`);
    await pause(150);
    assert.equal(await evaluate('fixture.calls.filter(call=>call.name==="getPurchasedProgram").length'), reads);
    await click('.program-start-lesson');
    await wait('document.querySelector(".player-next") && document.body.innerText.includes("First screen")');
    assert.ok(!requests.some(path => /CodeRunner-.*\.js|editor\.worker/.test(path)), 'Monaco stays unloaded on noncoding screens');
    await click('.player-next');
    await wait('document.body.innerText.includes("Resume screen")');
    await evaluate('history.back()');
    await wait('document.querySelector(".program-continue-card a")');
    await click('.program-continue-card a');
    await wait('document.querySelector(".player-next") && document.body.innerText.includes("Resume screen")');
    assert.equal(await evaluate('fixture.progress[0].lastSectionIndex'), 1);
    await click('.player-next');
    await wait('document.querySelector(".monaco-editor")');
    assert.ok(requests.some(path => /CodeRunner-.*\.js/.test(path)), 'coding experience imports Monaco');
    console.log(`PASS ${language}: production-bundled login → dashboard → programs → program → lesson → back → resume; localized fallback, route protection, delayed Monaco`);
  }
  assert.deepEqual(errors, []);
  await call('Browser.close');
} finally { ws?.close(); chrome.kill(); }
