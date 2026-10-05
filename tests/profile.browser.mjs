// Local UI test with fake services: no Auth, email, SMS or Firestore mutations.
import { spawn } from 'node:child_process';
import { mkdtemp } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import assert from 'node:assert/strict';
const base = process.env.TEST_BASE_URL || 'http://127.0.0.1:5191';
const directory = await mkdtemp(join(tmpdir(), 'techminds-profile-ui-'));
const chrome = spawn(process.env.CHROME_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe', ['--headless=new', '--disable-gpu', '--no-first-run', '--remote-debugging-port=9352', `--user-data-dir=${directory}`, 'about:blank'], { windowsHide: true, stdio: 'ignore' });
let ws;
try {
  let targets;
  for (let i = 0; i < 40; i++) { try { targets = await (await fetch('http://127.0.0.1:9352/json')).json(); break; } catch { await new Promise(resolve => setTimeout(resolve, 250)); } }
  assert.ok(targets);
  ws = new WebSocket(targets.find(target => target.type === 'page').webSocketDebuggerUrl);
  await new Promise(resolve => ws.addEventListener('open', resolve, { once: true }));
  let id = 0; const pending = new Map();
  ws.addEventListener('message', event => { const data = JSON.parse(event.data); if (data.id) { const task = pending.get(data.id); pending.delete(data.id); if (data.error) task.reject(data.error); else task.resolve(data.result); } });
  const call = (method, params = {}) => new Promise((resolve, reject) => { const key = ++id; pending.set(key, { resolve, reject }); ws.send(JSON.stringify({ id: key, method, params })); });
  const evaluate = async expression => { const result = await call('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true, replMode: true }); if (result.exceptionDetails) throw new Error(JSON.stringify(result.exceptionDetails)); return result.result.value; };
  const wait = async expression => { for (let i = 0; i < 100; i++) { if (await evaluate(`Boolean(${expression})`)) return; await new Promise(resolve => setTimeout(resolve, 100)); } throw new Error(`Timed out: ${expression}`); };
  await call('Page.enable');
  await call('Runtime.enable');
  ws.addEventListener('message', event => { const data = JSON.parse(event.data); if (data.method === 'Runtime.exceptionThrown') console.error(data.params.exceptionDetails.exception?.description || data.params.exceptionDetails.text); });
  await call('Page.navigate', { url: `${base}/about` });
  await wait('document.querySelector(".about-page")');
  await evaluate(`
    window.reactModule = await import('/node_modules/.vite/deps/react.js');
    window.React = window.reactModule.default || window.reactModule;
    window.domModule = await import('/node_modules/.vite/deps/react-dom_client.js');
    window.createRoot = window.domModule.createRoot || window.domModule.default.createRoot;
    window.profileSource = await (await fetch('/src/pages/Profile.jsx')).text();
    window.routerModule = await import(window.profileSource.match(/"([^"]*react-router-dom[^"]*)"/)[1]);
    window.MemoryRouter = window.routerModule.MemoryRouter || window.routerModule.default?.MemoryRouter;
    window.LanguageProvider = (await import('/src/context/LanguageContext.jsx')).LanguageProvider;
    window.Profile = (await import('/src/pages/Profile.jsx')).default;
    document.querySelector('#root').style.display = 'none';
    window.node = document.createElement('div'); document.body.append(node); window.root = createRoot(node);
    window.user = {uid:'same-uid', email:'auth@example.com', phoneNumber:'+972501234567', emailVerified:true, providerData:[{providerId:'password'}]};
    window.profile = {uid:'same-uid', role:'student', name:'Student', email:'forged@example.com', phoneNumber:'+11111111111', preferredLanguage:'en', xp:1200, classId:'keep-class', plan:'premium'};
    window.saved = [];
    window.services = {
      watchUser: callback => { window.authCallback = callback; callback(window.user); return () => {}; },
      load: async () => window.profile,
      save: async (user, fields) => { window.saved.push({uid:user.uid, fields}); return fields; },
      savePhone: async (user, phone) => { window.savedPhone = {uid:user.uid, phone}; return phone; }, linkEmail: async () => { throw {code:'auth/email-already-in-use'}; }, verifyEmail: async () => {}
    };
    window.root.render(React.createElement(LanguageProvider, null, React.createElement(MemoryRouter, null, React.createElement(Profile, {services}))));
  `);
  await wait('document.querySelector("#profile-name")');
  const details = await evaluate('document.querySelector(".profile-details").textContent');
  assert.ok(details.includes('auth@example.com')); assert.ok(details.includes('+11111111111'));
  assert.ok(!details.includes('forged@example.com')); assert.ok(!details.includes('+972501234567'));
  assert.equal(await evaluate('Boolean(document.querySelector("input[name=role], input[name=xp], input[name=classId]"))'), false);
  await evaluate(`const input = document.querySelector('#profile-name'); Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value').set.call(input, 'Updated Student'); input.dispatchEvent(new Event('input', {bubbles:true}));`);
  await evaluate('document.querySelector(".profile-form").requestSubmit()');
  await wait('window.saved.length === 1');
  assert.deepEqual(await evaluate('window.saved[0]'), { uid: 'same-uid', fields: { name: 'Updated Student', preferredLanguage: 'en' } });
  for (const width of [390, 1280]) {
    await call('Emulation.setDeviceMetricsOverride', { width, height: 900, deviceScaleFactor: 1, mobile: width < 500 });
    for (const [index, direction] of [[0, 'ltr'], [1, 'rtl'], [2, 'rtl']]) {
      await evaluate(`document.querySelectorAll('.profile-languages button')[${index}].click()`);
      await wait(`document.querySelector('.profile-page').dir === '${direction}'`);
      assert.equal(await evaluate('document.documentElement.scrollWidth <= window.innerWidth'), true);
    }
  }
  await evaluate('document.querySelectorAll(".profile-languages button")[0].click()');
  await evaluate(`const phoneInput = document.querySelector('#profile-phone'); Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value').set.call(phoneInput, '0501234567'); phoneInput.dispatchEvent(new Event('input', {bubbles:true}));`);
  await evaluate('document.querySelector("#profile-phone").form.requestSubmit()');
  await wait('window.savedPhone');
  assert.deepEqual(await evaluate('window.savedPhone'), {uid:'same-uid', phone:'0501234567'});
  assert.equal(await evaluate('document.querySelectorAll(".phone-auth, input[autocomplete=one-time-code]").length'), 0);
  assert.equal(await evaluate('document.querySelectorAll("form form").length'), 0);
  await evaluate(`window.user = {...window.user, email:null, providerData:[{providerId:'phone'}]}; window.authCallback(window.user);`);
  await wait('document.querySelector("#link-email")');
  for (const [id, value] of [['link-email', 'other@example.com'], ['link-password', 'Strong123!']]) await evaluate(`Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value').set.call(document.getElementById('${id}'), '${value}'); document.getElementById('${id}').dispatchEvent(new Event('input', {bubbles:true}));`);
  await evaluate('document.querySelector("#link-email").form.requestSubmit()');
  await wait('document.querySelector("[role=alert]")');
  assert.ok((await evaluate('document.querySelector("[role=alert]").textContent')).includes('another account'));
  assert.equal(await evaluate('window.user.uid'), 'same-uid');
  await evaluate('window.authCallback(null)');
  await wait('!document.querySelector("#profile-name")');
  console.log('PASS profile: Firestore contact display/edit, safe edits, linking collision, session loss, no phone authentication, 3 languages and mobile/desktop layouts');
} finally { ws?.close(); chrome.kill(); }
