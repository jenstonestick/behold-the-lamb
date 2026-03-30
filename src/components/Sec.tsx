import type { ReactNode } from 'react';

export default function Sec({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div style={{ marginBottom: '1.25rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
        <div style={{ width: 3, height: 12, borderRadius: 2, background: 'var(--gold)' }} />
        <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--stone)', letterSpacing: '0.03em' }}>{label}</span>
      </div>
      <div style={{ paddingLeft: 11 }}>{children}</div>
    </div>
  );
}
