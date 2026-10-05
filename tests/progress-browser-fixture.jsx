import MissionPlayer from '../src/components/mission/MissionPlayer';
import mission from '../src/data/missions/computer-science-modern-technology/mission01.js';
﻿import React, { useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { LanguageProvider, useLanguage } from '../src/context/LanguageContext';
import PublicLayout from '../src/components/PublicLayout';
import ProgramContinueCard from '../src/progress/ProgramContinueCard';
import { useContentProgress } from '../src/progress/useContentProgress';

window.fixture = {
  auth: { currentUser: {uid:'student'} }, records: [], writes: [], fail: false,
  async call(name, data) {
    if (this.fail) throw Error('offline');
    if (name === 'getContentProgress') { this.readCalls=(this.readCalls||0)+1; this.lastRead=data; if(this.readGate) await this.readGate; return {data:{progress:this.records}}; }
    this.writes.push(data);
    this.records = [{...data,userId:'student',contentType:window.kind,progressPercent:50,updatedAt:new Date().toISOString()}];
    return {data:{saved:true}};
  },
};
function Player() {
  const [index,setIndex]=useState(0);
  const {t}=useLanguage();
  const resume=useContentProgress({enabled:true,programId:'p1',contentId:'c1',
    snapshot:useMemo(()=>({lastSectionIndex:index,status:'in_progress',state:{answer:'saved'}}),[index]),
    onRestore:saved=>{if(saved)setIndex(saved.lastSectionIndex);}});
  return <><output data-ready={resume.ready}>{index}</output><button id="next" onClick={()=>setIndex(n=>n+1)}>{t.progress.continueAction}</button>
    {resume.error && <button id="retry" onClick={resume.retry}>{t.progress.retry}</button>}</>;
}
let root;
window.mount = (language='en', player=true, path='/programs/p1', kind='lesson') => {
  root?.unmount();
  localStorage.setItem('TechMinds-language',language);
  window.kind=kind;
  root=createRoot(document.getElementById('root'));
  root.render(<LanguageProvider><MemoryRouter initialEntries={[path]}><Routes><Route element={<PublicLayout />}><Route path="*" element={player ? <Player /> : <ProgramContinueCard programId="p1" title="Sample" record={{contentId:'c1',lastSectionIndex:2,progressPercent:50,status:'in_progress'}} />} /></Route></Routes></MemoryRouter></LanguageProvider>);
};

window.mountMission = () => {
 root?.unmount();
 root=createRoot(document.getElementById('root'));
 const repository = {
   loadMission:async()=>{ fixture.legacyCalls=(fixture.legacyCalls||0)+1; await fixture.legacyGate; return {}; },
   saveMission:async()=>{ fixture.legacyWrites=(fixture.legacyWrites||0)+1; },
   completeMission:async()=>({xp:0,alreadyCompleted:false}),
 };
 root.render(<LanguageProvider><MissionPlayer lesson={{...mission,id:'c1',programId:'p1'}} student={{id:'student'}} repository={repository} onExit={()=>{}} /></LanguageProvider>);
};
