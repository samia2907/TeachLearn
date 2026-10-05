// Non-deploying Firebase Rules API tests.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
async function main() {
  const project = process.argv[2];
  assert.ok(project, 'Pass the Firebase project ID.');
  const cli = path.resolve(__dirname, '../node_modules/firebase-tools/lib');
  const account = require(path.join(cli, 'auth')).getGlobalDefaultAccount();
  await require(path.join(cli, 'requireAuth')).requireAuth({ project, ...account });
  const { Client } = require(path.join(cli, 'apiv2'));
  const client = new Client({ urlPrefix: 'https://firebaserules.googleapis.com', apiVersion: 'v1' });
  const time = '2026-09-20T12:00:00Z';
  const phone = '+972501234567';
  const base = { uid: 'student', name: 'Student', role: 'student', studentAccountType: 'independent', email: null, authEmail: null, phoneNumber: phone, authProvider: 'phone', classId: null, classCode: null, teacherId: null, xp: 0, level: 1, badges: [], plan: 'free', subscriptionStatus: 'inactive', billingCycle: null, subscriptionId: null, accountStatus: 'active', createdAt: time };
  function create(data, token, expectation, uid = 'student') {
    return { expectation, request: { auth: { uid, token }, method: 'create', time, path: '/databases/default/documents/users/student', resource: { data } }, functionMocks: [{ function: 'exists', args: [{ exact_value: `/databases/default/documents/users/${uid}` }], result: { value: false } }] };
  }
  const cases = [
    ['verified phone student', create(base, { phone_number: phone }, 'ALLOW')],
    ['email student unchanged', create({ ...base, email: 'a@example.com', authEmail: 'a@example.com', phoneNumber: null, authProvider: 'password' }, { email: 'a@example.com' }, 'ALLOW')],
    ['phone teacher', create({ ...base, role: 'teacher' }, { phone_number: phone }, 'ALLOW')],
    ['wrong phone rejected', create(base, { phone_number: '+972509999999' }, 'DENY')],
    ['no identity rejected', create(base, {}, 'DENY')],
    ['forged email rejected', create({ ...base, email: 'victim@example.com' }, { phone_number: phone }, 'DENY')],
    ['owner rejected', create({ ...base, role: 'owner' }, { phone_number: phone }, 'DENY')],
    ['paid plan rejected', create({ ...base, plan: 'premium' }, { phone_number: phone }, 'DENY')],
    ['class injection rejected', create({ ...base, classId: 'class1', teacherId: 'teacher1' }, { phone_number: phone }, 'DENY')],
    ['other UID rejected', create(base, { phone_number: phone }, 'DENY', 'attacker')],
  ];
  function update(role, changes, token, expectation, uid = 'student') {
    const existing = { ...base, role };
    return {
      expectation,
      request: { auth: { uid, token }, method: 'update', time,
        path: '/databases/default/documents/users/student', resource: { data: { ...existing, ...changes, updatedAt: time } } },
      resource: { data: existing },
      functionMocks: [
        { function: 'exists', args: [{ exact_value: `/databases/default/documents/users/${uid}` }], result: { value: true } },
        { function: 'get', args: [{ exact_value: `/databases/default/documents/users/${uid}` }], result: { value: { data: { ...existing, uid } } } },
      ],
    };
  }
  for (const role of ['student', 'teacher']) {
    cases.push([`${role} edits name/language`, update(role, { name: 'Updated', preferredLanguage: 'he' }, {}, 'ALLOW')]);
    cases.push([`${role} cannot choose unsupported language`, update(role, { preferredLanguage: 'xx' }, {}, 'DENY')]);
    cases.push([`${role} verified phone update`, update(role, { phoneNumber: '+972509999999' }, { phone_number: '+972509999999' }, 'ALLOW')]);
    cases.push([`${role} contact phone without verification allowed`, update(role, { phoneNumber: '+972509999999' }, { phone_number: phone }, 'ALLOW')]);
    cases.push([`${role} cannot edit someone else's personal data`, update(role, { name: 'Forged' }, {}, 'DENY', 'attacker')]);
    for (const [field, value] of Object.entries({ role: 'owner', isAdmin: true, permissions: ['admin'], purchases: ['p1'], programAccess: ['p1'], xp: 100, classId: 'other', teacherId: 'other', email: 'forged@example.com', plan: 'premium' })) {
      cases.push([`${role} protected ${field} rejected`, update(role, { [field]: value }, {}, 'DENY')]);
    }
  }
  const result = await client.post(`/projects/${project}:test`, { source: { files: [{ name: 'firestore.rules', content: fs.readFileSync(path.resolve(__dirname, '../firestore.rules'), 'utf8') }] }, testSuite: { testCases: cases.map(([, value]) => value) } }, { skipLog: { body: true, resBody: true } });
  assert.ok(!result.body.issues?.some(issue => issue.severity === 'ERROR'), JSON.stringify(result.body.issues));
  assert.equal(result.body.testResults?.length, cases.length);
  result.body.testResults.forEach((result, index) => { assert.equal(result.state, 'SUCCESS', `${cases[index][0]}: ${JSON.stringify(result)}`); console.log(`PASS ${cases[index][0]}`); });
}
main().catch(error => { console.error(error.message); process.exitCode = 1; });
