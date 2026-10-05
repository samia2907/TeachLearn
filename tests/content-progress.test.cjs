const test = require('node:test');
const assert = require('node:assert/strict');
const {normalizeProgress, createContentProgressHandlers} = require('../functions/contentProgress');
const lesson = {id: 'l1', programId: 'p1', sections: [{}, {}, {}]};

test('all content types share the same normalized progress model', () => {
  for (const type of ['lesson', 'mission', 'quiz', 'coding', 'future-content']) {
    const record = normalizeProgress({lastSectionIndex: 1, status: 'in_progress'}, {...lesson, contentType: type}, 'u1');
    assert.deepEqual(record, {userId: 'u1', programId: 'p1', contentId: 'l1', contentType: type, lastSectionIndex: 1, progressPercent: 67, status: 'in_progress'});
  }
});
test('completion is sticky, last visited slide can move backwards, and bounds are enforced', () => {
  assert.equal(normalizeProgress({lastSectionIndex: 0, status: 'in_progress'}, lesson, 'u1', {status: 'completed'}).progressPercent, 100);
  assert.equal(normalizeProgress({lastSectionIndex: 2, status: 'in_progress'}, lesson, 'u1').progressPercent, 99);
  for (const lastSectionIndex of [-1, 3, 1.5, NaN]) assert.throws(() => normalizeProgress({lastSectionIndex, status: 'in_progress'}, lesson, 'u1'));
  assert.throws(() => normalizeProgress({lastSectionIndex: 0, status: 'fake'}, lesson, 'u1'));
  assert.equal(normalizeProgress({lastSectionIndex: 3, status: 'completed'}, {...lesson, codingConfig:{language:'python'}}, 'u1').progressPercent, 100);
});

function fixture({access = true, role = 'student', existing = null} = {}) {
  const records = new Map([['lessons/l1', lesson]]);
  if (existing) records.set('users/u1/programProgress/p1/content/l1', existing);
  const snap = path => ({id:path.split('/').at(-1), exists:records.has(path), data:()=>records.get(path)});
  const ref = path => ({path, collection:name=>ref(path+'/'+name), doc:id=>ref(path+'/'+id), get:async()=>snap(path)});
  const db = {collection:name=>ref(name), runTransaction:async fn=>fn({get:async r=>snap(r.path), set:(r,data)=>records.set(r.path,data)})};
  class HttpsError extends Error { constructor(code,message){super(message);this.code=code;} }
  const handlers = createContentProgressHandlers({db,HttpsError,FieldValue:{serverTimestamp:()=>123}, serialize:v=>v,
    requireRole:async request=>{ if(!request.auth || role!=='student') throw new HttpsError('permission-denied','denied'); return {role,accountStatus:'active'}; },
    resolveAccess:async()=>access,
  });
  return {handlers, records};
}
const request = {auth:{uid:'u1'}, data:{programId:'p1',contentId:'l1',lastSectionIndex:1,status:'in_progress',state:{answers:{q:'a'}}}};
test('saves only under the authenticated user and trusts source content metadata', async () => {
  const {handlers,records}=fixture();
  await handlers.saveContentProgress({...request,data:{...request.data,userId:'someone-else',contentType:'fake',progressPercent:100}});
  const record=records.get('users/u1/programProgress/p1/content/l1');
  assert.equal(record.userId,'u1'); assert.equal(record.contentType,'lesson'); assert.equal(record.progressPercent,67); assert.equal(record.updatedAt,123);
  assert.equal(records.size,2); // No XP, completion receipts, or access writes.
});
test('guests, wrong roles, revoked/preview access and cross-program writes are rejected', async () => {
  await assert.rejects(fixture().handlers.saveContentProgress({...request,auth:null}));
  await assert.rejects(fixture({role:'teacher'}).handlers.saveContentProgress(request));
  await assert.rejects(fixture({access:false}).handlers.saveContentProgress(request));
  await assert.rejects(fixture().handlers.saveContentProgress({...request,data:{...request.data,programId:'p2'}}));
});
test('oversized state and invalid indexes cannot be saved', async () => {
  await assert.rejects(fixture().handlers.saveContentProgress({...request,data:{...request.data,state:{code:'x'.repeat(250001)}}}));
  await assert.rejects(fixture().handlers.saveContentProgress({...request,data:{...request.data,lastSectionIndex:99}}));
});
