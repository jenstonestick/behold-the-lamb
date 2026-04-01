import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import type { AppState } from './types';
import { getCurrent, loadState, saveState, computeSchedule, buildWeeksMeta } from './utils';
import { hasConfig } from './firebase';
import { useAuth } from './hooks/useAuth';
import { useFirestoreSync } from './hooks/useFirestoreSync';
import { useSettings } from './hooks/useSettings';
import DayView from './components/DayView';
import WeekView from './components/WeekView';
import OverviewView from './components/OverviewView';
import NotesView from './components/NotesView';
import SettingsPanel from './components/SettingsPanel';

type View = 'day' | 'week' | 'overview' | 'notes';

function parseDate(s: string): Date {
  const [y, m, d] = s.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export default function App() {
  const [view, setView] = useState<View>('day');
  const [st, setSt] = useState<AppState>({ done: {}, bm: {}, notes: {} });
  const [rdy, setRdy] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [showSettings, setShowSettings] = useState(false);
  const { settings, update: updateSettings } = useSettings();
  const { user, loading: authLoading, signIn, signOut } = useAuth();
  const { syncToFirestore } = useFirestoreSync(user, st, (s) => {
    if (typeof s === 'function') {
      setSt(prev => {
        const next = (s as (p: AppState) => AppState)(prev);
        return next;
      });
    } else {
      setSt(s);
    }
  });

  // Schedule engine: compute once when startDate changes
  const startDate = useMemo(() => parseDate(settings.startDate), [settings.startDate]);
  const schedule = useMemo(() => computeSchedule(startDate), [startDate]);
  const weeksMeta = useMemo(() => buildWeeksMeta(schedule, startDate), [schedule, startDate]);
  const cur = useMemo(() => getCurrent(startDate), [startDate]);

  // Content week for a position
  const cw = useCallback((pos: number) => schedule[pos - 1], [schedule]);

  const [selW, setSelW] = useState(cur.week);
  const [selD, setSelD] = useState(cur.day);

  useEffect(() => {
    const s = loadState() as Partial<AppState>;
    setSt(prev => ({ ...prev, ...s }));
    setRdy(true);
  }, []);

  // Reset selection when start date changes
  useEffect(() => {
    setSelW(cur.week);
    setSelD(cur.day);
  }, [cur.week, cur.day]);

  const persist = useCallback((ns: AppState) => {
    setSt(ns);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => saveState(ns), 400);
    syncToFirestore(ns);
  }, [syncToFirestore]);

  // State keys use content week, not position
  const tog = useCallback((key: 'done' | 'bm', w: number, d: number) => {
    const id = `${cw(w)}-${d}`;
    setSt(prev => {
      const ns = { ...prev, [key]: { ...prev[key], [id]: !prev[key][id] } };
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => saveState(ns), 400);
      syncToFirestore(ns);
      return ns;
    });
  }, [cw, syncToFirestore]);

  const setNote = useCallback((w: number, d: number, txt: string) => {
    const ns = { ...st, notes: { ...st.notes, [`${cw(w)}-${d}`]: txt } };
    persist(ns);
  }, [st, cw, persist]);

  const goDay = (w: number, d: number) => { setSelW(w); setSelD(d); setView('day'); window.scrollTo(0, 0); };
  const goWeek = (w: number) => { setSelW(w); setView('week'); window.scrollTo(0, 0); };
  const goHome = () => { setSelW(cur.week); setSelD(cur.day); setView('day'); window.scrollTo(0, 0); };
  const wProg = useCallback((w: number) => {
    let n = 0;
    const c = cw(w);
    for (let i = 0; i < 7; i++) if (st.done[`${c}-${i}`]) n++;
    return n;
  }, [cw, st.done]);

  // Compute plan year label from startDate
  const planYear = startDate.getFullYear();
  const endDate = new Date(startDate.getTime() + 49 * 7 * 86400000);
  const planLabel = planYear === endDate.getFullYear()
    ? `${planYear} Study Plan`
    : `${planYear}–${endDate.getFullYear()} Study Plan`;

  if (!rdy) {
    return (
      <div style={{ padding: '3rem', textAlign: 'center', fontFamily: 'var(--font-serif)', color: 'var(--stone)' }}>
        Loading...
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 640, margin: '0 auto', padding: '0 1rem 3rem', fontFamily: 'var(--font-sans)' }}>
      {/* Header */}
      <div style={{ textAlign: 'center', padding: '1.25rem 0 0.75rem', borderBottom: '0.5px solid var(--gold)', marginBottom: '1rem', position: 'relative' }}>
        <div style={{ fontSize: 10, letterSpacing: '0.15em', color: 'var(--stone)', textTransform: 'uppercase', marginBottom: 4 }}>
          {planLabel}
        </div>
        <div
          onClick={goHome}
          style={{ fontSize: 20, fontWeight: 500, fontFamily: 'var(--font-serif)', color: 'var(--brown)', cursor: 'pointer' }}
        >
          Behold the Lamb
        </div>

        {/* Auth / Settings button */}
        <div style={{ position: 'absolute', right: 0, top: '50%', transform: 'translateY(-50%)', display: 'flex', alignItems: 'center', gap: 6 }}>
          {hasConfig && !authLoading && !user && (
            <button
              onClick={signIn}
              style={{
                background: 'none', border: '0.5px solid var(--gold)', borderRadius: 6,
                padding: '4px 10px', fontSize: 11, color: 'var(--stone)', cursor: 'pointer',
                fontFamily: 'var(--font-sans)',
              }}
            >
              Sign in
            </button>
          )}
          {!authLoading && (
            <button
              onClick={() => setShowSettings(true)}
              style={{
                background: 'none', border: 'none', cursor: 'pointer', padding: 4,
                display: 'flex', alignItems: 'center',
              }}
              title={user ? `Signed in as ${user.displayName || user.email}` : 'Settings'}
            >
              {user?.photoURL ? (
                <img
                  src={user.photoURL}
                  alt=""
                  style={{ width: 26, height: 26, borderRadius: '50%', border: '1.5px solid var(--gold)' }}
                  referrerPolicy="no-referrer"
                />
              ) : user ? (
                <div style={{
                  width: 26, height: 26, borderRadius: '50%', background: 'var(--olive)',
                  color: 'var(--cream)', fontSize: 12, fontWeight: 600,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  {(user.displayName || user.email || '?')[0].toUpperCase()}
                </div>
              ) : (
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--stone)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="3" />
                  <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
                </svg>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 0, marginBottom: '1.25rem', borderBottom: '0.5px solid var(--gold)' }}>
        {[
          { id: 'day' as View, label: 'Today' },
          { id: 'week' as View, label: `Week ${selW}` },
          { id: 'overview' as View, label: 'All weeks' },
          { id: 'notes' as View, label: 'My notes' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => tab.id === 'day' ? goHome() : setView(tab.id)}
            style={{
              flex: 1, padding: '8px 0', fontSize: 12,
              fontWeight: view === tab.id ? 500 : 400,
              color: view === tab.id ? 'var(--brown)' : 'var(--stone)',
              background: 'none', border: 'none',
              borderBottom: view === tab.id ? '2px solid var(--olive)' : '2px solid transparent',
              cursor: 'pointer',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Views */}
      {view === 'day' && <DayView w={selW} d={selD} st={st} schedule={schedule} weeksMeta={weeksMeta} tog={tog} setNote={setNote} goDay={goDay} goWeek={goWeek} />}
      {view === 'week' && <WeekView w={selW} st={st} schedule={schedule} weeksMeta={weeksMeta} tog={tog} wProg={wProg} goDay={goDay} goWeek={goWeek} />}
      {view === 'overview' && <OverviewView cur={cur} st={st} weeksMeta={weeksMeta} wProg={wProg} goWeek={goWeek} />}
      {view === 'notes' && <NotesView st={st} schedule={schedule} weeksMeta={weeksMeta} goDay={goDay} />}

      {/* Settings panel */}
      {showSettings && (
        <SettingsPanel
          settings={settings}
          update={updateSettings}
          user={user}
          signIn={signIn}
          signOut={signOut}
          onClose={() => setShowSettings(false)}
        />
      )}
    </div>
  );
}
