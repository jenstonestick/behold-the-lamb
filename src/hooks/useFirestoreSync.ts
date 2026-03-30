import { useEffect, useRef, useCallback } from 'react';
import type { User } from 'firebase/auth';
import type { AppState } from '../types';
import { db } from '../firebase';
import { mergeState, saveState } from '../utils';

type Unsubscribe = () => void;
type SetState = (s: AppState | ((prev: AppState) => AppState)) => void;

export function useFirestoreSync(
  user: User | null,
  st: AppState,
  setSt: SetState,
) {
  const unsubRef = useRef<Unsubscribe | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const skipNextSnapshot = useRef(false);

  // Subscribe to Firestore on sign-in, merge initial state
  useEffect(() => {
    if (!user || !db) return;

    let cancelled = false;

    (async () => {
      const { doc, getDoc, setDoc, onSnapshot } = await import('firebase/firestore');
      const ref = doc(db!, 'users', user.uid, 'state', 'app');

      // Read remote state and merge with local
      try {
        const snap = await getDoc(ref);
        if (!cancelled) {
          const remote = snap.exists()
            ? (snap.data() as AppState)
            : { done: {}, bm: {}, notes: {} };
          const merged = mergeState(st, remote);
          setSt(merged);
          saveState(merged);
          skipNextSnapshot.current = true;
          await setDoc(ref, merged);
        }
      } catch (e) {
        console.warn('Firestore initial sync failed:', e);
      }

      // Listen for real-time updates from other devices
      if (!cancelled) {
        unsubRef.current = onSnapshot(ref, (snap) => {
          if (skipNextSnapshot.current) {
            skipNextSnapshot.current = false;
            return;
          }
          if (snap.exists()) {
            const remote = snap.data() as AppState;
            setSt((prev: AppState) => {
              const merged = mergeState(prev, remote);
              saveState(merged);
              return merged;
            });
          }
        });
      }
    })();

    return () => {
      cancelled = true;
      if (unsubRef.current) {
        unsubRef.current();
        unsubRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.uid]);

  // Debounced write to Firestore on state changes
  const syncToFirestore = useCallback(
    (newSt: AppState) => {
      if (!user || !db) return;
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(async () => {
        try {
          const { doc, setDoc } = await import('firebase/firestore');
          const ref = doc(db!, 'users', user.uid, 'state', 'app');
          skipNextSnapshot.current = true;
          await setDoc(ref, newSt);
        } catch (e) {
          console.warn('Firestore write failed:', e);
        }
      }, 800);
    },
    [user],
  );

  return { syncToFirestore };
}
