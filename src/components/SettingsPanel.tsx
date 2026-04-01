import type { UserSettings } from '../hooks/useSettings';
import type { User } from 'firebase/auth';

interface Props {
  settings: UserSettings;
  update: (patch: Partial<UserSettings>) => void;
  user: User | null;
  signIn: () => void;
  signOut: () => void;
  onClose: () => void;
}

export default function SettingsPanel({ settings, update, user, signIn, signOut, onClose }: Props) {
  const notifSupported = 'Notification' in window;
  const notifDenied = notifSupported && Notification.permission === 'denied';

  const formatTime = (t: string) => {
    const [h, m] = t.split(':').map(Number);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const h12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
    return `${h12}:${m.toString().padStart(2, '0')} ${ampm}`;
  };

  const formatDate = (d: string) => {
    const [y, mo, da] = d.split('-').map(Number);
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${months[mo - 1]} ${da}, ${y}`;
  };

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        background: 'rgba(0,0,0,0.35)',
        display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        style={{
          width: '100%', maxWidth: 640,
          background: 'var(--cream)',
          borderRadius: '20px 20px 0 0',
          padding: '1.5rem 1.5rem 2.5rem',
          boxShadow: '0 -4px 30px rgba(0,0,0,0.12)',
          animation: 'slideUp 0.25s ease-out',
          maxHeight: '85vh', overflowY: 'auto',
        }}
      >
        {/* Handle bar */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.25rem' }}>
          <div style={{ width: 36, height: 4, borderRadius: 2, background: 'var(--gold)', opacity: 0.5 }} />
        </div>

        {/* User info */}
        {user && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: 12,
            padding: '0.75rem 1rem', marginBottom: '1.25rem',
            background: 'var(--surface)', borderRadius: 12,
          }}>
            {user.photoURL ? (
              <img
                src={user.photoURL}
                alt=""
                style={{ width: 36, height: 36, borderRadius: '50%', border: '1.5px solid var(--gold)' }}
                referrerPolicy="no-referrer"
              />
            ) : (
              <div style={{
                width: 36, height: 36, borderRadius: '50%', background: 'var(--olive)',
                color: 'var(--cream)', fontSize: 16, fontWeight: 600,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                {(user.displayName || user.email || '?')[0].toUpperCase()}
              </div>
            )}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--brown)' }}>
                {user.displayName || 'User'}
              </div>
              <div style={{ fontSize: 11, color: 'var(--stone)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {user.email}
              </div>
            </div>
          </div>
        )}

        {/* Sign in prompt if not signed in */}
        {!user && (
          <button
            onClick={() => { signIn(); onClose(); }}
            style={{
              width: '100%', padding: '12px', fontSize: 14,
              color: 'var(--cream)', fontWeight: 500,
              background: 'var(--olive)', border: 'none', borderRadius: 10,
              cursor: 'pointer', marginBottom: '1.25rem',
            }}
          >
            Sign in with Google
          </button>
        )}

        {/* Section: Study Plan */}
        <div style={{ marginBottom: '1.5rem' }}>
          <div style={{
            fontSize: 10, letterSpacing: '0.12em', color: 'var(--stone)',
            textTransform: 'uppercase', marginBottom: 10, fontWeight: 500,
          }}>
            Study Plan
          </div>
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '10px 14px', background: 'var(--surface)', borderRadius: 10,
          }}>
            <div>
              <div style={{ fontSize: 14, color: 'var(--brown)', fontWeight: 500 }}>
                Start date
              </div>
              <div style={{ fontSize: 11, color: 'var(--stone)', marginTop: 2 }}>
                Easter & Christmas weeks auto-align
              </div>
            </div>
            <div style={{ position: 'relative' }}>
              <div style={{
                padding: '6px 12px', background: 'var(--cream)', borderRadius: 8,
                border: '1px solid var(--gold)', fontSize: 13, color: 'var(--brown)',
                fontWeight: 500, cursor: 'pointer', whiteSpace: 'nowrap',
              }}>
                {formatDate(settings.startDate)}
              </div>
              <input
                type="date"
                value={settings.startDate}
                onChange={e => {
                  if (e.target.value) update({ startDate: e.target.value });
                }}
                style={{
                  position: 'absolute', inset: 0, opacity: 0,
                  width: '100%', height: '100%', cursor: 'pointer',
                }}
              />
            </div>
          </div>
        </div>

        {/* Section: Appearance */}
        <div style={{ marginBottom: '1.5rem' }}>
          <div style={{
            fontSize: 10, letterSpacing: '0.12em', color: 'var(--stone)',
            textTransform: 'uppercase', marginBottom: 10, fontWeight: 500,
          }}>
            Appearance
          </div>
          <div style={{
            display: 'flex', gap: 8,
            background: 'var(--surface)', borderRadius: 10, padding: 4,
          }}>
            {(['light', 'dark'] as const).map(mode => (
              <button
                key={mode}
                onClick={() => update({ theme: mode })}
                style={{
                  flex: 1, padding: '10px 0', fontSize: 13, fontWeight: 500,
                  border: 'none', borderRadius: 8, cursor: 'pointer',
                  background: settings.theme === mode ? 'var(--olive)' : 'transparent',
                  color: settings.theme === mode ? '#fff' : 'var(--stone)',
                  transition: 'all 0.2s ease',
                }}
              >
                {mode === 'light' ? '☀️ Light' : '🌙 Dark'}
              </button>
            ))}
          </div>
        </div>

        {/* Section: Notifications */}
        <div style={{ marginBottom: '1.5rem' }}>
          <div style={{
            fontSize: 10, letterSpacing: '0.12em', color: 'var(--stone)',
            textTransform: 'uppercase', marginBottom: 10, fontWeight: 500,
          }}>
            Daily Reminder
          </div>

          {/* Toggle */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '10px 14px', background: 'var(--surface)', borderRadius: 10,
            marginBottom: settings.notificationsEnabled ? 8 : 0,
          }}>
            <div>
              <div style={{ fontSize: 14, color: 'var(--brown)', fontWeight: 500 }}>
                Notifications
              </div>
              {notifDenied && (
                <div style={{ fontSize: 11, color: '#C4443C', marginTop: 2 }}>
                  Blocked by browser — allow in settings
                </div>
              )}
              {!notifSupported && (
                <div style={{ fontSize: 11, color: 'var(--stone)', marginTop: 2 }}>
                  Not supported in this browser
                </div>
              )}
            </div>
            <button
              onClick={() => update({ notificationsEnabled: !settings.notificationsEnabled })}
              disabled={!notifSupported || notifDenied}
              style={{
                width: 48, height: 28, borderRadius: 14, border: 'none', cursor: 'pointer',
                background: settings.notificationsEnabled ? 'var(--olive)' : 'var(--gold)',
                position: 'relative', transition: 'background 0.2s ease',
                opacity: (!notifSupported || notifDenied) ? 0.4 : 1,
              }}
            >
              <div style={{
                width: 22, height: 22, borderRadius: '50%', background: '#fff',
                position: 'absolute', top: 3,
                left: settings.notificationsEnabled ? 23 : 3,
                transition: 'left 0.2s ease',
                boxShadow: '0 1px 3px rgba(0,0,0,0.15)',
              }} />
            </button>
          </div>

          {/* Time picker */}
          {settings.notificationsEnabled && (
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '10px 14px', background: 'var(--surface)', borderRadius: 10,
            }}>
              <div style={{ fontSize: 14, color: 'var(--brown)', fontWeight: 500 }}>
                Remind me at
              </div>
              <div style={{ position: 'relative' }}>
                <div style={{
                  padding: '6px 12px', background: 'var(--cream)', borderRadius: 8,
                  border: '1px solid var(--gold)', fontSize: 14, color: 'var(--brown)',
                  fontWeight: 500, cursor: 'pointer',
                }}>
                  {formatTime(settings.notificationTime)}
                </div>
                <input
                  type="time"
                  value={settings.notificationTime}
                  onChange={e => update({ notificationTime: e.target.value })}
                  style={{
                    position: 'absolute', inset: 0, opacity: 0,
                    width: '100%', height: '100%', cursor: 'pointer',
                  }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Sign out */}
        {user && (
          <button
            onClick={() => { signOut(); onClose(); }}
            style={{
              width: '100%', padding: '12px', fontSize: 14,
              color: '#C4443C', fontWeight: 500,
              background: 'var(--surface)', border: 'none', borderRadius: 10,
              cursor: 'pointer',
            }}
          >
            Sign out
          </button>
        )}
      </div>

      <style>{`
        @keyframes slideUp {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
