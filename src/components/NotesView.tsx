import type { AppState } from '../types';
import { WEEKS, DAYS } from '../utils';
import { content } from '../content';

interface Props {
  st: AppState;
  goDay: (w: number, d: number) => void;
}

export default function NotesView({ st, goDay }: Props) {
  // Collect all notes and bookmarks
  const entries: { w: number; d: number; note: string; bm: boolean; label: string }[] = [];

  for (let w = 1; w <= 50; w++) {
    for (let d = 0; d < 7; d++) {
      const k = `${w}-${d}`;
      const note = st.notes[k];
      const bm = !!st.bm[k];
      if (note || bm) {
        const c = content[w];
        const label = c?.days?.[d]?.label || DAYS[d];
        entries.push({ w, d, note: note || '', bm, label });
      }
    }
  }

  // Group by week
  const byWeek = new Map<number, typeof entries>();
  for (const e of entries) {
    if (!byWeek.has(e.w)) byWeek.set(e.w, []);
    byWeek.get(e.w)!.push(e);
  }

  const noteCount = entries.filter(e => e.note).length;
  const bmCount = entries.filter(e => e.bm).length;
  const weekCount = byWeek.size;

  if (entries.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
        <div style={{ fontSize: 28, marginBottom: 12 }}>📖</div>
        <div style={{ fontSize: 16, fontFamily: 'var(--font-serif)', color: 'var(--brown)', marginBottom: 8 }}>
          Your journal is empty
        </div>
        <div style={{ fontSize: 13, color: 'var(--stone)', lineHeight: 1.7, fontFamily: 'var(--font-serif)' }}>
          As you study each day, use the journal at the bottom of the page to record your thoughts, impressions, and personal revelations. They'll all appear here.
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Summary */}
      <div style={{ fontSize: 12, color: 'var(--stone)', marginBottom: '1.25rem', lineHeight: 1.6 }}>
        {noteCount > 0 && <span>{noteCount} journal {noteCount === 1 ? 'entry' : 'entries'}</span>}
        {noteCount > 0 && bmCount > 0 && <span> · </span>}
        {bmCount > 0 && <span>{bmCount} bookmarked</span>}
        {weekCount > 0 && <span> · across {weekCount} {weekCount === 1 ? 'week' : 'weeks'}</span>}
      </div>

      {/* Week groups */}
      {[...byWeek.entries()].map(([w, items]) => {
        const wk = WEEKS[w - 1];
        return (
          <div key={w} style={{ marginBottom: '1.5rem' }}>
            {/* Week header */}
            <div style={{
              fontSize: 11, fontWeight: 500, color: 'var(--stone)',
              letterSpacing: '0.03em', marginBottom: 8,
              paddingBottom: 4, borderBottom: '0.5px solid var(--gold)',
            }}>
              Week {w}: {wk.topic} · {wk.dates}
            </div>

            {/* Entries */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {items.map(e => (
                <button
                  key={`${e.w}-${e.d}`}
                  onClick={() => goDay(e.w, e.d)}
                  style={{
                    background: 'var(--surface)', borderRadius: 6, padding: '10px 12px',
                    border: 'none', cursor: 'pointer', textAlign: 'left', width: '100%',
                    display: 'flex', gap: 10, alignItems: 'flex-start',
                  }}
                >
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3 }}>
                      <span style={{ fontSize: 11, color: 'var(--stone)', fontWeight: 500 }}>
                        {DAYS[e.d]}
                      </span>
                      <span style={{ fontSize: 11, color: 'var(--stone)', opacity: 0.7 }}>
                        {e.label}
                      </span>
                      {e.bm && <span style={{ fontSize: 11, color: 'var(--star)' }}>★</span>}
                    </div>
                    {e.note ? (
                      <div style={{
                        fontSize: 13, lineHeight: 1.65, color: 'var(--brown)',
                        fontFamily: 'var(--font-serif)',
                        overflow: 'hidden', textOverflow: 'ellipsis',
                        display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical',
                      }}>
                        {e.note}
                      </div>
                    ) : (
                      <div style={{ fontSize: 12, color: 'var(--stone)', fontStyle: 'italic' }}>
                        Bookmarked — no notes yet
                      </div>
                    )}
                  </div>
                  <span style={{ fontSize: 12, color: 'var(--gold)', marginTop: 2, flexShrink: 0 }}>›</span>
                </button>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
