import { useEffect, useRef, useState } from 'react';
import { auth } from '../firebase/firebase';
import { loadContentProgress, saveContentProgress } from './contentProgress';

// One hydration, ordering, retry and persistence path for every player type.
export function useContentProgress({ enabled, programId, contentId, snapshot, onRestore, canRestore = true }) {
  const [session, setSession] = useState(null);
  const [error, setError] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const [loaded, setLoaded] = useState(null);
  const restore = useRef(onRestore);
  const latest = useRef(null);
  restore.current = onRestore;
  const key = `${auth.currentUser?.uid}:${programId}:${contentId}`;
  const ready = !enabled || (canRestore && session === key);

  const cacheKey = `techminds:resume:${key}`;
  const remember = data => {
    try { localStorage.setItem(cacheKey, JSON.stringify(data)); } catch { /* Server remains authoritative. */ }
  };
  const persist = (uid, data) => saveContentProgress(uid, data).then(() => {
    try {
      if (localStorage.getItem(cacheKey) === JSON.stringify(data)) localStorage.removeItem(cacheKey);
    } catch { /* Storage may be disabled. */ }
  });

  useEffect(() => {
    if (!enabled) { setSession(null); return; }
    let active = true;
    latest.current = null;
    setSession(null);
    setLoaded(null);
    setError(false);
    loadContentProgress(programId, contentId).then(records => {
      if (!active) return;
      let cached;
      try { cached = JSON.parse(localStorage.getItem(cacheKey)); } catch { /* Ignore corrupt cache. */ }
      const saved = records.find(item => item.contentId === contentId);
      setLoaded({ key, attempt, saved: cached?.contentId === contentId && cached?.programId === programId ? cached : saved });
    }).catch(() => { if (active) setError(true); });
    return () => { active = false; };
  }, [enabled, programId, contentId, key, cacheKey, attempt]);

  useEffect(() => {
    if (!enabled || !canRestore || loaded?.key !== key || loaded?.attempt !== attempt || session === key) return;
    restore.current(loaded.saved);
    setSession(key);
  }, [enabled, canRestore, loaded, key, attempt, session]);

  useEffect(() => {
    if (!enabled || !ready) return;
    const uid = auth.currentUser?.uid;
    latest.current = { ...snapshot, programId, contentId };
    remember(latest.current);
    const timer = setTimeout(() => {
      const data = latest.current;
      latest.current = null;
      if (data) persist(uid, data).then(() => setError(false)).catch(() => setError(true));
    }, 200);
    return () => clearTimeout(timer);
  }, [enabled, ready, snapshot, programId, contentId]);

  useEffect(() => {
    if (!enabled) return;
    const uid = auth.currentUser?.uid;
    const flush = () => {
      const data = latest.current;
      latest.current = null;
      if (data) persist(uid, data).catch(() => {});
    };
    window.addEventListener('pagehide', flush);
    return () => { window.removeEventListener('pagehide', flush); flush(); };
  }, [enabled, programId, contentId]);

  return { ready, error, retry: () => { setSession(null); setAttempt(value => value + 1); } };
}
