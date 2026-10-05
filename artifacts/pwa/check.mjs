import { spawn } from 'node:child_process';
import { mkdtemp, readFile, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import assert from 'node:assert/strict';

const base = 'http://127.0.0.1:5187';
const manifest = JSON.parse(await readFile('dist/manifest.webmanifest', 'utf8'));
assert.equal(manifest.name, 'TechMinds');
assert.equal(manifest.short_name, 'TechMinds');
assert.equal(manifest.display, 'standalone');
assert.equal(manifest.start_url, '/');
assert.equal(manifest.scope, '/');
assert.equal(manifest.icons.length, 3);
for (const [name, size] of [['pwa-192x192.png', 192], ['pwa-512x512.png', 512], ['pwa-maskable-512x512.png', 512], ['apple-touch-icon.png', 180]]) {
  const bytes = await readFile(`public/${name}`);
  assert.equal(bytes.subarray(0, 8).toString('hex'), '89504e470d0a1a0a');
  assert.equal(bytes.readUInt32BE(16), size);
  assert.equal(bytes.readUInt32BE(20), size);
  assert.deepEqual(await readFile(`dist/${name}`), bytes);
  const response = await fetch(`${base}/${name}`);
  assert.equal(response.status, 200);
  assert.ok(response.headers.get('content-type').includes('image/png'));
  if (name !== 'apple-touch-icon.png') {
    const icon = manifest.icons.find(icon => icon.src === `/${name}`);
    assert.equal(icon.sizes, `${size}x${size}`);
    assert.equal(icon.purpose, name.includes('maskable') ? 'maskable' : 'any');
  }
}
const profile = await mkdtemp(join(tmpdir(), 'techminds-pwa-'));
const chrome = spawn('C:/Program Files/Google/Chrome/Application/chrome.exe', ['--headless=new', '--disable-gpu', '--no-first-run', '--remote-debugging-port=9347', `--user-data-dir=${profile}`, 'about:blank'], { windowsHide: true, stdio: 'ignore' });
let ws;
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
try {
  let targets;
  for (let i = 0; i < 60; i++) {
    try { targets = await (await fetch('http://127.0.0.1:9347/json')).json(); break; } catch { await delay(250); }
  }
  assert.ok(targets, 'Chrome debugging endpoint');
  ws = new WebSocket(targets.find(target => target.type === 'page').webSocketDebuggerUrl);
  await new Promise(resolve => ws.addEventListener('open', resolve, { once: true }));
  let id = 0;
  const pending = new Map();
  ws.addEventListener('message', event => {
    const data = JSON.parse(event.data);
    if (data.id) {
      const request = pending.get(data.id);
      pending.delete(data.id);
      data.error ? request.reject(data.error) : request.resolve(data.result);
    }
  });
  const call = (method, params = {}) => new Promise((resolve, reject) => {
    const key = ++id;
    pending.set(key, { resolve, reject });
    ws.send(JSON.stringify({ id: key, method, params }));
  });
  const evaluate = async expression => {
    const result = await call('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true });
    assert.ok(!result.exceptionDetails, JSON.stringify(result.exceptionDetails));
    return result.result.value;
  };
  await call('Page.enable');
  await call('Network.enable');
  await call('Page.navigate', { url: `${base}/about` });
  let controlled = false;
  for (let i = 0; i < 120; i++) {
    controlled = await evaluate('!!navigator.serviceWorker.controller && !!document.querySelector("#root")?.textContent');
    if (controlled) break;
    await delay(250);
  }
  assert.ok(controlled, 'React renders and Service Worker controls page');
  assert.equal(await evaluate('document.querySelector("link[rel=manifest]").getAttribute("href")'), '/manifest.webmanifest');
  assert.equal(await evaluate('document.querySelector("link[rel=apple-touch-icon]").getAttribute("href")'), '/apple-touch-icon.png');
  const parsedManifest = await call('Page.getAppManifest');
  assert.deepEqual(parsedManifest.errors, []);
  const installation = await call('Page.getInstallabilityErrors');
  assert.deepEqual(installation.installabilityErrors, []);
  const cachedUrls = await evaluate('(async () => { const all = await Promise.all((await caches.keys()).map(async key => (await (await caches.open(key)).keys()).map(request => request.url))); return all.flat(); })()');
  for (const icon of [...manifest.icons.map(icon => icon.src), '/apple-touch-icon.png']) {
    assert.ok(cachedUrls.some(url => new URL(url).pathname === icon), `Precached ${icon}`);
  }
  assert.ok(cachedUrls.every(url => new URL(url).origin === base), 'No external responses cached');
  await call('Network.emulateNetworkConditions', { offline: true, latency: 0, downloadThroughput: 0, uploadThroughput: 0 });
  await call('Page.navigate', { url: `${base}/programs` });
  let offline = false;
  for (let i = 0; i < 60; i++) {
    offline = await evaluate('location.pathname === "/programs" && !!document.querySelector("#root")?.textContent && !!navigator.serviceWorker.controller');
    if (offline) break;
    await delay(250);
  }
  assert.ok(offline, 'Offline SPA navigation renders app shell');
  const report = { icons: '4 PNG files with correct dimensions, served and precached', manifest: 'valid', appleTouchIcon: 'linked', serviceWorker: 'active and controlling', installabilityErrors: installation.installabilityErrors, offlineSPAShell: 'passed', cacheEntries: cachedUrls.length, physicalDevicesTested: false };
  await writeFile('artifacts/pwa/result.json', JSON.stringify(report, null, 2) + '\n');
  console.log(JSON.stringify(report, null, 2));
} finally {
  ws?.close();
  chrome.kill();
}
