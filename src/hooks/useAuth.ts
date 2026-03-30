import { useState, useEffect, useCallback } from 'react';
import type { User } from 'firebase/auth';
import { auth, hasConfig } from '../firebase';

// No-op hook when Firebase isn't configured
const noopAuth = { user: null as User | null, loading: false, signIn: async () => {}, signOut: async () => {} };

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(hasConfig);

  useEffect(() => {
    if (!auth || !hasConfig) { setLoading(false); return; }
    let unsub: (() => void) | undefined;
    import('firebase/auth').then(({ onAuthStateChanged }) => {
      unsub = onAuthStateChanged(auth!, (u) => {
        setUser(u);
        setLoading(false);
      });
    });
    return () => { unsub?.(); };
  }, []);

  const signIn = useCallback(async () => {
    if (!auth) return;
    const { GoogleAuthProvider, signInWithPopup, signInWithRedirect } = await import('firebase/auth');
    const provider = new GoogleAuthProvider();
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches
      || (navigator as unknown as { standalone?: boolean }).standalone === true;
    try {
      if (isStandalone) {
        await signInWithRedirect(auth, provider);
      } else {
        await signInWithPopup(auth, provider);
      }
    } catch (e) {
      console.error('Sign-in failed:', e);
    }
  }, []);

  const signOut = useCallback(async () => {
    if (!auth) return;
    const { signOut: fbSignOut } = await import('firebase/auth');
    await fbSignOut(auth);
  }, []);

  if (!hasConfig) return noopAuth;

  return { user, loading, signIn, signOut };
}
