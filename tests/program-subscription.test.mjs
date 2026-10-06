import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';

function fixture() {
  const source = readFileSync(new URL('../src/access/programAccessClient.js', import.meta.url), 'utf8');
  const requests = [], watches = [], timers = new Map(), events = new Map();
  const auth = { currentUser: { uid: 'student' }, authStateReady: async () => {} };
  let timerId = 0;
  const context = { auth, db: {}, Date, console,
    getProgram: data => new Promise((resolve, reject) => requests.push({ data, resolve, reject })),
    doc: (...args) => args, collection: (...args) => args, query: (...args) => args, where: (...args) => args,
    onSnapshot: (_ref, next, fail) => { const watch = { next, fail }; watches.push(watch); next(); return () => watches.splice(watches.indexOf(watch), 1); },
    setTimeout: fn => { timers.set(++timerId, fn); return timerId; }, clearTimeout: id => timers.delete(id),
    window: { addEventListener: (name, fn) => events.set(name, fn), removeEventListener: name => events.delete(name) },
  };
  runInNewContext(source.slice(source.indexOf('export function')).replace('export function', 'function') + '\nthis.subscribe = subscribeProgramContent;', context);
  return { ...context, requests, watches, timers, events, tick() { const pending = [...timers.values()]; timers.clear(); pending.forEach(fn => fn()); } };
}
const flush = async () => { for (let i = 0; i < 8; i++) await Promise.resolve(); };

test('program refreshes serialize invalidations and discard superseded results', async () => {
  const f = fixture(), received = [], errors = [];
  const stop = f.subscribe('p1', data => received.push(data), error => errors.push(error), { lessonId: 'l1' });
  await flush();
  assert.equal(f.requests.length, 1);
  assert.equal(f.requests[0].data.lessonId, 'l1');
  f.events.get('focus')(); f.watches[0].next(); f.tick();
  assert.equal(f.requests.length, 1);
  f.requests[0].resolve({ data: { stale: true } }); await flush();
  assert.equal(received.length, 0);
  assert.equal(f.requests.length, 2);
  f.requests[1].resolve({ data: { fresh: true } }); await flush();
  assert.equal(received[0].fresh, true);
  stop(); f.tick(); await flush();
  assert.equal(f.watches.length, 0); assert.equal(f.events.size, 0); assert.equal(errors.length, 0);
});

test('unmount during auth readiness makes no request and session changes discard results', async () => {
  const f = fixture();
  const stop = f.subscribe('p1', () => assert.fail('unmounted callback'), () => {});
  stop(); await flush(); assert.equal(f.requests.length, 0);
  const errors = [];
  const cleanup = f.subscribe('p1', () => assert.fail('wrong-session content'), error => errors.push(error));
  await flush(); f.auth.currentUser = { uid: 'different' };
  f.requests[0].resolve({ data: {} }); await flush();
  assert.equal(errors[0].message, 'session-changed'); cleanup();
});
