import { Route, Routes, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'motion/react';
import type { GameStateApi } from './hooks/useGameState';
import type { RoundFlowApi } from './hooks/useRoundFlow';
import { useReducedMotion } from './hooks/useReducedMotion';
import { WorkshopPage } from './pages/WorkshopPage';
import { ArrivalPage } from './pages/ArrivalPage';
import { BuildPage } from './pages/BuildPage';
import { TestPage } from './pages/TestPage';
import { ReactionPage } from './pages/ReactionPage';
import { CataloguePage } from './pages/CataloguePage';
import { DailyPage } from './pages/DailyPage';

/**
 * AppRoutes. The five Phase-1 routes plus the catalogue stub, wrapped in
 * `motion`'s `AnimatePresence` so navigation between pages cross-fades
 * instead of cutting hard. Reduced-motion collapses the cross-fade to a
 * 0-duration swap so `prefers-reduced-motion: reduce` users still see all
 * the same content without animation.
 *
 * Each page is wrapped in a `motion.div` keyed on `location.pathname`. The
 * key change drives `AnimatePresence` to mount the next page and unmount
 * the previous one, opacity-tweening between them.
 */
export interface AppRoutesProps {
  game: GameStateApi;
  round: RoundFlowApi;
}

export function AppRoutes({ game, round }: AppRoutesProps) {
  const location = useLocation();
  const reducedMotion = useReducedMotion();

  const transition = reducedMotion
    ? { duration: 0 }
    : { duration: 0.22, ease: 'easeOut' as const };

  return (
    <div className="flex-1 flex flex-col min-h-0 relative">
      <AnimatePresence initial={false}>
        <motion.div
          key={location.pathname}
          initial={{ opacity: reducedMotion ? 1 : 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: reducedMotion ? 1 : 0 }}
          transition={transition}
          className="absolute inset-0 flex flex-col min-h-0"
        >
          <Routes location={location}>
            <Route path="/" element={<WorkshopPage game={game} round={round} />} />
            <Route path="/arrival" element={<ArrivalPage round={round} />} />
            <Route path="/build" element={<BuildPage />} />
            <Route path="/test" element={<TestPage round={round} />} />
            <Route
              path="/reaction"
              element={<ReactionPage game={game} round={round} />}
            />
            <Route path="/catalogue" element={<CataloguePage game={game} />} />
            <Route path="/daily" element={<DailyPage game={game} round={round} />} />
          </Routes>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
