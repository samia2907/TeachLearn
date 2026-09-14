// Run against Vite. Uses a fake repository; no Firebase accounts or data are changed.
import { spawn } from 'node:child_process';
import { mkdir, mkdtemp, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import assert from 'node:assert/strict';

const base = process.env.TEST_BASE_URL || 'http://127.0.0.1:5185';
const profile = await mkdtemp(join(tmpdir(), 'techminds-mission-'));
const chrome = spawn(process.env.CHROME_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe',
  ['--headless=new', '--disable-gpu', '--no-first-run', '--remote-debugging-port=9341', `--user-data-dir=${profile}`, 'about:blank'], { windowsHide: true, stdio: 'ignore' });
let ws;
try {
  let targets;
  for (let i = 0; i < 40; i++) { try { targets = await (await fetch('http://127.0.0.1:9341/json')).json(); break; } catch { await new Promise(r => setTimeout(r, 250)); } }
  assert.ok(targets, 'Chrome starts');
  ws = new WebSocket(targets.find(t => t.type === 'page').webSocketDebuggerUrl);
  await new Promise(r => ws.addEventListener('open', r, { once: true }));
  const pending = new Map(); let id = 0;
  ws.addEventListener('message', e => { const d = JSON.parse(e.data); if (d.id) { const p = pending.get(d.id); pending.delete(d.id); if (d.error) p.reject(d.error); else p.resolve(d.result); } });
  const call = (method, params = {}) => new Promise((resolve, reject) => { const key = ++id; pending.set(key, { resolve, reject }); ws.send(JSON.stringify({ id: key, method, params })); });
  const evaluate = async expression => { const r = await call('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true, replMode: true }); if (r.exceptionDetails) throw new Error(JSON.stringify(r.exceptionDetails)); return r.result.value; };
  const wait = async expression => { for (let i = 0; i < 120; i++) { if (await evaluate(expression)) return; await new Promise(r => setTimeout(r, 150)); } throw new Error(`Timed out: ${expression}`); };
  const click = async text => { await evaluate(`Array.from(document.querySelectorAll('.mission-player button')).find(b => b.textContent.trim() === ${JSON.stringify(text)}).click()`); };
  const mount = async () => {
    await wait('Boolean(document.querySelector(".about-page"))');
    await evaluate(`
      window.reactModule = await import('/node_modules/.vite/deps/react.js');
      window.React = window.reactModule.default || window.reactModule;
      window.domModule = await import('/node_modules/.vite/deps/react-dom_client.js');
      window.createRoot = window.domModule.createRoot || window.domModule.default.createRoot;
      window.Provider = (await import('/src/context/LanguageContext.jsx')).LanguageProvider;
      window.Mission = (await import('/src/components/mission/MissionPlayer.jsx')).default;
      window.lesson = {...(await import('/src/data/missions/mission01.js')).default, id:'browser-mission', teacherId:'teacher', classId:'class'};
      window.readRemote = () => JSON.parse(localStorage.getItem('test:mission:remote') || '{}');
      window.repository = {
        loadMission: async () => window.readRemote(),
        saveMission: async (_db, _lesson, _student, mission) => {
          if (window.failSync) throw Error('offline');
          const old = window.readRemote(); if (!old.completed) localStorage.setItem('test:mission:remote', JSON.stringify({...old, mission}));
        },
        completeMission: async (_db, _lesson, _student, mission) => {
          if (window.failSync) throw Error('offline');
          const old = window.readRemote();
          if (!old.completed) localStorage.setItem('test:mission:remote', JSON.stringify({mission, completed:true, xp:100, awards:1}));
          return {xp:100};
        }
      };
      document.querySelector('#root').style.display = 'none';
      window.node = document.createElement('div'); document.body.append(window.node);
      window.root = createRoot(window.node);
      window.root.render(React.createElement(Provider, null, React.createElement(Mission, {lesson:window.lesson, student:{id:'browser-student'}, repository:window.repository, onExit:()=>{}})));
    `);
    await wait('Boolean(document.querySelector(".mission-card"))');
    await click('English');
  };
  const screen = title => wait(`document.querySelector('#mission-screen-title')?.textContent === ${JSON.stringify(title)}`);
  await call('Page.enable');
  await call('Emulation.setDeviceMetricsOverride', { width: 1280, height: 960, deviceScaleFactor: 1, mobile: false });
  await call('Page.navigate', { url: `${base}/about` });
  await mount();
  await click('Continue');
  await screen('Fast does not mean always right');
  await click('Byte needs a faster processor.'); await click('Check answer');
  await wait('Boolean(document.querySelector(".mission-feedback"))');
  assert.equal(await evaluate(`Array.from(document.querySelectorAll('button')).find(b=>b.textContent==='Continue').disabled`), true);
  await click('Hint (0/1)'); await click('Try again');
  await click('The object and destination are not specified.'); await click('Check answer');
  await wait('Boolean(document.querySelector(".mission-success"))'); await click('Continue');
  await screen('Plan before you act');
  // Exercise drag/drop, then the keyboard/touch alternative ordering controls.
  await evaluate(`window.dragData = new DataTransfer(); document.querySelectorAll('.mission-sequence li')[1].dispatchEvent(new DragEvent('dragstart', {bubbles:true, dataTransfer:window.dragData}));`);
  await evaluate(`document.querySelectorAll('.mission-sequence li')[0].dispatchEvent(new DragEvent('drop', {bubbles:true, dataTransfer:window.dragData}));`);
  await evaluate(`document.querySelectorAll('.mission-sequence li')[3].querySelectorAll('button')[0].click()`);
  await evaluate(`document.querySelectorAll('.mission-sequence li')[2].querySelectorAll('button')[0].click()`);
  await click('Check answer'); await wait('Boolean(document.querySelector(".mission-success"))');
  await click('Continue'); await screen('Guide Byte to the key');
  await click('↑ Up'); await click('↑ Up');
  // Refresh immediately: the synchronous browser backup retains unsynced edits.
  await call('Page.reload'); await mount(); await screen('Guide Byte to the key');
  assert.equal(await evaluate('document.querySelectorAll(".mission-commands li").length'), 2);
  console.log('PASS choice retry/hint, sequence ordering, immediate refresh restores screen and commands');
  await click('↑ Up'); await click('→ Right'); await click('→ Right'); await click('→ Right');
  await click('Run program'); await wait('Boolean(document.querySelector(".mission-success"))');
  await click('Continue'); await screen('Find and fix the bug');
  await click('Run program'); await wait('Boolean(document.querySelector(".mission-feedback"))');
  await click('Try again');
  await evaluate(`const select=document.querySelectorAll('.mission-commands select')[1]; select.value='up'; select.dispatchEvent(new Event('change',{bubbles:true}));`);
  await click('Run program'); await wait('Boolean(document.querySelector(".mission-success"))');
  await mkdir('artifacts/mission', { recursive: true });
  const shot = async name => { const r = await call('Page.captureScreenshot', { format: 'png', captureBeyondViewport: true }); await writeFile(`artifacts/mission/${name}.png`, Buffer.from(r.data, 'base64')); };
  await shot('debugging-desktop');
  await click('العربية');
  await call('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 1, mobile: true });
  await shot('debugging-arabic-mobile');
  assert.equal(await evaluate('document.querySelector(".mission-player").dir'), 'rtl');
  assert.equal(await evaluate('document.documentElement.scrollWidth > innerWidth'), false);
  await click('English'); await click('Continue'); await screen('You and the computer: a team');
  await evaluate('window.failSync = true');
  await click('Finish mission');
  await wait(`document.querySelector('[role="alert"]')?.textContent.includes('reward could not be saved')`);
  assert.equal(await evaluate('Boolean(window.readRemote().completed)'), false);
  await evaluate('window.failSync = false');
  await click('Finish mission'); await wait('Boolean(document.querySelector(".mission-complete"))');
  await call('Page.reload'); await mount();
  await wait('Boolean(document.querySelector(".mission-complete"))');
  assert.equal(await evaluate('window.readRemote().awards'), 1);
  assert.equal(await evaluate('window.readRemote().mission.skills.sequencing.passed'), 2);
  console.log('PASS robot movement, debugging retry, Arabic/mobile layout, failed completion retry, completion refresh and skills');
  await call('Browser.close');
} finally { ws?.close(); chrome.kill(); }
