import { spawn } from 'node:child_process';
import { mkdtemp, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import assert from 'node:assert/strict';
const profile = await mkdtemp(join(tmpdir(), 'refined-ui-'));
const chrome = spawn('C:/Program Files/Google/Chrome/Application/chrome.exe', ['--headless=new', '--disable-gpu', '--no-first-run', '--remote-debugging-port=9341', `--user-data-dir=${profile}`, 'about:blank'], { windowsHide: true, stdio: 'ignore' });
let ws;
try {
  let targets;
  for (let i=0; i<40; i++) { try { targets = await (await fetch('http://127.0.0.1:9341/json')).json(); break; } catch { await new Promise(r=>setTimeout(r,250)); } }
  ws = new WebSocket(targets.find(t=>t.type==='page').webSocketDebuggerUrl);
  await new Promise(r=>ws.addEventListener('open',r,{once:true}));
  let id=0; const pending = new Map();
  ws.addEventListener('message',e=>{ const d=JSON.parse(e.data); if(d.id) { const p=pending.get(d.id); pending.delete(d.id); d.error?p.reject(d.error):p.resolve(d.result); } });
  const call=(method,params={})=>new Promise((resolve,reject)=>{const key=++id; pending.set(key,{resolve,reject});ws.send(JSON.stringify({id:key,method,params}));});
  const evaluate=async expression=>(await call('Runtime.evaluate',{expression,returnByValue:true})).result.value;
  await call('Page.enable');
  await call('Page.navigate',{url:'http://127.0.0.1:5185/login'});
  for(let i=0;i<80;i++){if(await evaluate('!!document.querySelector(".studio-window")'))break;await new Promise(r=>setTimeout(r,250));}
  assert.ok(await evaluate('!!document.querySelector(".studio-window")'));
  for (const language of ['en','ar','he']) {
    await evaluate(`localStorage.setItem('teachlearn-language','${language}')`);
    await call('Page.reload');
    await new Promise(r=>setTimeout(r,1000));
    for(const width of [1440,390,320]) {
      await call('Emulation.setDeviceMetricsOverride',{width,height:1000,deviceScaleFactor:1,mobile:width<700});
      await new Promise(r=>setTimeout(r,250));
      assert.equal(await evaluate('document.documentElement.scrollWidth > innerWidth'),false,`${language} ${width} overflow`);
      await evaluate('document.querySelectorAll(".idea-lab-controls button")[1].click()');
      await new Promise(r=>setTimeout(r,100));
      assert.equal(await evaluate('document.querySelectorAll(".idea-lab-controls button")[1].getAttribute("aria-pressed")'),'true');
      const shot=await call('Page.captureScreenshot',{format:'png',captureBeyondViewport:true});
      await writeFile(`artifacts/ui-review/refined-${language}-${width}.png`,Buffer.from(shot.data,'base64'));
      console.log(`PASS ${language} ${width}px layout and stage switching`);
    }
  }
  await call('Browser.close');
} finally { ws?.close(); chrome.kill(); }
