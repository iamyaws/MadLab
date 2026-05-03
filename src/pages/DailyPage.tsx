import { useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import type { GameStateApi } from '../hooks/useGameState';
import type { RoundFlowApi } from '../hooks/useRoundFlow';
import { Customer as CustomerSvg } from '../components/customer/Customer';
import { TabBar } from '../components/ui/TabBar';
import { DAILY_VISITORS } from '../data/dailyRoster';
import { getRewardForDay } from '../data/dailyRewards';
import { getDailyVisitor } from '../lib/dailyRotation';
import { useReducedMotion } from '../hooks/useReducedMotion';

/**
 * DailyPage (C7, route '/daily'). The Daily Special screen for Moonling
 * Week (M17). Renders:
 *
 *   - Top chip strip: dark "TAG N von 7 - Mondling-Woche" + gold time-left.
 *   - Hero card: dark gradient with sparkle aura + Moonling portrait + name
 *     in Fraunces. Honors `prefers-reduced-motion` (no twinkling sparkles).
 *   - Speech bubble with the Moonling request quote.
 *   - Week progress card: 7 dots in a row (Mo Di Mi Do Fr Sa So in German,
 *     abbreviated to single letters M D M D F S S to fit the 7-pip strip),
 *     today highlighted gold + glow ring, claimed days dimmed-but-marked,
 *     future days outlined-but-empty.
 *   - Today's reward card (gold) with claim state derived from
 *     `state.dailyWeek.claimedRewards`.
 *   - Bottom CTA "Mondling helfen" enqueues a Moonling round and navigates
 *     to /arrival, mirroring the regular customer flow.
 *
 * On mount:
 *   - Calls `recordDailyVisit(todayIso)` once. The reducer recomputes
 *     `weekIndex` + `dayInWeek` from the date, and resets `claimedRewards`
 *     if a new week boundary was crossed.
 *
 * Phase 2 ships Moonling Week only. If the deterministic rotation lands on
 * another visitor (weekIndex > 0 mod 7 != 0), the page still renders with
 * Moonling content; future weeks fan this out via `DAILY_WEEK_REWARDS_BY_VISITOR`.
 */
export interface DailyPageProps {
  game: GameStateApi;
  round: RoundFlowApi;
}

const DAY_LABELS_DE = ['M', 'D', 'M', 'D', 'F', 'S', 'S'] as const;

/**
 * Format the local date as ISO `YYYY-MM-DD`. We use the local-timezone
 * day boundary because the player's intuition for "today" follows their
 * local clock; the deterministic rotation in `getDailyVisitor` does its
 * own UTC math separately. A small drift around midnight is acceptable:
 * the Daily reward gates on `dayInWeek`, which is derived from the same
 * UTC math, so the worst case is the page showing "Heute schon geholt"
 * an hour early or late at the date line. Phase 3 polish can sharpen it.
 */
function formatTodayIso(now: Date): string {
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Compute hours + minutes remaining until the next local midnight.
 * Used by the gold "noch X Std Y Min" chip.
 */
function timeUntilMidnight(now: Date): { hours: number; minutes: number } {
  const tomorrow = new Date(now);
  tomorrow.setHours(24, 0, 0, 0);
  const ms = tomorrow.getTime() - now.getTime();
  const hours = Math.floor(ms / (60 * 60 * 1000));
  const minutes = Math.floor((ms % (60 * 60 * 1000)) / (60 * 1000));
  return { hours, minutes };
}

/**
 * Derive a kid-friendly reward sub-line from the reward kind. Sticker rewards
 * read as "Aufkleber"; bonus stars repeat the count; the Day 7 unlock leans
 * into the legendary framing.
 */
function rewardEyebrowDe(kind: string | undefined): string {
  if (kind === 'sticker') return 'Aufkleber';
  if (kind === 'bonusStars') return 'Sterne';
  if (kind === 'partUnlock') return 'Mond-Teil';
  return 'Geschenk';
}

export function DailyPage({ game, round }: DailyPageProps) {
  const navigate = useNavigate();
  const reducedMotion = useReducedMotion();
  const {
    state: gameState,
    recordDailyVisit,
    claimDailyReward,
    addCatalogueEntry,
  } = game;
  const { startArrival } = round;

  // Snapshot "now" once per render so the time chip and visit recorder share
  // the same instant; otherwise a race between the effect and the render
  // could record one date and display another.
  const now = useMemo(() => new Date(), []);
  const todayIso = useMemo(() => formatTodayIso(now), [now]);

  // Record today's visit on mount so the dailyWeek slice advances. The
  // reducer is idempotent on the same date + week pair, so re-firing on a
  // re-render or a hot-reload is a safe no-op. We only depend on `todayIso`
  // and `recordDailyVisit` (both stable references) so this fires once per
  // page mount, not on every subsequent re-render.
  useEffect(() => {
    recordDailyVisit(todayIso);
  }, [todayIso, recordDailyVisit]);

  // Read dailyWeek state. After recordDailyVisit fires, the next render has
  // up-to-date weekIndex + dayInWeek, so the UI below reads the same source
  // of truth the reducer wrote.
  const { dayInWeek, claimedRewards } = gameState.dailyWeek;
  const todayReward = useMemo(() => getRewardForDay(dayInWeek), [dayInWeek]);
  const isClaimed = claimedRewards.includes(dayInWeek);

  // Pull the Moonling Customer record for portrait + request quote. M17
  // ships Moonling Week only; future themed weeks will route through the
  // deterministic rotation (`getDailyVisitor(now).visitorId`).
  const rotationToday = useMemo(() => getDailyVisitor(now), [now]);
  const visitorRecord =
    DAILY_VISITORS.find((v) => v.id === rotationToday.visitorId) ??
    DAILY_VISITORS[0];
  // Phase 2 demo fallback: if the rotation has us in a non-Moonling week,
  // fall back to Moonling so the page renders meaningful content. Future
  // phases swap this for per-visitor reward ladders.
  const moonling =
    DAILY_VISITORS.find((v) => v.id === 'moonling') ?? visitorRecord;

  const remaining = useMemo(() => timeUntilMidnight(now), [now]);

  /**
   * Claim today's reward without starting a round. Sticker = metadata only
   * (no UI surface yet); bonusStars = mint a star-only synthetic catalogue
   * entry so the visible counter ticks up; partUnlock = the legendary
   * Mondstrahl unlock fires through the regular round-flow on Day 7, so
   * the dedicated claim button is only meaningful for Day 1-6.
   */
  const handleClaim = () => {
    if (isClaimed || !todayReward) return;
    claimDailyReward(dayInWeek);
    if (todayReward.kind === 'bonusStars') {
      const starCount = todayReward.payload.starCount ?? 0;
      // Mint N tiny synthetic catalogue entries so the visible "★ N" counter
      // ticks up by exactly `starCount`. The entries are flagged via id
      // prefix `daily-bonus-`; future polish can hide them from the catalogue
      // grid if needed. We use unique ids per star so the idempotent
      // `addCatalogueEntry` reducer accepts each one.
      for (let i = 0; i < starCount; i++) {
        const id = `daily-bonus-w${gameState.dailyWeek.weekIndex}-d${dayInWeek}-${i}`;
        addCatalogueEntry({
          id,
          nameDe: todayReward.payload.nameDe,
          parts: [],
          customerId: 'moonling',
          traitScores: { fun: 0, zappy: 0, cozy: 0, boom: 0 },
          tier: 'satisfied',
          createdAt: now.getTime() + i,
        });
      }
    }
    // Sticker payload is metadata only for Phase 2; no further side effect.
    // partUnlock claims happen organically via the Day 7 Moonling round
    // (ReactionPage detects `unlock: { customerId: 'moonling', tier: 'delight' }`).
  };

  const handleHelpMoonling = () => {
    startArrival(moonling.id);
    navigate('/arrival');
  };

  const dayLabel = `Tag ${dayInWeek + 1} von 7`;

  return (
    <div className="relative flex-1 flex flex-col pt-[60px] pb-6 min-h-0">
      <header className="flex items-center justify-between gap-3 px-6 pb-2">
        <div className="inline-flex items-center gap-1.5 border-2 border-ink rounded-full bg-ink text-gold px-3.5 py-2 text-[14px] font-extrabold">
          <span aria-hidden="true">{'★'}</span>
          {`${dayLabel} - Mondling-Woche`}
        </div>
        <div className="inline-flex items-center gap-1.5 border-2 border-ink rounded-full bg-gold text-ink px-3.5 py-2 text-[14px] font-extrabold">
          <span aria-hidden="true">{'⏰'}</span>
          {`noch ${remaining.hours} Std ${remaining.minutes} Min`}
        </div>
      </header>

      {/* Inner scroll area. `pb-[100px]` clears the absolutely positioned
          tab bar at the bottom of the phone shell so the CTA never slides
          underneath it. */}
      <div className="flex-1 flex flex-col gap-3 px-6 pt-2 pb-[100px] overflow-y-auto min-h-0">
        {/* Hero card. Dark gradient with sparkle aura + portrait + name. */}
        <div
          className="relative overflow-hidden rounded-2xl border-[2.5px] border-ink p-5 shadow-[0_8px_0_rgba(31,26,42,0.20),0_0_0_4px_rgba(255,201,60,0.30)]"
          style={{
            background: 'linear-gradient(160deg, #1F1A2A 0%, #2D2542 100%)',
            color: '#FFFBEF',
          }}
        >
          {/* Sparkle aura. Reduced-motion suppresses the twinkle. */}
          {!reducedMotion ? <SparkleAura /> : null}
          <div className="relative flex items-center gap-4">
            <CustomerSvg
              kind="moonling"
              size={120}
              ariaLabel="Portrait von Mondling"
            />
            <div className="flex-1 min-w-0">
              <div className="font-body font-extrabold text-[11px] uppercase tracking-widest opacity-70">
                Diese Woche
              </div>
              <div
                className="font-display font-black text-[28px] leading-none tracking-tight mt-1"
                style={{ color: '#FFFBEF' }}
              >
                Mondling
              </div>
              <div
                className="font-script text-[20px] mt-1"
                style={{ color: '#FFC93C' }}
              >
                kommt jeden Abend
              </div>
            </div>
          </div>
        </div>

        {/* Speech bubble with Moonling's request. */}
        <div
          className="relative bg-paper border-[2.5px] border-ink rounded-3xl px-5 py-3.5 font-display font-extrabold text-[18px] leading-tight"
          role="note"
        >
          <span aria-hidden="true">"</span>
          {moonling.requestDe}
          <span aria-hidden="true">"</span>
        </div>

        {/* Week progress card. */}
        <div className="bg-paper border-[2.5px] border-ink rounded-2xl p-4 shadow-[0_4px_0_rgba(31,26,42,0.14)]">
          <div className="font-body font-extrabold text-[11px] uppercase tracking-widest text-ink-soft mb-2">
            Deine Woche
          </div>
          <div className="flex items-stretch justify-between gap-1.5">
            {DAY_LABELS_DE.map((label, i) => {
              const isToday = i === dayInWeek;
              const wasClaimed = claimedRewards.includes(i);
              const isFuture = i > dayInWeek;

              const dotClasses = isToday
                ? 'bg-gold shadow-[0_0_0_3px_rgba(255,201,60,0.35)]'
                : wasClaimed
                  ? 'bg-ink-soft'
                  : isFuture
                    ? 'bg-paper'
                    : 'bg-bg-2';

              return (
                <div
                  key={`${label}-${i}`}
                  className="flex-1 flex flex-col items-center gap-1"
                >
                  <div
                    aria-hidden="true"
                    className={`w-9 h-9 rounded-full border-[2.5px] border-ink flex items-center justify-center font-display font-black text-[14px] ${dotClasses} ${isToday ? '' : 'opacity-60'}`}
                  >
                    {isToday ? `${i + 1}` : wasClaimed ? '✓' : '·'}
                  </div>
                  <div
                    className={`font-body font-extrabold text-[10px] uppercase tracking-widest ${isToday ? 'text-ink' : 'text-ink-soft opacity-60'}`}
                  >
                    {label}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Today's reward card. Gold when claimable, paper when claimed. */}
        {todayReward ? (
          <div
            className={`border-[2.5px] border-ink rounded-2xl p-4 shadow-[0_4px_0_rgba(31,26,42,0.14)] ${isClaimed ? 'bg-paper' : 'bg-gold'}`}
          >
            <div className="font-body font-extrabold text-[11px] uppercase tracking-widest text-ink-soft">
              {isClaimed ? 'Heute schon geholt' : 'Heute holst du'}
            </div>
            <div className="font-display font-extrabold text-[20px] leading-tight tracking-tight mt-1">
              {todayReward.payload.nameDe}
            </div>
            <div className="font-script text-[15px] text-ink-soft mt-0.5">
              {rewardEyebrowDe(todayReward.kind)}
            </div>
            {todayReward.kind === 'partUnlock' ? (
              <div className="mt-2 font-body font-extrabold text-[13px] text-ink">
                Tag 7: Mondling helfen, dann ist es deins!
              </div>
            ) : !isClaimed ? (
              <button
                type="button"
                onClick={handleClaim}
                className="mt-3 inline-flex items-center justify-center gap-2 border-[2.5px] border-ink rounded-full bg-paper min-h-[44px] px-5 py-2 font-body font-black text-[15px] shadow-[0_4px_0_var(--ink)] active:translate-y-[3px] active:shadow-[0_2px_0_var(--ink)]"
              >
                Einsammeln
                <span aria-hidden="true">{'➜'}</span>
              </button>
            ) : (
              <div className="mt-2 inline-flex items-center gap-1.5 font-body font-extrabold text-[13px] text-ink">
                <span aria-hidden="true">{'✓'}</span>
                Eingesammelt
              </div>
            )}
          </div>
        ) : null}

        <div className="flex-1" />
      </div>

      <div className="px-6 pb-[110px]">
        <button
          type="button"
          onClick={handleHelpMoonling}
          className="w-full inline-flex items-center justify-center gap-2 border-[2.5px] border-ink rounded-[32px] bg-rose text-paper min-h-[64px] px-7 py-4 font-body font-black text-[19px] shadow-[0_5px_0_var(--ink)] active:translate-y-[3px] active:shadow-[0_2px_0_var(--ink)]"
        >
          Mondling helfen
          <span aria-hidden="true">{'➜'}</span>
        </button>
      </div>

      <TabBar active="taglich" />
    </div>
  );
}

/**
 * SparkleAura. Ten gold dots positioned around the hero card with a
 * staggered twinkle animation. Pure CSS keyframes (defined inline here)
 * so the page does not need a global stylesheet bump for this single
 * effect. Reduced-motion users never mount this component (DailyPage
 * gates it behind `useReducedMotion()`).
 */
function SparkleAura() {
  const sparks = Array.from({ length: 10 }, (_, i) => ({
    left: `${10 + i * 9}%`,
    top: `${20 + ((i * 7) % 60)}%`,
    delay: `${i * 0.2}s`,
  }));
  return (
    <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
      {sparks.map((s, i) => (
        <span
          key={i}
          className="absolute block w-1.5 h-1.5 rounded-full"
          style={{
            left: s.left,
            top: s.top,
            background: '#FFC93C',
            boxShadow: '0 0 8px #FFC93C',
            animation: `mil-sparkle-twinkle 2.4s ease-in-out ${s.delay} infinite`,
          }}
        />
      ))}
    </div>
  );
}
