import { useState, useEffect, useCallback, useRef } from 'react';
import type { AppState } from './types';
import { getCurrent, loadState, saveState } from './utils';
import DayView from './components/DayView';
import WeekView from './components/WeekView';
import OverviewView from './components/OverviewView';

type View = 'day' | 'week' | 'overview';

export default function App() {
  const [view, setView] = useState<View>('day');
  const cur = getCurrent();
  const [selW, setSelW] = useState(cur.week);
  const [selD, setSelD] = useState(cur.day);
  const [st, setSt] = useState<AppState>({ done: {}, bm: {}, notes: {} });
  const [rdy, setRdy] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const s = loadState() as Partial<AppState>;
    setSt(prev => ({ ...prev, ...s }));
    setRdy(true);
  }, []);

  const persist = useCallback((ns: AppState) => {
    setSt(ns);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => saveState(ns), 400);
  }, []);

  const tog = (key: 'done' | 'bm', w: number, d: number) => {
    const id = `${w}-${d}`;
    persist({ ...st, [key]: { ...st[key], [id]: !st[key][id] } });
  };

  const setNote = (w: number, d: number, txt: string) => {
    persist({ ...st, notes: { ...st.notes, [`${w}-${d}`]: txt } });
  };

  const goDay = (w: number, d: number) => { setSelW(w); setSelD(d); setView('day'); window.scrollTo(0, 0); };
  const goWeek = (w: number) => { setSelW(w); setView('week'); window.scrollTo(0, 0); };
  const goHome = () => { setSelW(cur.week); setSelD(cur.day); setView('day'); window.scrollTo(0, 0); };
  const wProg = (w: number) => { let n = 0; for (let i = 0; i < 7; i++) if (st.done[`${w}-${i}`]) n++; return n; };

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
      <div style={{ textAlign: 'center', padding: '1.25rem 0 0.75rem', borderBottom: '0.5px solid var(--gold)', marginBottom: '1rem' }}>
        <div style={{ fontSize: 10, letterSpacing: '0.15em', color: 'var(--stone)', textTransform: 'uppercase', marginBottom: 4 }}>
          2026 Study Plan
        </div>
        <div
          onClick={goHome}
          style={{ fontSize: 20, fontWeight: 500, fontFamily: 'var(--font-serif)', color: 'var(--brown)', cursor: 'pointer' }}
        >
          Behold the Lamb
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 0, marginBottom: '1.25rem', borderBottom: '0.5px solid var(--gold)' }}>
        {[
          { id: 'day' as View, label: 'Today' },
          { id: 'week' as View, label: `Week ${selW}` },
          { id: 'overview' as View, label: 'All weeks' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => tab.id === 'day' ? goHome() : setView(tab.id)}
            style={{
              flex: 1, padding: '8px 0', fontSize: 13,
              fontWeight: view === tab.id ? 500 : 400,
              color: view === tab.id ? 'var(--brown)' : 'var(--stone)',
              background: 'none', border: 'none',
              borderBottom: view === tab.id ? '2px solid var(--gold)' : '2px solid transparent',
              cursor: 'pointer',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Views */}
      {view === 'day' && <DayView w={selW} d={selD} st={st} tog={tog} setNote={setNote} goDay={goDay} goWeek={goWeek} />}
      {view === 'week' && <WeekView w={selW} st={st} tog={tog} wProg={wProg} goDay={goDay} goWeek={goWeek} />}
      {view === 'overview' && <OverviewView cur={cur} st={st} wProg={wProg} goWeek={goWeek} />}
    </div>
  );
}
