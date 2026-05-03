/**
 * Reads `prefers-reduced-motion: reduce` once at mount and returns a boolean.
 *
 * The hook also subscribes to `change` events so that if the user toggles the
 * OS setting mid-session, components consuming the flag re-render with the
 * fresh value. Returns false in non-browser environments (SSR, sandboxed
 * tests) so callers can default to motion-on without an extra guard.
 *
 * Used by ArrivalPage (skip the tube-drop slide-in), TestPage (skip the
 * 3-second sensor fill animation, fade-cut to outcome instantly), and any
 * future page that wants to short-circuit shell motion.
 */
import { useEffect, useState } from 'react';

const QUERY = '(prefers-reduced-motion: reduce)';

function readInitial(): boolean {
  if (typeof window === 'undefined' || !window.matchMedia) return false;
  return window.matchMedia(QUERY).matches;
}

export function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState<boolean>(readInitial);

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mql = window.matchMedia(QUERY);
    const handler = (e: MediaQueryListEvent) => setReduced(e.matches);
    mql.addEventListener('change', handler);
    return () => mql.removeEventListener('change', handler);
  }, []);

  return reduced;
}
