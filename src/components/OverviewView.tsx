import type { AppState } from '../types';
import type { DynWeekMeta } from '../utils';
import { content } from '../content';

interface Props {
  cur: { week: number; day: number };
  st: AppState;
  weeksMeta: DynWeekMeta[];
  wProg: (w: number) => number;
  goWeek: (w: number) => void;
}

export default function OverviewView({ cur, st, weeksMeta, wProg, goWeek }: Props) {
  const totalDone = Object.values(st.done).filter(Boolean).length;

  return (
    <div>
      <div style={{ background: 'var(--surface)', borderRadius: 6, padding: '10px 14px', marginBottom: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: 12, color: 'var(--stone)' }}>{totalDone}/350 days</span>
        <div style={{ width: 100, height: 4, borderRadius: 2, background: 'var(--cream)', border: '0.5px solid var(--gold)', overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${Math.round(totalDone / 350 * 100)}%`, borderRadius: 2, background: 'var(--olive)', transition: 'width 0.3s' }} />
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        {weeksMeta.map(wm => {
          const prog = wProg(wm.pos);
          const isCur = wm.pos === cur.week;
          const has = !!content[wm.contentWeek];
          return (
            <button
              key={wm.pos}
              onClick={() => goWeek(wm.pos)}
              style={{
                display: 'flex', alignItems: 'center', gap: 8, padding: '8px 10px', width: '100%', textAlign: 'left',
                background: isCur ? 'var(--surface)' : 'var(--cream)',
                border: isCur ? '1.5px solid var(--gold)' : '0.5px solid var(--gold)',
                borderRadius: 6, cursor: 'pointer',
              }}
            >
              {/* Dates on left */}
              <span style={{
                fontSize: 10, color: 'var(--stone)', minWidth: 62, flexShrink: 0,
                letterSpacing: '0.01em',
              }}>
                {wm.dates}
              </span>

              {/* Topic - left aligned, takes remaining space */}
              <span style={{ flex: 1, fontSize: 13, color: 'var(--brown)', minWidth: 0 }}>
                {wm.topic}
              </span>

              {/* Right side: W# label + progress bar */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                <span style={{ fontSize: 9, color: 'var(--gold)', minWidth: 20, textAlign: 'right' }}>
                  W{wm.pos}
                </span>
                {!has && <span style={{ fontSize: 9, color: 'var(--stone)', fontStyle: 'italic', opacity: 0.6 }}>soon</span>}
                {has && (
                  <div style={{ width: 36, height: 3, borderRadius: 2, background: 'var(--surface)', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${Math.round(prog / 7 * 100)}%`, borderRadius: 2, background: 'var(--olive)' }} />
                  </div>
                )}
              </div>

              {isCur && <span style={{ fontSize: 8, fontWeight: 600, color: 'var(--olive)', letterSpacing: '0.05em', flexShrink: 0 }}>NOW</span>}
            </button>
          );
        })}
      </div>
    </div>
  );
}
