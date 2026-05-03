import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * BuildPage (C3, route '/build'). Phase-1 stub: redirect to '/' so the
 * Workshop screen is the de facto build surface.
 *
 * The Phase-1 spike merges Workshop + Build into one screen because M9 is
 * about end-to-end loop, not screen-variant exploration. The wireframe's
 * "focused-orbit" detail view (300px orbit + larger trait preview card)
 * lands in Phase 2 if we want a separate build experience after Marc plays
 * the loop.
 *
 * Keeping the route declared (instead of removing it) preserves the URL
 * shape from the spec; deep-linking '/build' just bounces home.
 */
export function BuildPage() {
  const navigate = useNavigate();
  useEffect(() => {
    navigate('/', { replace: true });
  }, [navigate]);
  return null;
}
