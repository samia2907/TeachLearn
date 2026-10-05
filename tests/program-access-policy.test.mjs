import test from 'node:test';
import assert from 'node:assert/strict';
import { canAccessProgram, hasExplicitProgramAccessType, normalizeProgram, isValidManualAccess } from '../functions/programAccessPolicy.mjs';
import { createRequire } from 'node:module';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
const require = createRequire(import.meta.url);
const { missingProgramFields, missingAccessPolicyFields } = require('../functions/scripts/migrateProgramAccess.js');
const user = { role: 'student', accountStatus: 'active' };

test('central resolver uses stored grants, ignores frontend grants, and honors revocation', async () => {
  const source = readFileSync(new URL('../functions/index.js', import.meta.url), 'utf8');
  for (const role of ['student', 'teacher']) {
    const storedUser = { ...user, role, ownerGrantedProgramIds: ['p1'] };
    const program = { status: 'published', accessType: 'class' };
    const emptyQuery = { where: () => emptyQuery, get: async () => ({ docs: [] }) };
    const context = {
      canAccessProgram, isValidManualAccess, safeId: value => value, exports: {}, onCall: (_, handler) => handler,
      HttpsError: Error,
      db: { collection: name => ({ ...emptyQuery, doc: id => ({ get: async () => ({
        exists: name === 'users' && id === 'u1' || name === 'programs' && id === 'p1',
        data: () => name === 'users' ? storedUser : program,
      }) }) }) },
    };
    runInNewContext(source.slice(source.indexOf('async function resolveProgramAccess('), source.indexOf('function isRecord(')), context);
    const request = { auth: { uid: 'u1' }, data: { programId: 'p1', role: 'owner', ownerGrantedProgramIds: ['p1'] } };
    assert.equal((await context.exports.checkProgramAccess(request)).source, 'owner-granted');
    const access = await context.resolveProgramAccess('u1', 'p1', storedUser, program);
    assert.equal(access.accessType, 'owner-granted');
    storedUser.ownerGrantedProgramIds = [];
    assert.equal((await context.exports.checkProgramAccess(request)).hasAccess, false);
  }
});

test('owner grants are per program, revocable, and preserve other access paths', () => {
  for (const role of ['student', 'teacher']) {
    for (const accessType of ['free', 'paid', 'class']) {
      const program = { status: 'published', accessType };
      const grantedUser = { ...user, role, ownerGrantedProgramIds: ['p1'] };
      const check = (overrides = {}) => canAccessProgram({ program, programId: 'p1', user: grantedUser, ...overrides });
      assert.deepEqual(check(), { hasAccess: true, source: accessType === 'free' ? 'free' : 'owner-granted' });
      for (const purchaseAccess of [false, true]) {
        for (const classAccess of [false, true]) {
          const baseline = canAccessProgram({ program, user: { ...user, role }, purchaseAccess, classAccess });
          assert.deepEqual(check({ user: { ...grantedUser, ownerGrantedProgramIds: [] }, purchaseAccess, classAccess }), baseline);
          assert.deepEqual(check({ programId: 'p2', purchaseAccess, classAccess }), baseline);
        }
      }
      assert.equal(check({ user: { ...grantedUser, accountStatus: 'suspended' } }).hasAccess, false);
      assert.equal(check({ program: { ...program, status: 'draft' } }).hasAccess, false);
    }
  }
  assert.equal(canAccessProgram({ program: { status: 'published', accessType: 'paid' },
    programId: 'p1', user: { ...user, ownerGrantedProgramIds: 'p1' } }).hasAccess, false);
});

test('access matrix does not depend on a provider or product ID', () => {
  for (const paymentProvider of [null, 'paddle', 'payplus', 'sumit', 'grow']) {
    for (const accessType of ['free', 'paid', 'class']) {
      for (const purchaseAccess of [false, true]) {
        for (const classAccess of [false, true]) {
          const program = { status: 'published', accessType, paymentProvider, paymentProductId: null };
          assert.equal(canAccessProgram({ program, user, purchaseAccess, classAccess }).hasAccess,
            accessType === 'free' || classAccess || (accessType === 'paid' && purchaseAccess));
        }
      }
    }
  }
});

test('normalization and migration preserve configured programs without publishing legacy access', () => {
  assert.equal(normalizeProgram({}).accessType, undefined);
  assert.equal(normalizeProgram({ accessType: 'free', price: 90 }).price, 0);
  const legacy = { status: 'published', paddlePriceIds: { student: 'legacy' }, pricing: { student: 90 } };
  const patch = missingProgramFields(legacy);
  assert.deepEqual(patch, { currency: 'ILS', paymentProvider: null, paymentProductId: null });
  assert.deepEqual(missingAccessPolicyFields(legacy), ['accessType']);
  assert.equal(hasExplicitProgramAccessType(legacy), false);
  assert.equal(canAccessProgram({ program: legacy, user }).hasAccess, false);

  const configured = { ...legacy, ...patch, accessType: 'paid', price: 90 };
  assert.deepEqual(missingProgramFields(configured), {});
  assert.deepEqual(missingAccessPolicyFields(configured), []);
  assert.equal(hasExplicitProgramAccessType({ status: 'published', accessType: 'free' }), true);
  assert.equal(canAccessProgram({
    program: { status: 'published', accessType: 'free' }, user,
  }).hasAccess, true);
  assert.equal(configured.paddlePriceIds.student, 'legacy');
  assert.equal(configured.status, 'published');
});
