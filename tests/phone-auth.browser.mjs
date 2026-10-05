// UI smoke test against a local Vite server. No SMS, sign-ins or database writes.
import { spawn } from 'node:child_process';
import { mkdtemp } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import assert from 'node:assert/strict';

const base = process.env.TEST_BASE_URL || 'http://127.0.0.1:5191';
const profile = await mkdtemp(join(tmpdir(), 'techminds-phone-ui-'));
const chrome = spawn(process.env.CHROME_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe', ['--headless=new', '--disable-gpu', '--no-first-run', '--remote-debugging-port=9349', `--user-data-dir=${profile}`, 'about:blank'], { windowsHide: true, stdio: 'ignore' });
let ws;
try {
  let targets;
  for (let i = 0; i < 40; i++) { try { targets = await (await fetch('http://127.0.0.1:9349/json')).json(); break; } catch { await new Promise(resolve => setTimeout(resolve, 250)); } }
  assert.ok(targets, 'Chrome starts');
  ws = new WebSocket(targets.find(target => target.type === 'page').webSocketDebuggerUrl);
  await new Promise(resolve => ws.addEventListener('open', resolve, { once: true }));
  const pending = new Map(); let id = 0;
  ws.addEventListener('message', event => { const data = JSON.parse(event.data); if (data.id) { const task = pending.get(data.id); pending.delete(data.id); if (data.error) task.reject(data.error); else task.resolve(data.result); } });
  const call = (method, params = {}) => new Promise((resolve, reject) => { const key = ++id; pending.set(key, { resolve, reject }); ws.send(JSON.stringify({ id: key, method, params })); });
  const evaluate = async expression => { const result = await call('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true }); if (result.exceptionDetails) throw new Error(JSON.stringify(result.exceptionDetails)); return result.result.value; };
  const wait = async expression => { for (let i = 0; i < 80; i++) { if (await evaluate(`Boolean(${expression})`)) return; await new Promise(resolve => setTimeout(resolve, 100)); } throw new Error(`Timed out: ${expression}`); };
  await call('Page.enable');
  for (const role of ['student', 'teacher']) {
    await call('Page.navigate', { url: `${base}/register?role=${role}` });
    await wait('document.querySelector("#register-phone")');
    assert.equal(await evaluate('Boolean(document.querySelector("input[type=email]"))'), true);
    assert.equal(await evaluate('document.querySelector("#register-phone").required'), false);
    assert.equal(await evaluate('document.querySelectorAll(".auth-methods, .phone-auth, input[autocomplete=one-time-code]").length'), 0);
    for (const [label, direction] of [['English', 'ltr'], ['العربية', 'rtl'], ['עברית', 'rtl']]) {
      await evaluate(`Array.from(document.querySelectorAll('button')).find(button => button.textContent.includes(${JSON.stringify(label)})).click()`);
      await wait(`document.documentElement.dir === '${direction}' || document.querySelector('[dir="${direction}"]')`);
      assert.equal(await evaluate('document.querySelector("#register-phone").dir'), 'ltr');
      assert.ok((await evaluate('document.querySelector("label[for=register-phone]").textContent')).length > 0);
    }
    console.log(`PASS ${role}: optional contact field, no phone authentication, three languages`);
    await call('Page.navigate', { url: `${base}/login` });
    await wait(`document.querySelector('.${role}-card button')`);
    await evaluate(`document.querySelector('.${role}-card button').click()`);
    await wait('document.querySelector(".login-form")');
    assert.equal(await evaluate('document.querySelectorAll(".auth-methods, .phone-auth, input[type=tel]").length'), 0);
    assert.equal(await evaluate('Boolean(document.querySelector("input[type=password]"))'), true);
    console.log(`PASS ${role}: existing login form without phone authentication`);
  }
} finally { ws?.close(); chrome.kill(); }
