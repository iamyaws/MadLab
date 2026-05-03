import { PhoneShell } from './components/ui/PhoneShell';
import { useGameState } from './hooks/useGameState';
import { useRoundFlow } from './hooks/useRoundFlow';
import { AppRoutes } from './routes';

/**
 * App. Mounts the persistent PhoneShell wrapper and the routed page tree.
 *
 * `useGameState` and `useRoundFlow` are called once here at the top so
 * persisted save state and ephemeral round state survive across screen
 * transitions. The two APIs are passed down to pages via props (Phase 1
 * choice; Phase 2 may wrap them in a Context if prop drilling deepens).
 *
 * Routing is handled inside `AppRoutes`; `BrowserRouter` is mounted in
 * `main.tsx` so test harnesses can swap in a `MemoryRouter` instead.
 */
export function App() {
  const game = useGameState();
  const round = useRoundFlow();

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center p-6">
      <PhoneShell>
        <AppRoutes game={game} round={round} />
      </PhoneShell>
    </div>
  );
}
