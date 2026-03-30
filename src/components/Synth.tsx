import { useState } from 'react';
import type { Synthesis } from '../types';
import Sec from './Sec';

export default function Synth({ data, w }: { data: Synthesis; w: number }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ marginTop: '1.5rem', borderTop: '0.5px solid var(--gold)', paddingTop: '1rem' }}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          background: 'none', border: 'none', cursor: 'pointer', padding: '8px 0',
        }}
      >
        <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--stone)' }}>Week {w} synthesis</span>
        <span style={{ fontSize: 12, color: 'var(--stone)' }}>{open ? '▴' : '▾'}</span>
      </button>
      {open && (
        <div style={{ paddingTop: 8 }}>
          <Sec label="Summary">
            <p style={{ fontSize: 14, lineHeight: 1.85, margin: 0, fontFamily: 'var(--font-serif)', color: 'var(--brown)' }}>{data.summary}</p>
          </Sec>
          <Sec label="Connections">
            {data.connections.map((c, i) => (
              <p key={i} style={{ fontSize: 14, lineHeight: 1.85, margin: '0 0 6px', fontFamily: 'var(--font-serif)', color: 'var(--brown)' }}>— {c}</p>
            ))}
          </Sec>
          <Sec label="Teaching angle">
            <p style={{ fontSize: 14, lineHeight: 1.85, margin: 0, fontStyle: 'italic', fontFamily: 'var(--font-serif)', color: 'var(--brown)' }}>{data.teaching}</p>
          </Sec>
          <Sec label="Commitment">
            <p style={{ fontSize: 14, lineHeight: 1.85, margin: 0, fontStyle: 'italic', fontFamily: 'var(--font-serif)', color: 'var(--brown)' }}>{data.commitment}</p>
          </Sec>
        </div>
      )}
    </div>
  );
}
