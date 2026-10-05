import test from 'node:test';
import assert from 'node:assert/strict';
import { safeReturnTo, authEntry } from '../src/auth/returnTo.mjs';

test('preserves intended lesson, query and fragment across login and signup', () => {
  const target = '/programs/robotics/lessons/intro?mode=practice#step-2';
  const login = authEntry(target);
  const next = new URL(login, 'https://local.test').searchParams.get('next');
  assert.equal(next, target);
  const signup = authEntry(next, '/register?role=student');
  const params = new URL(signup, 'https://local.test').searchParams;
  assert.equal(params.get('role'), 'student');
  assert.equal(safeReturnTo(params.get('next')), target);
});
test('rejects external destinations, parser tricks and authentication loops', () => {
  for (const value of [null, '', 'https://evil.test', '//evil.test', '/\\evil.test', '/\nevil.test', 'javascript:alert(1)', '/login', '/register?role=student', '/a/../login']) {
    assert.equal(safeReturnTo(value), null, String(value));
    assert.equal(authEntry(value), '/login');
  }
});
test('supports protected account actions and public program returns', () => {
  for (const value of ['/student/join-class?code=ABC', '/programs/test/access', '/student/lessons/test', '/teacher', '/checkout']) {
    assert.equal(safeReturnTo(value), value);
  }
});
