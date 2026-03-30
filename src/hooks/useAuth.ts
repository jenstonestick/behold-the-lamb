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

    import('firebase/auth').then(({ onAuthStateChanged, getRedirectResult }) => {
      // Check for redirect result (handles return from signInWithRedirect)
      getRedirectResult(auth!).catch(() => {});

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

    // Try popup first; fall back to redirect if it fails (e.g. PWA, iOS Safari)
    try {
      await signInWithPopup(auth, provider);
    } catch (e: unknown) {
      const code = (e as { code?: string })?.code;
      // These errors mean popup was blocked or unavailable — use redirect instead
      if (code === 'auth/popup-blocked' ||
          code === 'auth/popup-closed-by-user' ||
          code === 'auth/cancelled-popup-request' ||
          code === 'auth/operation-not-supported-in-this-environment') {
        await signInWithRedirect(auth, provider);
      } else {
        console.error('Sign-in failed:', e);
      }
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
