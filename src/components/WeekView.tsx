import type { AppState } from '../types';
import { DAYS, WEEKS } from '../utils';
import { content } from '../content';

interface Props {
  w: number;
  st: AppState;
  tog: (key: 'done' | 'bm', w: number, d: number) => void;
  wProg: (w: number) => number;
  goDay: (w: number, d: number) => void;
  goWeek: (w: number) => void;
}

export default function WeekView({ w, st, tog, wProg, goDay, goWeek }: Props) {
  const wk = WEEKS[w - 1];
  const c = content[w];
  const prog = wProg(w);

  return (
    <div>
      <div style={{ marginBottom: '1.25rem' }}>
        <div style={{ fontSize: 11, color: 'var(--stone)', letterSpacing: '0.03em', marginBottom: 3 }}>Week {w} · {wk.dates}</div>
        <div style={{ fontSize: 18, fontWeight: 500, fontFamily: 'var(--font-serif)', color: 'var(--brown)' }}>
          {c ? c.title : `Jesus Christ — ${wk.topic}`}
        </div>
        {c && <p style={{ fontSize: 13, color: 'var(--stone)', margin: '4px 0 0', lineHeight: 1.5 }}>{c.subtitle}</p>}
      </div>

      {c && (
        <div style={{ background: 'var(--surface)', borderRadius: 6, padding: '8px 14px', marginBottom: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: 12, color: 'var(--stone)' }}>{prog}/7 days</span>
          <div style={{ width: 80, height: 4, borderRadius: 2, background: 'var(--gold)', opacity: 0.3, overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${Math.round(prog / 7 * 100)}%`, borderRadius: 2, background: 'var(--gold)', transition: 'width 0.3s' }} />
          </div>
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
        {w > 1 && <button onClick={() => goWeek(w - 1)} style={{ fontSize: 12, color: 'var(--stone)', background: 'none', border: 'none', cursor: 'pointer' }}>← Week {w - 1}</button>}
        <div style={{ flex: 1 }} />
        {w < 50 && <button onClick={() => goWeek(w + 1)} style={{ fontSize: 12, color: 'var(--stone)', background: 'none', border: 'none', cursor: 'pointer' }}>Week {w + 1} →</button>}
      </div>

      {!c && (
        <div style={{ textAlign: 'center', padding: '2.5rem 1rem', border: '0.5px dashed var(--gold)', borderRadius: 8 }}>
          <div style={{ fontSize: 14, color: 'var(--stone)', fontFamily: 'var(--font-serif)' }}>Content coming soon</div>
          <div style={{ fontSize: 12, color: 'var(--stone)', marginTop: 6, opacity: 0.7 }}>Weeks 1–4 are available</div>
        </div>
      )}

      {c && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {c.days.map((dd, i) => {
            const dk = `${w}-${i}`;
            const done = st.done[dk];
            const bm = st.bm[dk];
            return (
              <button
                key={i}
                onClick={() => goDay(w, i)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', width: '100%', textAlign: 'left',
                  background: 'var(--cream)', border: '0.5px solid var(--gold)', borderRadius: 6, cursor: 'pointer',
                }}
              >
                <div
                  onClick={e => { e.stopPropagation(); tog('done', w, i); }}
                  style={{
                    width: 18, height: 18, borderRadius: 3, flexShrink: 0,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    border: done ? 'none' : '1.5px solid var(--gold)',
                    background: done ? 'var(--brown)' : 'transparent',
                    color: 'var(--cream)', fontSize: 10, cursor: 'pointer',
                  }}
                >
                  {done && '✓'}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 10, color: 'var(--stone)' }}>{DAYS[i]}</div>
                  <div style={{ fontSize: 13, color: 'var(--brown)' }}>{dd.label}</div>
                </div>
                {bm && <span style={{ fontSize: 12, color: 'var(--star)' }}>★</span>}
                <span style={{ fontSize: 12, color: 'var(--stone)' }}>›</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
