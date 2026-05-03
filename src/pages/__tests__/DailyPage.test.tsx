import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { act, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { MemoryRouter } from 'react-router-dom';
import type { GameStateApi } from '../../hooks/useGameState';
import type { RoundFlowApi, RoundState } from '../../hooks/useRoundFlow';
import type { SaveStateV2 } from '../../lib/types';
import { defaultSave } from '../../lib/storage';
import { DailyPage } from '../DailyPage';

/**
 * Build a minimal `GameStateApi` mock with overridable dailyWeek state.
 * Each helper is `vi.fn()` so assertions can check what the page called.
 */
function makeGame(stateOverrides: Partial<SaveStateV2> = {}): GameStateApi {
  const base = defaultSave();
  const state: SaveStateV2 = {
    ...base,
    ...stateOverrides,
    dailyWeek: {
      ...base.dailyWeek,
      ...(stateOverrides.dailyWeek ?? {}),
    },
  };
  return {
    state,
    addCatalogueEntry: vi.fn(),
    unlockPart: vi.fn(),
    setDailySeed: vi.fn(),
    recordDailyVisit: vi.fn(),
    claimDailyReward: vi.fn(),
    rollDailyWeek: vi.fn(),
    reset: vi.fn(),
  };
}

function makeRound(): RoundFlowApi {
  const state: RoundState = {
    phase: 'idle',
    customerId: null,
    pickedPartIds: [],
    invention: null,
  };
  return {
    state,
    startArrival: vi.fn(),
    startBuild: vi.fn(),
    togglePart: vi.fn(),
    startTest: vi.fn(),
    startReaction: vi.fn(),
    endRound: vi.fn(),
  };
}

describe('DailyPage', () => {
  let originalMatchMedia: typeof window.matchMedia | undefined;

  beforeEach(() => {
    // Default to motion-on so the sparkle aura mounts.
    originalMatchMedia = window.matchMedia;
    window.matchMedia = (query: string) =>
      ({
        matches: false,
        media: query,
        onchange: null,
        addEventListener: () => {},
        removeEventListener: () => {},
        addListener: () => {},
        removeListener: () => {},
        dispatchEvent: () => false,
      }) as MediaQueryList;
  });

  afterEach(() => {
    if (originalMatchMedia !== undefined) {
      window.matchMedia = originalMatchMedia;
      originalMatchMedia = undefined;
    }
  });

  it('renders the Mondling hero name and request quote', () => {
    const game = makeGame({ dailyWeek: { weekIndex: 0, dayInWeek: 0, lastVisitDate: null, claimedRewards: [] } });
    const round = makeRound();
    act(() => {
      render(
        <MemoryRouter>
          <DailyPage game={game} round={round} />
        </MemoryRouter>,
      );
    });
    expect(screen.getByText('Mondling')).toBeInTheDocument();
    expect(
      screen.getByText(/bring mich heim/i),
    ).toBeInTheDocument();
  });

  it('shows the Day 1 label when dayInWeek is 0', () => {
    const game = makeGame({ dailyWeek: { weekIndex: 0, dayInWeek: 0, lastVisitDate: null, claimedRewards: [] } });
    const round = makeRound();
    act(() => {
      render(
        <MemoryRouter>
          <DailyPage game={game} round={round} />
        </MemoryRouter>,
      );
    });
    expect(screen.getByText(/Tag 1 von 7/)).toBeInTheDocument();
  });

  it('shows today\'s reward name (Mond-Sticker on Day 1)', () => {
    const game = makeGame({ dailyWeek: { weekIndex: 0, dayInWeek: 0, lastVisitDate: null, claimedRewards: [] } });
    const round = makeRound();
    act(() => {
      render(
        <MemoryRouter>
          <DailyPage game={game} round={round} />
        </MemoryRouter>,
      );
    });
    expect(screen.getByText('Mond-Sticker')).toBeInTheDocument();
  });

  it('shows the Mondstrahl reward name on Day 7 (dayInWeek 6)', () => {
    const game = makeGame({ dailyWeek: { weekIndex: 0, dayInWeek: 6, lastVisitDate: null, claimedRewards: [] } });
    const round = makeRound();
    act(() => {
      render(
        <MemoryRouter>
          <DailyPage game={game} round={round} />
        </MemoryRouter>,
      );
    });
    expect(screen.getByText(/Mondstrahl/)).toBeInTheDocument();
    expect(screen.getByText(/Tag 7 von 7/)).toBeInTheDocument();
  });

  it('marks today as claimed when dayInWeek is in claimedRewards', () => {
    const game = makeGame({
      dailyWeek: { weekIndex: 0, dayInWeek: 0, lastVisitDate: null, claimedRewards: [0] },
    });
    const round = makeRound();
    act(() => {
      render(
        <MemoryRouter>
          <DailyPage game={game} round={round} />
        </MemoryRouter>,
      );
    });
    expect(screen.getByText(/Heute schon geholt/)).toBeInTheDocument();
    expect(screen.getByText(/Eingesammelt/)).toBeInTheDocument();
  });

  it('calls recordDailyVisit on mount with today\'s ISO date', () => {
    const game = makeGame();
    const round = makeRound();
    act(() => {
      render(
        <MemoryRouter>
          <DailyPage game={game} round={round} />
        </MemoryRouter>,
      );
    });
    expect(game.recordDailyVisit).toHaveBeenCalledTimes(1);
    const passed = (game.recordDailyVisit as ReturnType<typeof vi.fn>).mock
      .calls[0][0];
    expect(passed).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it('renders the "Mondling helfen" CTA', () => {
    const game = makeGame();
    const round = makeRound();
    act(() => {
      render(
        <MemoryRouter>
          <DailyPage game={game} round={round} />
        </MemoryRouter>,
      );
    });
    const cta = screen.getByRole('button', { name: /Mondling helfen/ });
    expect(cta).toBeInTheDocument();
  });
});
