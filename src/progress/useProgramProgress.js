import { useEffect, useState } from 'react';
import { loadContentProgress } from './contentProgress';

export function useProgramProgress(programId, enabled) {
  const [data, setData] = useState({ programId, records: [], ready: false, error: false });
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    if (!enabled) return;
    let active = true;
    const load = () => loadContentProgress(programId).then(records => {
      if (active) setData({ programId, records, ready: true, error: false });
    }).catch(() => {
      if (active) setData({ programId, records: [], ready: true, error: true });
    });
    load();
    window.addEventListener('focus', load);
    return () => { active = false; window.removeEventListener('focus', load); };
  }, [programId, enabled, attempt]);
  return { ...(data.programId === programId ? data : { records: [], ready: false, error: false }),
    retry: () => setAttempt(value => value + 1) };
}
