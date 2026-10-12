import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {runInNewContext} from 'node:vm';
import {createRequire} from 'node:module';
import program from '../functions/content/TechMinds_Grade1_Math.js';
import {validateMission, checkAnswer} from '../src/components/mission/missionEngine.js';
import {programLessonViews} from '../functions/programAccessPolicy.mjs';
const {isValidMissionCompletion}=createRequire(import.meta.url)('../functions/missionValidation.js');

function localized(value,path) {
  for(const language of ['ar','he','en']) {
    assert.equal(typeof value?.[language],'string',path+'.'+language);
    assert.ok(value[language].trim(),path+'.'+language);
  }
}
test('30 stable mission IDs, order and stage metadata remain intact',()=>{
  assert.equal(program.id,'math-grade-1-il');
  assert.deepEqual(program.lessons.map(l=>l.id),Array.from({length:30},(_,i)=>'math-g1-m'+String(i+1).padStart(2,'0')));
  assert.equal(program.stages.length,3);
  for(const [index,lesson] of program.lessons.entries()){
    assert.equal(lesson.programId,program.id);
    assert.equal(lesson.order,index+1);
    assert.equal(lesson.activityType,'mission');
    assert.equal(lesson.stageId,'math-g1-stage-'+(Math.floor(index/10)+1));
    assert.ok(validateMission(lesson.sections),lesson.id);
    assert.equal(new Set(lesson.sections.map(s=>s.id)).size,lesson.sections.length);
  }
});
test('all student-facing titles, prompts, explanations, choices and CTA text have three translations',()=>{
  localized(program.title,'program.title');localized(program.description,'program.description');
  for(const stage of program.stages)localized(stage.title,stage.id);
  for(const lesson of program.lessons){
    localized(lesson.title,lesson.id);localized(lesson.description,lesson.id);
    for(const section of lesson.sections){
      localized(section.title,section.id+'.title');
      localized(section.body||section.text,section.id+'.prompt');
      for(const key of ['explanation','cta'])if(section[key])localized(section[key],section.id+'.'+key);
      for(const option of section.options||section.items||[])localized(option.text,section.id+'.'+option.id);
    }
  }
});
test('every graded question has unique choices and valid answers accepted by client/server; wrong answers fail',()=>{
  let choices=0,sequences=0;
  for(const lesson of program.lessons){
    const screens={};
    for(const s of lesson.sections){
      assert.ok(['explain','story','multipleChoice','sequence'].includes(s.type),s.id);
      let answer=null;
      if(s.type==='multipleChoice'){
        choices++;assert.ok(s.options.length>=2,s.id);
        assert.equal(new Set(s.options.map(o=>o.id)).size,s.options.length,s.id);
        assert.equal(s.options.filter(o=>o.id===s.correctAnswer).length,1,s.id);
        for(const lang of ['ar','he','en'])assert.equal(new Set(s.options.map(o=>o.text[lang])).size,s.options.length,s.id);
        answer=s.correctAnswer;
      } else if(s.type==='sequence'){
        sequences++;assert.ok(s.items.length>=2,s.id);
        assert.equal(new Set(s.items.map(i=>i.id)).size,s.items.length,s.id);
        assert.deepEqual([...s.correctOrder].sort(),s.items.map(i=>i.id).sort(),s.id);
        const values=s.correctOrder.map(id=>Number(s.items.find(i=>i.id===id).text.en));
        assert.deepEqual(values,[...values].sort((a,b)=>a-b),s.id);
        answer=s.correctOrder;
      }
      if(answer!==null)assert.equal(checkAnswer(s,answer),true,s.id);
      screens[s.id]={passed:true,answer};
    }
    assert.equal(isValidMissionCompletion(lesson.sections,{version:1,screens}),true,lesson.id);
    for(const s of lesson.sections.filter(s=>s.options||s.correctOrder)){
      const wrong=s.options?s.options.find(o=>o.id!==s.correctAnswer).id:[...s.correctOrder].reverse();
      assert.equal(checkAnswer(s,wrong),false,s.id);
      assert.equal(isValidMissionCompletion(lesson.sections,{version:1,screens:{...screens,[s.id]:{passed:true,answer:wrong}}}),false,s.id);
    }
  }
  assert.equal(choices,111);assert.equal(sequences,8);
});
test('existing access policy gives only the first mission free preview when published',()=>{
  assert.equal(program.accessType,'paid');assert.equal(program.previewLessonCount,1);
  assert.deepEqual(program.freeLessonIds,['math-g1-m01']);
  const views=programLessonViews({program:{...program,status:'published'},programId:program.id,user:{role:'student'},access:null,
    lessons:program.lessons.map(l=>({...l,status:'published'}))});
  assert.deepEqual(views.filter(l=>!l.locked).map(l=>l.id),['math-g1-m01']);
  assert.equal(views[0].previewOnly,true);
});

async function simulateImporter(commit) {
  const records=new Map([['programs/existing',{title:'Do not modify'}],['lessons/existing',{programId:'existing'}]]);
  let connections=0;
  const ref=path=>({path,get id(){return path.split('/').at(-1);}});
  const db={
    collection:name=>({doc:id=>ref(name+'/'+id)}),
    getAll:async(...refs)=>refs.map(r=>({ref:r,exists:records.has(r.path),data:()=>records.get(r.path),get:key=>records.get(r.path)?.[key]})),
    runTransaction:async callback=>callback({set:(r,data)=>records.set(r.path,data)}),
  };
  const modules={
    'firebase-admin/app':{initializeApp:()=>{connections++;return {};},applicationDefault:()=>({getAccessToken:async()=>({})})},
    'firebase-admin/firestore':{getFirestore:()=>db,FieldValue:{serverTimestamp:()=>123}},
    './catalogCredentials':{assertImportTarget(){},prepareCredentials:async()=>{},authenticationError:()=>Error('auth')},
  };
  let source=readFileSync(new URL('../functions/scripts/importMathGrade1.js',import.meta.url),'utf8');
  source=source.slice(0,source.lastIndexOf('main().catch'));
  source=source.replace('await import("../content/TechMinds_Grade1_Math.js")','importedMath')
    .replace('await import("../../src/components/mission/missionEngine.js")','importedEngine');
  const context={importedMath:{mathGrade1Program:program},importedEngine:{validateMission},require:name=>{assert.ok(modules[name],name);return modules[name];},
    process:{argv:['node','importMathGrade1.js','owner',...(commit?['--commit']:[])]},console:{log(){},error:message=>assert.fail(message)}};
  runInNewContext(source+'\nthis.run=main;',context);
  await context.run();
  return {records,connections};
}
test('mocked importer writes only this program plus 30 exact mission IDs; unrelated documents stay unchanged',async()=>{
  const {records}=await simulateImporter(true);
  assert.equal(records.size,33);
  assert.deepEqual(records.get('programs/existing'),{title:'Do not modify'});
  assert.deepEqual(records.get('lessons/existing'),{programId:'existing'});
  for(const lesson of program.lessons){
    const saved=records.get('lessons/'+lesson.id);assert.ok(saved,lesson.id);
    assert.equal(saved.programId,program.id);assert.equal(saved.activityType,'mission');
    assert.deepEqual(saved.sections,lesson.sections);
    assert.equal(saved.xpReward,lesson.xpReward);
    assert.equal(records.has('lessons/'+program.id+'--'+lesson.id),false);
  }
  assert.equal(records.get('programs/'+program.id).previewLessonCount,1);
});
test('default validation branch makes no Firebase connection and writes no documents',async()=>{
  const result=await simulateImporter(false);
  assert.equal(result.connections,0);assert.equal(result.records.size,2);
});
