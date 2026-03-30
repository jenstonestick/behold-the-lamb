import { useState, useCallback } from 'react';
import type { AppState, WeekContent, ScriptureRef } from '../types';
import { DAYS, WEEKS, scrUrl, refLabel } from '../utils';
import { getVerses, type VerseEntry } from '../scripture-lookup';
import Sec from './Sec';
import Synth from './Synth';
import { content } from '../content';

/** Render verse text, converting [italics]...[/italics] to <i> elements */
function renderVerseText(text: string) {
  const parts = text.split(/\[italics\](.*?)\[\/italics\]/g);
  if (parts.length === 1) return text;
  return parts.map((part, i) =>
    i % 2 === 1 ? <i key={i}>{part}</i> : part
  );
}

interface Props {
  w: number;
  d: number;
  st: AppState;
  tog: (key: 'done' | 'bm', w: number, d: number) => void;
  setNote: (w: number, d: number, txt: string) => void;
  goDay: (w: number, d: number) => void;
  goWeek: (w: number) => void;
}

function ScriptureCard({ s }: { s: ScriptureRef }) {
  const [open, setOpen] = useState(false);
  const [verses, setVerses] = useState<VerseEntry[] | null>(null);
  const [loading, setLoading] = useState(false);
  const url = scrUrl(s);
  const lbl = refLabel(s);

  const load = useCallback(async () => {
    if (verses) { setOpen(o => !o); return; }
    setOpen(true);
    setLoading(true);
    const v = await getVerses(s);
    setVerses(v);
    setLoading(false);
  }, [verses, s]);

  return (
    <div style={{ background: 'var(--surface)', borderRadius: 6, overflow: 'hidden' }}>
      <div
        onClick={load}
        style={{
          padding: '12px 14px', cursor: 'pointer',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        }}
      >
        <div>
          <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--brown)', fontFamily: 'var(--font-serif)' }}>
            {lbl}
          </div>
          <div style={{ fontSize: 12, color: 'var(--stone)', marginTop: 4, fontStyle: 'italic' }}>
            {open ? 'Tap to collapse' : 'Tap to read'}
          </div>
        </div>
        <span style={{ fontSize: 14, color: 'var(--stone)', transition: 'transform 0.2s', transform: open ? 'rotate(180deg)' : 'rotate(0)' }}>
          ▾
        </span>
      </div>

      {open && (
        <div style={{ padding: '0 14px 14px', borderTop: '0.5px solid var(--gold)' }}>
          {loading ? (
            <div style={{ fontSize: 13, color: 'var(--stone)', padding: '12px 0', fontStyle: 'italic' }}>Loading…</div>
          ) : verses && verses.length > 0 ? (
            <div style={{ paddingTop: 10 }}>
              {verses.map(v => (
                <p key={v.num} style={{
                  fontSize: 14, lineHeight: 1.85, color: 'var(--brown)', margin: '0 0 6px',
                  fontFamily: 'var(--font-serif)', textIndent: 0,
                }}>
                  <span style={{ fontWeight: 600, fontSize: 11, color: 'var(--stone)', marginRight: 4, verticalAlign: 'super' }}>
                    {v.num}
                  </span>
                  {renderVerseText(v.text)}
                </p>
              ))}
              <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                style={{ fontSize: 11, color: 'var(--stone)', textDecoration: 'none', borderBottom: '1px dotted var(--gold)', display: 'inline-block', marginTop: 4 }}
              >
                View at churchofjesuschrist.org ↗
              </a>
            </div>
          ) : (
            <div style={{ paddingTop: 10 }}>
              <div style={{ fontSize: 13, color: 'var(--stone)', marginBottom: 8, fontStyle: 'italic' }}>Scripture text not available offline.</div>
              <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                style={{ fontSize: 13, color: 'var(--brown)', textDecoration: 'none', borderBottom: '1px dotted var(--gold)' }}
              >
                Read at churchofjesuschrist.org ↗
              </a>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function DayView({ w, d, st, tog, setNote, goDay }: Props) {
  const c: WeekContent | undefined = content[w];
  const wk = WEEKS[w - 1];
  const k = `${w}-${d}`;
  const done = st.done[k];
  const bm = st.bm[k];
  const note = st.notes[k] || '';

  if (!c) {
    return (
      <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
        <div style={{ fontSize: 14, color: 'var(--stone)', fontFamily: 'var(--font-serif)', lineHeight: 1.8 }}>
          Content for Week {w} ({wk.topic}) is coming soon.
        </div>
      </div>
    );
  }

  const day = c.days[d];

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: '1.25rem' }}>
        <div style={{ fontSize: 11, color: 'var(--stone)', letterSpacing: '0.03em', marginBottom: 3 }}>
          Week {w}: {wk.topic} · {DAYS[d]}
        </div>
        <div style={{ fontSize: 18, fontWeight: 500, fontFamily: 'var(--font-serif)', color: 'var(--brown)', marginBottom: 4 }}>
          {day.label}
        </div>
        <div style={{ fontSize: 13, color: 'var(--stone)', lineHeight: 1.6, marginBottom: 10, fontFamily: 'var(--font-serif)' }}>
          {day.focus}
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <button
            onClick={() => tog('done', w, d)}
            style={{
              fontSize: 12, padding: '5px 12px', borderRadius: 6, cursor: 'pointer',
              background: done ? 'var(--brown)' : 'transparent',
              color: done ? 'var(--cream)' : 'var(--stone)',
              border: done ? 'none' : '0.5px solid var(--gold)',
            }}
          >
            {done ? '✓ Done' : 'Mark done'}
          </button>
          <button
            onClick={() => tog('bm', w, d)}
            style={{
              fontSize: 14, padding: '4px 8px', background: 'none',
              border: '0.5px solid var(--gold)', borderRadius: 6, cursor: 'pointer',
              color: bm ? 'var(--star)' : 'var(--stone)',
            }}
          >
            {bm ? '★' : '☆'}
          </button>
        </div>
      </div>

      {/* Day pills */}
      <div style={{ display: 'flex', gap: 4, marginBottom: '1.25rem', flexWrap: 'wrap' }}>
        {c.days.map((_, i) => (
          <button
            key={i}
            onClick={() => goDay(w, i)}
            style={{
              fontSize: 11, padding: '4px 8px', borderRadius: 6, cursor: 'pointer',
              background: i === d ? 'var(--brown)' : st.done[`${w}-${i}`] ? 'var(--surface)' : 'transparent',
              color: i === d ? 'var(--cream)' : 'var(--stone)',
              border: i === d ? 'none' : '0.5px solid var(--gold)',
              fontWeight: i === d ? 500 : 400,
            }}
          >
            {DAYS[i].slice(0, 3)}
          </button>
        ))}
      </div>

      {/* Scripture */}
      <Sec label="Scripture">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {day.scriptures.map((s, i) => (
            <ScriptureCard key={`${s.book}-${s.ch}-${s.vs}-${i}`} s={s} />
          ))}
        </div>
      </Sec>

      {/* Translation notes */}
      {day.nuances && (
        <Sec label="Translation notes">
          <p style={{ fontSize: 14, lineHeight: 1.85, color: 'var(--brown)', margin: 0, fontFamily: 'var(--font-serif)' }}>{day.nuances}</p>
        </Sec>
      )}

      {/* Commentary */}
      <Sec label="Commentary">
        {day.commentary.split('\n\n').map((p, i) => (
          <p key={i} style={{ fontSize: 14, lineHeight: 1.85, color: 'var(--brown)', margin: i === 0 ? '0' : '12px 0 0', fontFamily: 'var(--font-serif)' }}>{p}</p>
        ))}
      </Sec>

      {/* Patterns */}
      <Sec label="Patterns">
        <p style={{ fontSize: 14, lineHeight: 1.85, color: 'var(--brown)', margin: 0, fontFamily: 'var(--font-serif)' }}>{day.patterns}</p>
      </Sec>

      {/* Reflection */}
      <Sec label="Reflection">
        <p style={{ fontSize: 14, lineHeight: 1.85, color: 'var(--brown)', margin: 0, fontStyle: 'italic', fontFamily: 'var(--font-serif)' }}>{day.reflection}</p>
      </Sec>

      {/* Journal */}
      <div style={{ borderTop: '0.5px solid var(--gold)', paddingTop: '1.25rem', marginTop: '0.5rem' }}>
        <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--stone)', marginBottom: 6 }}>Journal</div>
        <textarea
          value={note}
          onChange={e => setNote(w, d, e.target.value)}
          placeholder="Write your thoughts, impressions, and personal revelations..."
          style={{
            width: '100%', minHeight: 100, padding: '10px 12px', fontSize: 14, lineHeight: 1.7,
            fontFamily: 'var(--font-serif)', resize: 'vertical', boxSizing: 'border-box',
            border: '0.5px solid var(--gold)', borderRadius: 6,
            background: 'var(--cream)', color: 'var(--brown)',
          }}
        />
      </div>

      {/* Synthesis */}
      {c.synthesis && <Synth data={c.synthesis} w={w} />}

      {/* Week scriptures */}
      {c.weekScriptures && (
        <div style={{ marginTop: '1.5rem', borderTop: '0.5px solid var(--gold)', paddingTop: '1rem' }}>
          <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--stone)', marginBottom: 6 }}>This week's scriptures</div>
          <p style={{ fontSize: 13, lineHeight: 1.7, color: 'var(--stone)', margin: 0, fontFamily: 'var(--font-serif)' }}>{c.weekScriptures}</p>
        </div>
      )}
    </div>
  );
}
