import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { RoundFlowApi } from '../hooks/useRoundFlow';
import { getCustomerById } from '../data/customers';
import type { Trait, TraitScores } from '../lib/types';
import { SensorGrid } from '../components/ui/SensorGrid';
import { Customer as CustomerSvg } from '../components/customer/Customer';
import { useReducedMotion } from '../hooks/useReducedMotion';
import { PixiRoot } from '../pixi/PixiRoot';
import { TestStage } from '../pixi/TestStage';

/**
 * TestPage (C4, route '/test'). The 3-second test reveal: glass-dome
 * chamber with a Pixi `<TestStage />` showing all four picked parts each
 * playing their behavior verb simultaneously, plus the SensorGrid's dots
 * filling in over time toward the resolved trait scores.
 *
 * Behavior:
 *   - Reads `state.invention` from the round flow. If absent (cold direct
 *     navigation, refresh mid-test), bounce home.
 *   - Animates the dot scores from { 0, 0, 0, 0 } toward
 *     `invention.traitScores` over 3 seconds. Implemented as a single
 *     `setInterval` ticking at 60ms (~17 fps); each tick lerps every trait's
 *     displayed score toward its target by one logical step. The tick count
 *     is 50, giving 3 seconds total at 60ms.
 *   - The Pixi TestStage runs its own ~3s verb burst in parallel. Each
 *     verb is keyed to its part's `behaviorVerb` and animates independently.
 *   - Reduced-motion: skip the dot-fill animation entirely. The dots show
 *     the final score on first paint and the page auto-advances after 60ms
 *     (one tick). The TestStage independently honors reduced-motion and
 *     renders verbs at their static rest pose with no animation.
 *   - On animation end, dispatch `startReaction()` and navigate to '/reaction'.
 *
 * The Pixi stage replaces M10's CSS keyframe spark burst. Phase 1 had a
 * placeholder contraption silhouette + 12 CSS sparks; M15 swaps it for a
 * 2x2 grid of part visuals each playing their assigned verb.
 */
export interface TestPageProps {
  round: RoundFlowApi;
}

const TICK_MS = 60;
const TOTAL_TICKS = 50; // 60ms * 50 = 3000ms

const TRAITS: Trait[] = ['fun', 'zappy', 'cozy', 'boom'];
const ZERO_SCORES: TraitScores = { fun: 0, zappy: 0, cozy: 0, boom: 0 };

/**
 * Pixi stage size. The dome card spans the phone width (390px shell minus
 * 24px horizontal padding on each side = 342px) so we set the stage just
 * inside that. Height is tuned so a 2x2 verb grid (parts at ~80px spacing,
 * 60px each) fits comfortably above the customer portrait below.
 */
const STAGE_WIDTH = 326;
const STAGE_HEIGHT = 200;

export function TestPage({ round }: TestPageProps) {
  const navigate = useNavigate();
  const reducedMotion = useReducedMotion();
  const { state, startReaction } = round;
  const invention = state.invention;
  const customer = state.customerId
    ? getCustomerById(state.customerId)
    : undefined;

  const [animatedScores, setAnimatedScores] = useState<TraitScores>(() =>
    reducedMotion && invention
      ? { ...invention.traitScores }
      : { ...ZERO_SCORES },
  );

  // Defensive redirect: if there's no invention to play out, go home.
  // The 'reaction' phase is allowed too because the auto-advance dispatches
  // `startReaction()` immediately before `navigate('/reaction')`, and on the
  // re-render this effect would otherwise race the navigate and bounce home.
  useEffect(() => {
    if (state.phase !== 'test' && state.phase !== 'reaction') {
      navigate('/', { replace: true });
    }
  }, [state.phase, navigate]);

  // Drive the dot fill animation.
  useEffect(() => {
    if (!invention) return;

    if (reducedMotion) {
      // Skip the animation; bounce to reaction on the next tick so the
      // route-flow still transitions through `test` cleanly.
      const handle = window.setTimeout(() => {
        startReaction();
        navigate('/reaction');
      }, TICK_MS);
      return () => window.clearTimeout(handle);
    }

    const target = invention.traitScores;
    let tickCount = 0;
    let advanceHandle: number | undefined;
    const handle = window.setInterval(() => {
      tickCount += 1;
      const progress = Math.min(1, tickCount / TOTAL_TICKS);
      const eased = easeOutCubic(progress);
      const fresh: TraitScores = { ...ZERO_SCORES };
      for (const trait of TRAITS) {
        fresh[trait] = target[trait] * eased;
      }
      setAnimatedScores(fresh);
      if (tickCount >= TOTAL_TICKS) {
        window.clearInterval(handle);
        // Snap to exact target before advancing so the final dots match.
        setAnimatedScores({ ...target });
        advanceHandle = window.setTimeout(() => {
          startReaction();
          navigate('/reaction');
        }, 200);
      }
    }, TICK_MS);
    return () => {
      window.clearInterval(handle);
      if (advanceHandle !== undefined) window.clearTimeout(advanceHandle);
    };
  }, [invention, reducedMotion, startReaction, navigate]);

  // Round each animated trait to an integer 0..3 for SensorGrid display.
  const displayedScores: TraitScores = useMemo(
    () => ({
      fun: Math.round(animatedScores.fun),
      zappy: Math.round(animatedScores.zappy),
      cozy: Math.round(animatedScores.cozy),
      boom: Math.round(animatedScores.boom),
    }),
    [animatedScores],
  );

  // "Active" highlight: a trait cell glows gold while its dot count is still
  // climbing. Once it's reached the target value, the highlight fades.
  const activeTraits = useMemo(() => {
    if (!invention) return new Set<Trait>();
    const set = new Set<Trait>();
    for (const trait of TRAITS) {
      if (
        invention.traitScores[trait] > 0 &&
        displayedScores[trait] < invention.traitScores[trait]
      ) {
        set.add(trait);
      }
    }
    return set;
  }, [invention, displayedScores]);

  if (!invention) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="font-display font-extrabold text-ink-soft">
          Kein Bau zum Testen.
        </p>
      </div>
    );
  }

  return (
    <div className="relative flex-1 flex flex-col pt-[60px] pb-6">
      <header className="flex items-center justify-between gap-3 px-6 pb-2">
        <div className="inline-flex items-center gap-1.5 border-2 border-ink rounded-full bg-ink text-gold px-3.5 py-2 text-[14px] font-extrabold">
          <span aria-hidden="true">{'★'}</span>
          Test-Kammer
        </div>
        <div className="inline-flex items-center gap-1.5 border-2 border-ink rounded-full bg-paper px-3.5 py-2 text-[12px] font-extrabold uppercase tracking-widest text-ink-soft">
          läuft
        </div>
      </header>

      <div className="flex-1 flex flex-col gap-3 px-6 pt-2 pb-3 overflow-hidden">
        {/* Glass-dome chamber. The Pixi TestStage replaces the placeholder
            contraption + spark burst with a real stage where the four picked
            parts each play their behavior verb. The customer portrait stays
            in the DOM layer so we don't redraw a complex SVG via Pixi. */}
        <div className="relative flex-1 min-h-[260px] bg-gradient-to-b from-paper to-bg-2 border-[2.5px] border-ink rounded-2xl overflow-hidden shadow-[0_4px_0_rgba(31,26,42,0.14)]">
          <div className="absolute top-3 left-4 z-10 font-body font-extrabold text-[11px] uppercase tracking-widest text-ink-soft">
            Glas-Kuppel
          </div>
          {/* Pixi stage: 4 verbs in 2x2 grid, ~3s burst. The stage centers
              horizontally and anchors near the top of the dome so the
              customer portrait sits below in the lower-left corner without
              overlap. The paper background blends with the dome's gradient. */}
          <div className="absolute inset-x-0 top-7 flex justify-center pointer-events-none">
            <PixiRoot
              width={STAGE_WIDTH}
              height={STAGE_HEIGHT}
              background={0xfffbef}
            >
              <TestStage
                parts={invention.parts}
                width={STAGE_WIDTH}
                height={STAGE_HEIGHT}
                reducedMotion={reducedMotion}
              />
            </PixiRoot>
          </div>
          {/* Customer portrait in DOM layer, lower-left of the dome. */}
          {customer ? (
            <div className="absolute left-6 bottom-4 z-10">
              <CustomerSvg
                kind={customer.visualKind}
                size={80}
                ariaLabel={`Portrait von ${customer.nameDe}`}
              />
            </div>
          ) : null}
        </div>

        {/* Sensor card with live-fill dots. */}
        <div className="bg-paper border-[2.5px] border-ink rounded-2xl p-4 shadow-[0_4px_0_rgba(31,26,42,0.14)]">
          <div className="flex items-center justify-between mb-2.5">
            <div className="font-body font-extrabold text-[11px] uppercase tracking-widest text-ink-soft">
              Sensoren spüren
            </div>
            <div className="font-script text-[18px] text-ink-soft">
              live
            </div>
          </div>
          <SensorGrid scores={displayedScores} activeTraits={activeTraits} />
        </div>
      </div>
    </div>
  );
}

/**
 * Cubic ease-out curve. Used to push the dot-fill animation toward its
 * target faster at the start, so the early "click click click" of dots
 * landing feels responsive, then it eases as it reaches full.
 */
function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}
