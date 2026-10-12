import test from 'node:test';
import assert from 'node:assert/strict';
import { watchInactivity, INACTIVITY_TIMEOUT } from '../src/auth/inactivitySession.js';

function fixture(initial = { uid: 'student' }) {
  let time = 0, sequence = 0, user = initial, observer;
  const timers = new Map(), events = new EventTarget(), visibility = new EventTarget();
  let signouts = 0, redirects = 0, subscriptions = 0;
  const controller = watchInactivity({
    getUser: () => user,
    subscribeToAuth: callback => { observer = callback; subscriptions++; callback(user); return () => { subscriptions--; observer = null; }; },
    signOut: async () => { signouts++; user = null; observer?.(null); },
    onTimeout: () => { redirects++; },
    eventTarget: events, visibilityTarget: visibility,
    now: () => time,
    setTimer: (callback, delay) => { timers.set(++sequence, { callback, at: time + delay }); assert.equal(timers.size, 1); return sequence; },
    clearTimer: id => timers.delete(id),
  });
  return {
    controller, timers, events, visibility,
    get signouts() { return signouts; }, get redirects() { return redirects; }, get subscriptions() { return subscriptions; },
    login() { user = { uid: 'student' }; observer?.(user); },
    logout() { user = null; observer?.(null); },
    jump(ms) { time += ms; },
    async advance(ms) {
      const end = time + ms;
      while (true) {
        const next = [...timers.entries()].sort((a, b) => a[1].at - b[1].at)[0];
        if (!next || next[1].at > end) break;
        time = next[1].at; timers.delete(next[0]); next[1].callback();
        await Promise.resolve();
      }
      time = end; await Promise.resolve();
    },
  };
}

test('inactive user signs out exactly at 20 minutes, once; login starts a new session', async () => {
  assert.equal(INACTIVITY_TIMEOUT, 20 * 60 * 1000);
  const f = fixture();
  await f.advance(INACTIVITY_TIMEOUT - 1); assert.equal(f.signouts, 0);
  await f.advance(1); assert.equal(f.signouts, 1); assert.equal(f.redirects, 1);
  f.events.dispatchEvent(new Event('mousemove'));
  await f.advance(INACTIVITY_TIMEOUT * 2); assert.equal(f.signouts, 1); assert.equal(f.timers.size, 0);
  f.login(); await f.advance(INACTIVITY_TIMEOUT - 1); assert.equal(f.signouts, 1);
  await f.advance(1); assert.equal(f.signouts, 2); assert.equal(f.redirects, 2);
  f.controller.dispose();
});

test('activity keeps a user signed in beyond 20 minutes with only one timer', async () => {
  const f = fixture();
  for (let i = 0; i < 60; i++) {
    await f.advance(60 * 1000); f.events.dispatchEvent(new Event('mousemove'));
  }
  assert.equal(f.signouts, 0); assert.equal(f.timers.size, 1);
  f.controller.dispose();
});

for (const event of ['mousemove', 'pointerdown', 'click', 'keydown', 'touchstart', 'touchmove', 'scroll', 'navigation']) {
  test(`${event} resets the full inactivity deadline`, async () => {
    const f = fixture(); await f.advance(INACTIVITY_TIMEOUT - 1);
    if (event === 'navigation') f.controller.activity();
    else f.events.dispatchEvent(new Event(event));
    await f.advance(INACTIVITY_TIMEOUT - 1); assert.equal(f.signouts, 0);
    await f.advance(1); assert.equal(f.signouts, 1);
    f.controller.dispose();
  });
}

test('guests and manual logout are unaffected; disposal removes the timer and auth observer', async () => {
  const f = fixture(null);
  f.events.dispatchEvent(new Event('click')); f.controller.activity();
  await f.advance(INACTIVITY_TIMEOUT * 3);
  assert.equal(f.signouts, 0); assert.equal(f.timers.size, 0);
  f.login(); f.logout(); await f.advance(INACTIVITY_TIMEOUT);
  assert.equal(f.signouts, 0); assert.equal(f.redirects, 0);
  f.login(); f.controller.dispose();
  f.events.dispatchEvent(new Event('keydown')); await f.advance(INACTIVITY_TIMEOUT);
  assert.equal(f.signouts, 0); assert.equal(f.subscriptions, 0); assert.equal(f.timers.size, 0);
});

test('returning from a suspended tab cannot revive an expired session', async () => {
  for (const event of ['mousemove', 'focus', 'visibilitychange']) {
    const f = fixture(); f.jump(INACTIVITY_TIMEOUT + 1);
    (event === 'visibilitychange' ? f.visibility : f.events).dispatchEvent(new Event(event));
    await Promise.resolve(); assert.equal(f.signouts, 1); assert.equal(f.redirects, 1);
    f.controller.dispose();
  }
});
