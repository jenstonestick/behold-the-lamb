import type { AppState } from '../types';
import { WEEKS } from '../utils';
import { content } from '../content';

interface Props {
  cur: { week: number; day: number };
  st: AppState;
  wProg: (w: number) => number;
  goWeek: (w: number) => void;
}

export default function OverviewView({ cur, st, wProg, goWeek }: Props) {
  const totalDone = Object.values(st.done).filter(Boolean).length;

  return (
    <div>
      <div style={{ background: 'var(--surface)', borderRadius: 6, padding: '10px 14px', marginBottom: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: 12, color: 'var(--stone)' }}>{totalDone}/350 days</span>
        <div style={{ width: 100, height: 4, borderRadius: 2, background: 'var(--gold)', opacity: 0.3, overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${Math.round(totalDone / 350 * 100)}%`, borderRadius: 2, background: 'var(--gold)', transition: 'width 0.3s' }} />
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        {WEEKS.map(wm => {
          const prog = wProg(wm.week);
          const isCur = wm.week === cur.week;
          const has = !!content[wm.week];
          return (
            <button
              key={wm.week}
              onClick={() => goWeek(wm.week)}
              style={{
                display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', width: '100%', textAlign: 'left',
                background: isCur ? 'var(--surface)' : 'var(--cream)',
                border: isCur ? '1.5px solid var(--gold)' : '0.5px solid var(--gold)',
                borderRadius: 6, cursor: 'pointer',
              }}
            >
              <span style={{ fontSize: 11, fontWeight: 500, color: 'var(--stone)', minWidth: 28 }}>W{wm.week}</span>
              <span style={{ flex: 1, fontSize: 13, color: 'var(--brown)' }}>{wm.topic}</span>
              {!has && <span style={{ fontSize: 10, color: 'var(--stone)', fontStyle: 'italic', opacity: 0.6 }}>soon</span>}
              {has && (
                <div style={{ width: 40, height: 3, borderRadius: 2, background: 'var(--gold)', opacity: 0.3, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${Math.round(prog / 7 * 100)}%`, borderRadius: 2, background: 'var(--gold)' }} />
                </div>
              )}
              {isCur && <span style={{ fontSize: 9, fontWeight: 500, color: 'var(--stone)', letterSpacing: '0.05em' }}>NOW</span>}
            </button>
          );
        })}
      </div>
    </div>
  );
}
