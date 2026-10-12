// Non-deploying Firebase Rules API regression tests. All user lookups are mocked.
// Run: node tests/owner-lesson-save-rules.cjs <project-id>
// Requires a signed-in Firebase CLI; set FIREBASE_TOOLS_LIB if installed elsewhere.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

async function main() {
  const project = process.argv[2];
  assert.ok(project, 'Pass the Firebase project ID for the rules test endpoint.');
  const cli = process.env.FIREBASE_TOOLS_LIB || path.join(
    process.env.APPDATA, 'npm/node_modules/firebase-tools/lib',
  );
  const account = require(path.join(cli, 'auth')).getGlobalDefaultAccount();
  await require(path.join(cli, 'requireAuth')).requireAuth({ project, ...account });
  const { Client } = require(path.join(cli, 'apiv2'));
  const client = new Client({ urlPrefix: 'https://firebaserules.googleapis.com', apiVersion: 'v1' });
  const source = fs.readFileSync(path.join(__dirname, '../firestore.rules'), 'utf8');
  // These rules compare timestamps for equality; matching test values model
  // preserved createdAt and serverTimestamp() == request.time.
  const time = '2026-09-09T12:00:00Z';
  const before = {
    title: { en: 'Coding', ar: 'Coding' }, description: { en: 'Description', ar: '' },
    status: 'published', createdBy: 'owner', createdAt: '2026-09-01T12:00:00Z',
    updatedAt: '2026-09-01T12:00:00Z', publishedAt: '2026-09-01T12:00:00Z',
    accessType: 'free', price: 0,
  };
  const after = {
    ...before, title: { en: 'Updated', ar: 'Updated' }, description: { en: 'Updated', ar: '' },
    grades: [3, 4], lessonCount: 10, finalProject: { en: 'Build a game', ar: '' },
    pricing: { student: 210, teacher: 100, class: 100 },
    paddlePriceIds: { student: `pri_${'a'.repeat(26)}`, teacher: `pri_${'b'.repeat(26)}`, class: '' },
    updatedAt: time,
  };
  function testCase(role, method, data = after, expectation = 'DENY', status = 'active', document = 'programs/p1', existing = before) {
    return {
      expectation,
      request: {
        auth: role ? { uid: role } : null,
        path: `/databases/default/documents/${document}`, method, time,
        ...(method !== 'delete' && method !== 'get' ? { resource: { data } } : {}),
      },
      ...(method !== 'create' ? { resource: { data: existing } } : {}),
      functionMocks: role ? [
        { function: 'exists', args: [{ exact_value: `/databases/default/documents/users/${role}` }], result: { value: true } },
        { function: 'get', args: [{ exact_value: `/databases/default/documents/users/${role}` }], result: { value: { data: { role, accountStatus: status } } } },
      ] : [],
    };
  }
  async function run(label, content, cases) {
    const result = await client.post(`/projects/${project}:test`, {
      source: { files: [{ name: 'firestore.rules', content }] },
      testSuite: { testCases: cases.map(([, value]) => value) },
    }, { skipLog: { body: true, resBody: true } });
    assert.ok(!result.body.issues?.some(issue => issue.severity === 'ERROR'), JSON.stringify(result.body.issues));
    assert.equal(result.body.testResults?.length, cases.length);
    result.body.testResults.forEach((value, index) => {
      assert.equal(value.state, 'SUCCESS', `${label}: ${cases[index][0]}: ${JSON.stringify(value)}`);
      console.log(`PASS ${label}: ${cases[index][0]}`);
    });
  }
﻿  const importedProgram = {
    id:'math-grade-1-il',slug:'math-grade-1-il',subject:'mathematics',grade:1,
    title:{ar:'حساب',en:'Math',he:'חשבון'},description:{en:'Math'},
    status:'draft',createdBy:'owner',createdAt:before.createdAt,updatedAt:before.updatedAt,
    accessType:'paid',previewLessonCount:1,freeLessonIds:['math-g1-m01'],
    curriculum:{country:'IL',grade:1,subject:'mathematics'},stages:[{id:'math-g1-stage-1'}],
  };
  const importedLesson = {
    programId:'math-grade-1-il',lessonType:'commercial',createdBy:'owner',createdByRole:'owner',
    title:{en:'Math mission'},status:'draft',activityType:'mission',
    stageId:'math-g1-stage-1',curriculum:{country:'IL',grade:1,subject:'mathematics'},
    lessonOrder:1,position:1,order:1,xp:80,xpReward:80,
    sections:[{id:'m01-hook',type:'explain',body:{en:'Start'}}],slideCount:1,
    createdAt:before.createdAt,updatedAt:before.updatedAt,
  };
  const savedLesson={...importedLesson,sections:[{id:'m01-hook',type:'explain',body:{en:'Edited',ar:'تعديل',he:'עריכה'}}],updatedAt:time};
  const touchedProgram={...importedProgram,updatedAt:time};
  const lessonCase=(role,data=savedLesson,expectation='DENY',status='active',existing=importedLesson,method='update')=>
    testCase(role,method,data,expectation,status,'lessons/math-g1-m01',existing);
  const programCase=(role,data=touchedProgram,expectation='DENY',status='active')=>
    testCase(role,'update',data,expectation,status,'programs/math-grade-1-il',importedProgram);
  const old=source.replace(' || ownerProgramTimestampUpdate()','').replace('(validLesson(request.resource.data) || ownerLessonContentUpdate())','validLesson(request.resource.data)');
  assert.notEqual(old,source);
  await run('reproduce current editor failure',old,[
    ['first updateDoc lessons/math-g1-m01 rejected by imported metadata',lessonCase('owner')],
    ['second updateDoc programs/math-grade-1-il rejected by imported program schema',programCase('owner')],
  ]);
  const cases=[
    ['owner saves imported mission without deleting metadata',lessonCase('owner',savedLesson,'ALLOW')],
    ['owner adds a section',lessonCase('owner',{...savedLesson,sections:[...savedLesson.sections,{id:'new',type:'explain'}],slideCount:2},'ALLOW')],
    ['owner saves empty editor',lessonCase('owner',{...savedLesson,sections:[],slideCount:0},'ALLOW')],
    ['owner touches imported parent program',programCase('owner',touchedProgram,'ALLOW')],
    ['unrecognized lesson metadata cannot change',lessonCase('owner',{...savedLesson,stageId:'changed'})],
    ['new unknown lesson field cannot be added',lessonCase('owner',{...savedLesson,extra:true})],
    ['XP cannot change through exception',lessonCase('owner',{...savedLesson,xpReward:500})],
    ['program binding cannot change',lessonCase('owner',{...savedLesson,programId:'other'})],
    ['creator cannot change',lessonCase('owner',{...savedLesson,createdBy:'other'})],
    ['creation time cannot change',lessonCase('owner',{...savedLesson,createdAt:time})],
    ['parent mission binding cannot change',lessonCase('owner',{...savedLesson,parentLessonId:'other'})],
    ['non-list sections rejected',lessonCase('owner',{...savedLesson,sections:{},slideCount:0})],
    ['too many sections rejected',lessonCase('owner',{...savedLesson,sections:Array.from({length:301},()=>({id:'x'})),slideCount:301})],
    ['incorrect slide count rejected',lessonCase('owner',{...savedLesson,slideCount:2})],
    ['forged lesson update time rejected',lessonCase('owner',{...savedLesson,updatedAt:before.updatedAt})],
    ['program title cannot change through timestamp exception',programCase('owner',{...touchedProgram,title:{en:'Changed'}})],
    ['program price cannot change through timestamp exception',programCase('owner',{...touchedProgram,price:0})],
    ['program ownership cannot change',programCase('owner',{...touchedProgram,createdBy:'other'})],
    ['program creation time cannot change',programCase('owner',{...touchedProgram,createdAt:time})],
    ['program forged timestamp rejected',programCase('owner',{...touchedProgram,updatedAt:'invalid'})],
    ['suspended owner cannot save lesson',lessonCase('owner',savedLesson,'DENY','suspended')],
    ['suspended owner cannot touch program',programCase('owner',touchedProgram,'DENY','suspended')],
  ];
  for(const role of ['student','teacher',null,'unknown']){
    cases.push([String(role)+' cannot edit imported lesson',lessonCase(role)]);
    cases.push([String(role)+' cannot touch parent',programCase(role)]);
  }
  const normal={...importedLesson};
  for(const key of ['stageId','curriculum','lessonOrder','position'])delete normal[key];
  cases.push(['normal owner create stays supported',lessonCase('owner',{...normal,createdAt:time,updatedAt:time},'ALLOW','active',normal,'create')]);
  cases.push(['normal owner edit stays supported',lessonCase('owner',{...normal,updatedAt:time},'ALLOW','active',normal)]);
  for(const role of ['student','teacher',null]){
    cases.push([String(role)+' cannot create commercial lesson',lessonCase(role,{...normal,createdBy:role,createdAt:time,updatedAt:time},'DENY','active',normal,'create')]);
  }
  const legacy={...before};delete legacy.accessType;delete legacy.price;
  cases.push(['owner timestamp-only save for original legacy catalog',testCase('owner','update',{...legacy,updatedAt:time},'ALLOW','active','programs/legacy',legacy)]);
  await run('owner lesson save fix',source,cases);
}
main().catch(error=>{console.error(error.message);process.exitCode=1;});
