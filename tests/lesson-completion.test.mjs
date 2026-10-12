import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {runInNewContext} from 'node:vm';
import {createRequire} from 'node:module';
import {compareProgramLessons, programLessonViews} from '../functions/programAccessPolicy.mjs';
const require=createRequire(import.meta.url);
const {isValidMissionCompletion}=require('../functions/missionValidation.js');
const source=readFileSync(new URL('../functions/index.js',import.meta.url),'utf8');
function fixture({selected, denied=false}={}) {
  const records=new Map([
    ['users/u',{role:'student',xp:0,completedLessons:0}],
    ['programs/p',{status:'published',accessType:'paid',previewLessonCount:0}],
  ]);
  for(const [id,order,type] of [['a',1,'lesson'],['b',2,'mission'],['c',3,'lesson']]) records.set('lessons/'+id,{
    id,order,activityType:type,programId:'p',lessonType:'commercial',status:'published',xp:100,title:{en:id},
    sections:[{id:'s',type:type==='mission'?'story':'content'}],
  });
  const snap=path=>({id:path.split('/').at(-1),exists:records.has(path),data:()=>records.get(path)});
  const ref=path=>({path,get:async()=>snap(path)});
  let writes=0,queue=Promise.resolve();
  const db={collection:name=>({
    doc:id=>ref(name+'/'+id),
    where:(field,_op,value)=>({get:async()=>({docs:[...records.keys()].filter(path=>path.startsWith(name+'/')&&records.get(path)[field]===value).map(snap)})}),
  }),runTransaction:fn=>{
    const run=queue.then(async()=>{const pending=[];const result=await fn({
      get:async r=>snap(r.path),set:(r,data,opts)=>pending.push([r.path,data,opts?.merge]),
      update:(r,data)=>pending.push([r.path,data,true]),
    });for(const [path,data,merge] of pending){writes++;records.set(path,merge?{...records.get(path),...data}:data);}return result;});
    queue=run.catch(()=>{});return run;
  }};
  const context={exports:{},db,compareProgramLessons,programLessonViews,isValidMissionCompletion,
    onCall:(_options,handler)=>handler,FieldValue:{serverTimestamp:()=>123},
    requireRole:async()=>records.get('users/u'),
    resolveLessonCompletionAccess:async()=>denied?null:{accessType:'manual',accessScope:selected?'selected':'full',lessonIds:selected},
    HttpsError:class extends Error{constructor(code,message){super(message);this.code=code;}},
  };
  runInNewContext(source.slice(source.indexOf('function isRecord('),source.indexOf('async function resolveLessonCompletionAccess(')),context);
  runInNewContext(source.slice(source.indexOf('function completionMetadata('),source.indexOf('exports.getPurchasedProgram =')),context);
  const complete=(id,extra={})=>context.exports.completeLesson({auth:{uid:'u'},data:{
    lessonId:id,progress:{currentSlide:0,maxUnlockedSlide:0,selectedAnswers:{},answerResults:{},taskAnswers:{}},
    mission:{version:1,currentScreen:0,screens:{s:{passed:true}}},...extra,
  }});
  return {records,complete,get writes(){return writes;}};
}
test('lesson → mission → lesson follows server order and finishes the program',async()=>{
  const f=fixture();
  assert.equal((await f.complete('a')).nextLessonId,'b');
  const middle=await f.complete('b');assert.equal(middle.nextLessonId,'c');assert.equal(middle.nextLessonTitle.en,'c');
  const last=await f.complete('c');assert.equal(last.nextLessonId,null);assert.equal(last.programCompleted,true);assert.equal(last.programCompletedNow,true);
  assert.equal(f.records.get('users/u').xp,300);
  assert.equal(f.records.get('users/u').completedPrograms,1);
});
test('duplicate/concurrent completion awards XP and program count only once',async()=>{
  const f=fixture();const result=await Promise.all([f.complete('a'),f.complete('a')]);
  assert.equal(result.filter(x=>x.alreadyCompleted).length,1);assert.equal(f.records.get('users/u').xp,100);
  await f.complete('b');await f.complete('c');const last=await f.complete('c');
  assert.equal(last.alreadyCompleted,true);assert.equal(last.programCompletedNow,false);assert.equal(f.records.get('users/u').completedPrograms,1);
});
test('refresh summary is read-only and cannot complete unfinished content',async()=>{
  const f=fixture();await assert.rejects(f.complete('a',{readOnly:true}),{code:'failed-precondition'});
  assert.equal(f.writes,0);await f.complete('a');const before=f.writes;
  const result=await f.complete('a',{readOnly:true,progress:undefined,mission:undefined});
  assert.equal(result.nextLessonId,'b');assert.equal(result.alreadyCompleted,true);assert.equal(f.writes,before);
  assert.equal(f.records.get('users/u').xp,100);
});
test('next content excludes locked lessons and inherited mission access is retained',async()=>{
  const f=fixture({selected:['a','c']});
  assert.equal((await f.complete('a')).nextLessonId,'c');
  const g=fixture({selected:['a']});g.records.get('lessons/b').parentLessonId='a';
  assert.equal((await g.complete('a')).nextLessonId,'b');
});
test('no accessible next content does not falsely declare program completion',async()=>{
  const f=fixture({selected:['a']});const result=await f.complete('a');
  assert.equal(result.nextLessonId,null);assert.equal(result.programCompleted,false);
});
test('out-of-order completion prefers following content then remaining earlier content',async()=>{
  const f=fixture();assert.equal((await f.complete('b')).nextLessonId,'c');
  assert.equal((await f.complete('c')).nextLessonId,'a');
  assert.equal((await f.complete('a')).programCompleted,true);
});
test('drafts are excluded; existing order aliases and deterministic ties are respected',async()=>{
  const f=fixture();delete f.records.get('lessons/b').order;f.records.get('lessons/b').lessonOrder=4;
  f.records.get('lessons/c').position=2;delete f.records.get('lessons/c').order;
  assert.equal((await f.complete('a')).nextLessonId,'c');
  f.records.get('lessons/b').status='draft';assert.equal((await f.complete('c')).programCompleted,true);
});
test('access denial applies to both completion and read-only summary',async()=>{
  const f=fixture({denied:true});
  await assert.rejects(f.complete('a'),{code:'permission-denied'});
  await assert.rejects(f.complete('a',{readOnly:true}),{code:'permission-denied'});
  assert.equal(f.writes,0);
});
