import test from 'node:test';
import assert from 'node:assert/strict';
import { readPaddleConfig, selectPaddlePrice, programLicenseForRole } from '../src/firebase/paddleConfig.js';

test('production rejects sandbox tokens', () => {
  assert.throws(() => readPaddleConfig({ VITE_PADDLE_ENVIRONMENT: 'production', VITE_PADDLE_CLIENT_TOKEN: 'test_example' }));
});
test('production never falls back to a sandbox price', () => {
  assert.equal(selectPaddlePrice({ environment: 'production', type: 'plan', planId: 'teacherBasic', billingCycle: 'monthly', testPriceId: 'pri_test' }), '');
});
test('production uses the selected plan and billing cycle', () => {
  assert.equal(selectPaddlePrice({ environment: 'production', type: 'plan', planId: 'teacherBasic', billingCycle: 'yearly', planPriceIds: { teacherBasic: { monthly: 'pri_monthly', yearly: 'pri_yearly' } } }), 'pri_yearly');
});
test('sandbox keeps its explicit test price fallback', () => {
  assert.equal(selectPaddlePrice({ environment: 'sandbox', type: 'plan', testPriceId: 'pri_test' }), 'pri_test');
});
test('program checkout uses its own price', () => {
  assert.equal(selectPaddlePrice({ environment: 'production', type: 'program', programPriceId: 'pri_program' }), 'pri_program');
});
test('programs cannot use the generic sandbox price', () => {
  assert.equal(selectPaddlePrice({ environment: 'sandbox', type: 'program', testPriceId: 'pri_test' }), '');
});
test('personal licenses come from the account role', () => {
  assert.equal(programLicenseForRole('teacher', 'student'), 'teacher');
  assert.equal(programLicenseForRole('student', 'teacher'), 'student');
  assert.equal(programLicenseForRole('student', 'class'), 'student');
  assert.equal(programLicenseForRole('teacher', 'class'), 'class');
  assert.equal(programLicenseForRole('owner', 'student'), null);
});
