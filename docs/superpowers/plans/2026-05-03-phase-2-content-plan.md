# Phase 2 Content Plan, Mad Inventor Lab

**Date:** 2026-05-03
**Status:** Plan ready for execution (Phase 2, weeks 3-4, solo dev)
**Repo:** `C:/Users/öööö/dev/mad-inventor-lab/`
**Spec:** [`../specs/2026-05-03-mad-inventor-lab-design.md`](../specs/2026-05-03-mad-inventor-lab-design.md)
**Phase 1 plan:** [`./2026-05-03-phase-1-spike-plan.md`](./2026-05-03-phase-1-spike-plan.md)
**Phase 1 commit:** SHA `6685891`, tag `phase-1-spike` (57 tests green, full loop end-to-end on placeholders)

## Goal

By the end of week 4 the game is content-complete and shippable to Louis for a real playtest. Six finished customer portraits, twelve finished part sprites with behavior verb animations playing simultaneously inside the Pixi test chamber, the missing customer data records (oma, twig, kit) wired with reaction quote tables, the Daily Special screen functional with Moonling Week as the first themed week, the Flipbook catalogue replacing the stub grid, eight to twelve sound effects gated through a single AudioContext unlock, the four-tab navigation bar functional across screens, and a schema-versioned migration carrying old saves forward into the new Daily-Week state. The Phase 1 loop (Workshop, Arrival, Test, Reaction) keeps its plumbing; Phase 2 swaps placeholders for real content and adds the meta-loop surfaces. iOS HIG polish, the PWA manifest, onboarding, alt palettes, and the cosmetics shop stay deferred to Phase 3 or post-MVP.

## Critical files

New files this phase creates:

- `src/components/customer/Customer.tsx` · The seven kinds of finished customer SVG, each as a self-contained `<Customer kind="..." size={n} />` component. Six regulars (`pip`, `kid`, `crunch`, `oma`, `twig`, `kit`) plus moonling and a `creature` fallback for un-arted daily visitors. Transcribed from the wireframe.
- `src/components/parts/PartIcon.tsx` · The twelve finished part SVGs as `<PartIcon type="..." size={n} />`. Stable interface so the Pixi side, the catalogue, and the part chip can all consume the same component.
- `src/pixi/parts/PartSprite.tsx` · The Pixi-side wrapper that mirrors `<PartIcon />` for OrbitStage. Renders a Pixi `Container` + `Graphics` for whichever part id is requested. Pulls from a single dispatch table so the orbit and the test chamber stay visually consistent.
- `src/pixi/verbs/index.ts` + per-verb files (`SpinCog.tsx`, `BounceSpring.tsx`, `SparkBolt.tsx`, `PuffBeaker.tsx`, `ChimeBell.tsx`, `WobbleJelly.tsx`, `SoftSock.tsx`, `FlutterFeather.tsx`, `GlowCloud.tsx`, `AttractMagnet.tsx`, `WatchEye.tsx`, `ZoomScope.tsx`) · One Pixi animation component per behavior verb. Each takes `{ active: boolean, x: number, y: number }` and runs its own `useTick`. Twelve files, average 30-40 lines each.
- `src/pixi/TestStage.tsx` · The glass-dome test chamber as a real Pixi stage: customer silhouette left, contraption right, four behavior verbs firing simultaneously, particle burst (gold + rose), screen shake driven from a parent prop. Replaces the CSS-keyframe spark overlay TestPage uses today.
- `src/audio/sfx.ts` · The SFX dispatch table (sound id, file path, gain). Single source of truth for which clips exist and how loud they play. Eight to twelve clips total.
- `src/audio/useAudio.ts` · Howler-backed hook exposing `play(id)` plus `unlock()`. Lazy-instantiates a `Howl` per id on first play and reuses it.
- `src/hooks/useAudioUnlock.ts` · Mounts in `App.tsx`. Listens for the first `pointerdown` anywhere and triggers Howler's autoplay-context unlock. Renders the optional "tipp, um Töne anzumachen" hint until the unlock fires (suppressed if the user has muted the app via the settings toggle planned in M19).
- `src/hooks/useDailyWeek.ts` · Wraps the daily-week reducer over `useGameState`'s daily-week slice. Exposes `today`, `claimedTodayReward`, `claimReward`, plus the next-reset countdown.
- `src/data/dailyWeekRewards.ts` · The seven-day reward ladder per visitor. Day 1-6 small rewards plus the Day 7 legendary part. Phase 2 fills Moonling Week only; the other six visitors keep stubbed ladders that fall back to a neutral reward.
- `src/data/reactionQuotes.ts` · Per-customer per-tier quote table for all six regulars. Lifts the inline `REACTION_QUOTES` from `ReactionPage.tsx` into shared data.
- `src/pages/DailyPage.tsx` · The C7 screen, route `/daily`.
- `src/components/ui/Flipbook.tsx` · The two-page-spread component, with tap pagination via `< chip >` controls. Drives `CataloguePage`'s replaced render path.
- `src/components/ui/TabBar.tsx` · The functional four-tab navigation bar shared across Workshop, Catalogue, Daily, and (stubbed) Shop.

Key modifications to existing files:

- `src/lib/types.ts` · Add `SaveStateV2` carrying `dailyWeek` + `lastClaimedRewards`. `SaveStateV1` stays exported for the migration.
- `src/lib/storage.ts` · Bump `SAVE_KEY` to `mil:save:v2`, add a `case 1:` branch in `migrate()` that lifts a v1 blob to v2, keep the v2 case clean.
- `src/data/customers.ts` · Append `oma`, `twig`, `kit` to the regulars list with finalized `wants`/`forbidden` per the spec.
- `src/data/dailyRoster.ts` · Tune Moonling's `wants` and `forbidden` so the daily round actually scores. Other six daily visitors stay neutral until their themed week ships.
- `src/components/ui/CustomerHeroCard.tsx` · Replace the colored-circle initial portrait with `<Customer kind={...} />`. Preserve sm/lg sizing.
- `src/components/ui/PartChip.tsx` · Replace the initial-letter circle with `<PartIcon type={...} />`.
- `src/pixi/OrbitStage.tsx` · Swap the rounded-rect part placeholders for `<PartSprite />`. Keep the orbit math, the upright trick, and the selection scale.
- `src/pages/TestPage.tsx` · Switch the CSS spark overlay to `<TestStage />` (Pixi). Sensor grid stays React.
- `src/pages/CataloguePage.tsx` · Replace the stub grid with `<Flipbook />`.
- `src/pages/WorkshopPage.tsx`, `src/pages/CataloguePage.tsx`, `src/pages/DailyPage.tsx` · Swap their placeholder static `<nav>` for `<TabBar active={...} />`.
- `src/App.tsx` · Add `<Route path="/daily" element={<DailyPage ... />} />`. Mount `useAudioUnlock()` here.
- `src/index.css` · Add the screen-shake keyframe that TestStage triggers via a CSS class swap (Pixi cannot move its host DOM element).

Roughly 22 new files, 12 modifications. Within budget for a focused 2-week sprint.

## Architectural decisions (the six Marc must weigh in on)

Each call below is the recommended path. The alternative is what ships if Marc overrides; the cost-of-switching is honest.

### 1. SVG art sourcing: transcribe from the wireframe

The wireframe `docs/wireframes/hifi-c-v2.html` already contains hand-coded React + SVG components for the customers (`Customer` at lines 374-449) and the part icons (`Ic` at lines 344-369). They are kid-friendly, on-brand, palette-aligned (cyan, gold, plum, rose, sage, paper, ink), and free.

**Recommendation:** transcribe those SVGs verbatim into `Customer.tsx` and `PartIcon.tsx`. Replace the inline `var(--gold)` references with the Tailwind tokens we already have, normalize the `viewBox` to `0 0 32 32` for parts and `0 0 140 150` for customers, expose a `size` prop. Phase 2 ships on these.

**Alternative:** generate via Claude Design or commission. Risks: style drift across customers (one watercolor, one cel, one ink), longer turnaround, paid pipeline that we have no infrastructure for yet.

**Cost of switching later:** low. The components live behind stable interfaces (`<Customer kind={...} />`, `<PartIcon type={...} />`); we can swap implementations without touching consumers.

### 2. Audio library: Howler.js

**Recommendation:** Howler.js (~30 KB gzipped, mature, handles AudioContext unlock automatically across browsers, including iOS Safari quirks). Wraps HTMLAudioElement and Web Audio uniformly, gives us per-clip volume, fade-out, multi-instance playback for sparkle bursts.

**Alternative:** vanilla AudioContext. Smaller, no dep, but every iOS edge case becomes our problem (silent switch, page-visibility resume, sample-rate mismatches). Two days of bug-fixing we can spend elsewhere.

**Cost of switching later:** medium. Audio touches every reaction tier, the test chamber, the daily reveal, the Flipbook page-flip. A swap would touch ~12 call sites but no logic.

### 3. Behavior verb animations: stay in Pixi

**Recommendation:** stay in Pixi. Each verb is a small Pixi component with its own `useTick`. A `BEHAVIOR_VERB_COMPONENTS: Record<BehaviorVerb, React.FC<VerbProps>>` dispatch table maps the part's `behaviorVerb` to its component, and `<TestStage />` instantiates four of them in a row.

**Alternative:** motion + DOM. Worse perf on Fire tablets (every layer is a DOM element), and the effects look heavier (CSS keyframes are coarser than Pixi's per-frame Graphics redraws). Motion stays for UI shell only (page transitions, chip enter/exit, reward card slide-in).

**Cost of switching later:** high. Twelve verbs, each tuned by hand. A late move to DOM means rewriting all twelve animations.

### 4. Daily-Week state: SaveStateV2 with explicit migration

**Recommendation:** add a `dailyWeek` slice plus a `lastClaimedRewards` array to a new `SaveStateV2`. Bump `SAVE_KEY` to `mil:save:v2` (or keep `mil:save:v1` and version internally; the spec keeps the version in the key, but Phase 2 may drop that pattern; see open question below). The migration: when `loadSave()` reads a v1 blob, derive `dailyWeek` from `getDailyVisitor(new Date())` so an existing save lands on today's visitor with `dayInWeek` zero.

**Alternative:** keep ephemeral daily state in a `useDailyWeek` hook with no persistence. Cheaper today, but the seven-day arc loses continuity after a tab close (Day 3 resets to Day 1 on reload). Unacceptable.

**Cost of skipping:** the Daily Special feature is dead.

### 5. Flipbook component: tap-based pagination first

**Recommendation:** tap pagination (◀ chip ▶), simpler, fewer edge cases. Keyboard left/right work for free. Touch-target minimum 44pt on each control.

**Alternative:** motion's `drag` gesture for swipe-to-flip with a 3D page-turn. Looks great but adds: interrupted swipes, accidental flips during scroll, jank under reduced-motion, accessibility headaches with VoiceOver. Phase 2 is not the time.

**Cost of switching later:** low. The component API stays identical (`<Flipbook entries={...} />`); only the gesture handler changes. Swap-in during Phase 3 polish if appetite remains.

### 6. AudioContext unlock: a single `useAudioUnlock` hook in `App.tsx`

**Recommendation:** one hook, mounted in `App.tsx`, listens for the first `pointerdown` anywhere in the document and unlocks Howler's context. Independent of `prefers-reduced-motion`; sound and motion are different settings. Render a small "tipp, um Töne anzumachen" floating hint on first session, dismiss it after the unlock fires, never show it again on the same install.

**Alternative:** gate every `play()` call behind a check. Same effect, more code, easier to forget a call site.

## Numbered milestones

The list below is twelve milestones. Days estimates assume one solo dev at five hours per day; the sprint absorbs spillover.

### M11. Customer data fill plus reaction quote table (~0.5 day)

**Goal:** all six regulars are in `CUSTOMERS` with finalized `wants`/`forbidden`, and `REACTION_QUOTES` lives in shared data, not inline.

**Files:** `src/data/customers.ts` (add oma, twig, kit), `src/data/reactionQuotes.ts` (new), `src/pages/ReactionPage.tsx` (import from shared).

**Pseudocode (data):**

```ts
export const CUSTOMERS: Customer[] = [
  // existing pip, bo, crunch...
  {
    id: 'oma',
    nameDe: 'Oma',
    requestDe: 'mach mir was, das pfeift, wenn der Tee kocht',
    wants: ['cozy', 'zappy'],
    forbidden: [],
    visualKind: 'oma',
  },
  {
    id: 'twig',
    nameDe: 'Twig',
    requestDe: 'der Wind ist zu laut. mach ihn leise für mich',
    wants: ['cozy'],
    forbidden: ['boom'],
    visualKind: 'twig',
  },
  {
    id: 'kit',
    nameDe: 'Kit',
    requestDe: 'erschreck die Katze, bitte',
    wants: ['boom', 'fun'],
    forbidden: [],
    visualKind: 'kit',
  },
];
```

**Verify:** `npm run test:run` stays green. Open `localhost:5173`, advance through three rounds, confirm rotation reaches Twig and the forbidden-Boom rule fires when Boom-heavy parts are picked.

### M12. `<Customer />` SVG component, all seven kinds (~1 day)

**Goal:** finished customer portraits render in `CustomerHeroCard` for all regulars plus moonling.

**Files:** `src/components/customer/Customer.tsx` (new), `src/components/ui/CustomerHeroCard.tsx` (modified).

**Notes:** transcribed from wireframe lines 374-449. The component takes `{ kind: CustomerVisualKind, size?: number }`, draws inline SVG with `viewBox="0 0 140 150"`. The Tailwind palette is referenced via inline `style={{ fill: 'var(--rose)' }}` so light/dark theme switches in Phase 3 stay possible. `<CustomerHeroCard />` swaps the colored circle div for `<Customer kind={customer.visualKind} size={isLarge ? 180 : 64} />`.

**Verify:** add a Vitest snapshot test per kind. Open `/`, see Pip's pink blob; cycle to Twig, see the sage forest creature; cycle to Sir Knirps, see the tin knight. The wireframe screen renders.

### M13. `<PartIcon />` SVG component, twelve parts (~0.75 day)

**Goal:** finished part sprites render in `PartChip`, in the build's selected list, and in the catalogue.

**Files:** `src/components/parts/PartIcon.tsx` (new), `src/components/ui/PartChip.tsx` (modified).

**Notes:** transcribed from wireframe lines 344-368. `viewBox="0 0 32 32"`, default `size={28}`. The dispatch is a switch over `Part['id']`. Replaces the initial-letter circle in PartChip with the proper icon, matched to the chip's gold background.

**Verify:** snapshot test per id. Visually, every chip on the workshop's four-slot row shows the right glyph.

### M14. Pixi part sprites in OrbitStage (~0.75 day)

**Goal:** the orbit shows real part icons, not rounded-rect placeholders.

**Files:** `src/pixi/parts/PartSprite.tsx` (new), `src/pixi/OrbitStage.tsx` (modified).

**Notes:** Pixi v8's `Graphics` cannot render SVG paths directly; we redraw each part with native Pixi primitives (circles, lines, polygons) keyed off the part id. Twelve hand-drawn Pixi `Graphics` callbacks, structurally identical to the SVG ones in `PartIcon.tsx`. The orbit replaces the rounded rect inside `PartNode`'s `drawPart` with a slot-call to `PartSprite` that draws the part-specific shape on top of the slot background.

```ts
const PART_DRAW: Record<Part['id'], (g: Graphics) => void> = {
  cog: (g) => {
    g.circle(0, 0, 8).fill(COLOR_GOLD).stroke({ width: 2.4, color: COLOR_INK });
    for (let a = 0; a < 8; a++) {
      const r = (a * Math.PI) / 4;
      g.moveTo(Math.cos(r) * 9, Math.sin(r) * 9)
        .lineTo(Math.cos(r) * 13, Math.sin(r) * 13)
        .stroke({ width: 2.4, color: COLOR_INK });
    }
  },
  // ...repeat for the other 11 parts
};
```

**Verify:** the orbit visibly shows the cog teeth, the spring coil, the bell shape, and so on. Selection scale-bump still works. Locked parts (magnet, eye, scope) render greyed.

### M15. Behavior verb dispatch and twelve verb animations (~1.5 days)

**Goal:** twelve Pixi components, one per behavior verb, each running its own animation.

**Files:** `src/pixi/verbs/SpinCog.tsx`, `BounceSpring.tsx`, `SparkBolt.tsx`, `PuffBeaker.tsx`, `ChimeBell.tsx`, `WobbleJelly.tsx`, `SoftSock.tsx`, `FlutterFeather.tsx`, `GlowCloud.tsx`, `AttractMagnet.tsx`, `WatchEye.tsx`, `ZoomScope.tsx`, plus `src/pixi/verbs/index.ts` exporting the dispatch table.

**Notes:** each verb component takes `{ active: boolean, x: number, y: number, size?: number }`. When `active` flips false (or the `prefers-reduced-motion: reduce` flag is set), the verb shows its rest pose and its `useTick` short-circuits.

**Pseudocode for the dispatch:**

```ts
import { SpinCog } from './SpinCog';
import { BounceSpring } from './BounceSpring';
// ...

export interface VerbProps { active: boolean; x: number; y: number; size?: number; }

export const BEHAVIOR_VERB_COMPONENTS: Record<BehaviorVerb, React.FC<VerbProps>> = {
  spin: SpinCog,
  bounce: BounceSpring,
  spark: SparkBolt,
  puff: PuffBeaker,
  chime: ChimeBell,
  wobble: WobbleJelly,
  soft: SoftSock,
  flutter: FlutterFeather,
  glow: GlowCloud,
  attract: AttractMagnet,
  watch: WatchEye,
  zoom: ZoomScope,
};
```

**Pseudocode for one verb (SpinCog):**

```tsx
export function SpinCog({ active, x, y, size = 40 }: VerbProps) {
  const ref = useRef<Container | null>(null);
  const reduced = useReducedMotion();
  useTick({
    isEnabled: active && !reduced,
    callback: (ticker) => {
      const c = ref.current;
      if (c) c.rotation += 0.06 * ticker.deltaTime;
    },
  });
  const draw = useCallback((g: Graphics) => {
    g.clear();
    g.circle(0, 0, size * 0.25).fill(COLOR_GOLD);
    for (let a = 0; a < 8; a++) {
      const r = (a * Math.PI) / 4;
      g.moveTo(Math.cos(r) * size * 0.28, Math.sin(r) * size * 0.28)
        .lineTo(Math.cos(r) * size * 0.4, Math.sin(r) * size * 0.4)
        .stroke({ width: 2.4, color: COLOR_INK });
    }
  }, [size]);
  return (
    <pixiContainer ref={ref} x={x} y={y}>
      <pixiGraphics draw={draw} />
    </pixiContainer>
  );
}
```

The other eleven follow the same pattern. `BounceSpring` bobs y by ±6 px on a sine wave; `SparkBolt` triggers a one-shot particle emitter every 600 ms; `WobbleJelly` skews on x by ±0.12 rad; `GlowCloud` pulses alpha 0.6→1.0; `AttractMagnet` shows a small ring of arrowheads pulsing inward; etc.

**Verify:** unit test the dispatch table (every BehaviorVerb maps to a component). Manually open a route that mounts each verb in isolation and confirm motion fires when `active=true`, freezes when `false`, and respects reduced-motion.

### M16. TestStage in Pixi, four verbs firing simultaneously (~1.5 days)

**Goal:** the test chamber is a real Pixi stage. Four verbs (one per picked part) run in parallel for 3 seconds, plus a particle burst, plus an optional screen shake on `tier === 'delight'`.

**Files:** `src/pixi/TestStage.tsx` (new), `src/pages/TestPage.tsx` (modified to mount it instead of the CSS overlay), `src/index.css` (add `mil-shake` keyframe).

**Pseudocode for verb orchestration:**

```tsx
export interface TestStageProps {
  picks: Part[];               // exactly four
  customer: Customer;
  durationMs?: number;         // default 3000
  big: boolean;                // tier === 'delight'
  onComplete: () => void;
}

export function TestStage({ picks, customer, durationMs = 3000, big, onComplete }: TestStageProps) {
  const [active, setActive] = useState(true);
  const reduced = useReducedMotion();

  useEffect(() => {
    if (reduced) {
      // Skip the show, fire onComplete on the next tick.
      const h = setTimeout(onComplete, 60);
      return () => clearTimeout(h);
    }
    const h = setTimeout(() => {
      setActive(false);
      onComplete();
    }, durationMs);
    return () => clearTimeout(h);
  }, [durationMs, onComplete, reduced]);

  // Four slots, evenly spaced left-to-right inside the dome.
  // Each slot mounts the verb component looked up by behaviorVerb.
  const slots = useMemo(() => layoutFourSlots(STAGE_WIDTH, STAGE_HEIGHT), []);

  return (
    <PixiRoot width={STAGE_WIDTH} height={STAGE_HEIGHT}>
      <DomeBackground />
      <CustomerSilhouette kind={customer.visualKind} x={70} y={STAGE_HEIGHT - 80} />
      {picks.map((part, i) => {
        const Verb = BEHAVIOR_VERB_COMPONENTS[part.behaviorVerb];
        const slot = slots[i];
        return <Verb key={part.id} active={active} x={slot.x} y={slot.y} size={48} />;
      })}
      <SparkBurst count={big ? 22 : 8} active={active} />
    </PixiRoot>
  );
}
```

`layoutFourSlots` arranges four 48px slots in a 2x2 grid inside the contraption silhouette. `SparkBurst` is one Pixi `Container` with N particle children, each a small `Graphics` flying outward from the center over 1.6 s, looped while `active`. Screen shake is a CSS class on the React parent (`shake-big` flips a 200 ms `translate3d` keyframe and removes itself afterward).

**Verify:** open `/test`, watch the four verbs animate together. Toggle reduced-motion; verbs freeze at rest pose, dot fill still completes, page advances.

### M17. SaveStateV2 schema migration plus daily-week state (~0.75 day)

**Goal:** existing v1 saves load cleanly into v2; the new `dailyWeek` slice persists across reloads.

**Files:** `src/lib/types.ts`, `src/lib/storage.ts`, `src/hooks/useDailyWeek.ts` (new), `src/hooks/useGameState.ts` (extended action set).

**Pseudocode (types):**

```ts
export interface DailyWeekState {
  weekIndex: number;                // current week's offset since EPOCH
  dayInWeek: number;                // 0..6
  visitorId: string;                // 'moonling' for Moonling Week
  lastVisitDate: string | null;     // ISO 'YYYY-MM-DD'; null on first run
  claimedRewards: number[];         // dayInWeek values already claimed this week
}

export interface SaveStateV2 {
  schemaVersion: 2;
  catalogue: CatalogueEntry[];
  unlockedPartIds: string[];
  lastDailySeed: string | null;
  dailyWeek: DailyWeekState;
}
```

**Pseudocode (migration):**

```ts
function migrate(blob: unknown): SaveStateV2 {
  const v = (blob !== null && typeof blob === 'object')
    ? (blob as Record<string, unknown>).schemaVersion
    : undefined;
  if (v === 2) return blob as SaveStateV2;
  if (v === 1) {
    const v1 = blob as SaveStateV1;
    const today = getDailyVisitor(new Date());
    return {
      schemaVersion: 2,
      catalogue: v1.catalogue,
      unlockedPartIds: v1.unlockedPartIds,
      lastDailySeed: v1.lastDailySeed,
      dailyWeek: {
        weekIndex: today.weekIndex,
        dayInWeek: today.dayInWeek,
        visitorId: today.visitorId,
        lastVisitDate: null,
        claimedRewards: [],
      },
    };
  }
  return defaultSave();
}
```

`useGameState` gains `claimDailyReward(dayInWeek: number)` and `resetWeekIfStale()` (called on load, advances `weekIndex`/clears `claimedRewards` when the on-disk week is older than today's).

**Verify:** Vitest specs cover the v1→v2 lift, the empty-blob default, the v2 round-trip. Manual: set `localStorage.setItem('mil:save:v1', '<v1 blob>')`, reload, see catalogue intact and Daily Special chip greeting today's visitor.

### M18. Daily Special screen (Moonling Week wired, others stubbed) (~1 day)

**Goal:** the C7 screen renders, Moonling's seven-day arc plays out, today's reward and the Day 7 climax show in German.

**Files:** `src/pages/DailyPage.tsx` (new), `src/data/dailyWeekRewards.ts` (new), `src/App.tsx` (route).

**Pseudocode (rewards data):**

```ts
export interface DayReward {
  dayInWeek: number;
  kindDe: string;            // German label for the reward type
  bodyDe: string;            // 1-line copy line for the card
  payload: { type: 'stars'; count: number } | { type: 'partUnlock'; partId: string } | { type: 'cosmetic'; id: string };
}

export const DAILY_WEEK_REWARDS: Record<string, DayReward[]> = {
  moonling: [
    { dayInWeek: 0, kindDe: 'Sterne', bodyDe: '+3 Sterne für deine Sammlung', payload: { type: 'stars', count: 3 } },
    { dayInWeek: 1, kindDe: 'Sterne', bodyDe: '+5 Sterne und ein leuchtender Stempel', payload: { type: 'stars', count: 5 } },
    { dayInWeek: 2, kindDe: 'Aufkleber', bodyDe: 'ein neuer Glitzer-Sticker', payload: { type: 'cosmetic', id: 'moon-sticker-1' } },
    { dayInWeek: 3, kindDe: 'Sterne', bodyDe: '+8 Sterne, halb geschafft', payload: { type: 'stars', count: 8 } },
    { dayInWeek: 4, kindDe: 'Aufkleber', bodyDe: 'goldener Mond-Sticker', payload: { type: 'cosmetic', id: 'moon-sticker-2' } },
    { dayInWeek: 5, kindDe: 'Sterne', bodyDe: '+12 Sterne, fast da', payload: { type: 'stars', count: 12 } },
    { dayInWeek: 6, kindDe: 'Mond-Teil', bodyDe: 'das Mondlicht-Teil! ein neues legendäres Stück', payload: { type: 'partUnlock', partId: 'moonbeam' } },
  ],
  // hooks, tinker, beep, snorri, whisp, doc: each gets a stubbed array of seven neutral 'stars' rewards until their themed week is designed in Phase 3.
};
```

The Moonling-only Day 7 unlock requires one new part (`moonbeam`), which we add to `parts.ts` as a 13th part with `unlock: { customerId: 'moonling', tier: 'delight' }`. Its sprite is the existing `Ic type="moonling"` styled element, scaled down. Its trait contribution: Cozy +1, Zappy +1.

**Pseudocode (state machine):**

```
on /daily mount:
  resetWeekIfStale()                           // advance week if today is past lastVisitDate's week
  read dailyWeek state
  if today.dayInWeek ∈ claimedRewards:
    show "Heute schon abgeholt. Komm morgen wieder."
  else:
    show today's reward card + "Mondling helfen ➜" CTA

on CTA tap:
  startArrival(dailyWeek.visitorId)
  navigate('/arrival')

on returning to /daily after a delight on the daily visitor:
  claimDailyReward(today.dayInWeek)
  if today.dayInWeek === 6: unlockPart('moonbeam')
  show celebration overlay
```

**Verify:** Vitest covers `claimDailyReward` idempotence + `resetWeekIfStale`. Manual: walk through Day 1, see "+3 Sterne", complete a delight on Moonling, see the claimed-state. Mock the clock 24 hours forward, reload, see Day 2's card with its specific copy.

### M19. Flipbook catalogue, two-page spread (~1 day)

**Goal:** `/catalogue` shows the flipbook spread (painting left, test result right) with tap pagination. The stub grid is gone.

**Files:** `src/components/ui/Flipbook.tsx` (new), `src/pages/CataloguePage.tsx` (modified).

**Pseudocode:**

```tsx
export interface FlipbookProps { entries: CatalogueEntry[]; }

export function Flipbook({ entries }: FlipbookProps) {
  const [pageIndex, setPageIndex] = useState(0);
  const totalPages = Math.max(1, Math.ceil(entries.length / 2));
  const left = entries[pageIndex * 2];
  const right = entries[pageIndex * 2 + 1];
  const onPrev = () => setPageIndex((i) => Math.max(0, i - 1));
  const onNext = () => setPageIndex((i) => Math.min(totalPages - 1, i + 1));

  return (
    <div className="flex-1 flex flex-col gap-3 min-h-0">
      <div className="flex-1 grid grid-cols-2 gap-3 min-h-0">
        <FlipbookPage entry={left} side="left" />
        <FlipbookPage entry={right} side="right" />
      </div>
      <div className="flex items-center justify-center gap-3">
        <button type="button" onClick={onPrev} disabled={pageIndex === 0}
                className="w-11 h-11 rounded-full border-[2.5px] border-ink bg-paper font-black"
                aria-label="vorherige Seite">◀</button>
        <span className="inline-flex items-center gap-1.5 border-2 border-ink rounded-full bg-gold px-3.5 py-1.5 text-[14px] font-extrabold">
          Seite {pageIndex + 1} / {totalPages}
        </span>
        <button type="button" onClick={onNext} disabled={pageIndex === totalPages - 1}
                className="w-11 h-11 rounded-full border-[2.5px] border-ink bg-paper font-black"
                aria-label="nächste Seite">▶</button>
      </div>
    </div>
  );
}

function FlipbookPage({ entry, side }: { entry?: CatalogueEntry; side: 'left' | 'right' }) {
  if (!entry) return <div className="bg-paper border-[2.5px] border-ink rounded-2xl p-4 opacity-50 flex items-center justify-center font-script text-ink-soft">leer</div>;
  const customer = getCustomerById(entry.customerId);
  return (
    <article className={`bg-paper border-[2.5px] border-ink rounded-2xl p-4 flex flex-col gap-2 shadow-[0_4px_0_rgba(31,26,42,0.14)] ${side === 'right' ? 'bg-gradient-to-b from-paper to-bg-2' : ''}`}>
      <div className="aspect-square w-full rounded-xl border-2 border-dashed border-ink bg-bg-2 flex items-center justify-center">
        <Contraption parts={entry.parts} />
      </div>
      <div className="font-display font-extrabold text-[16px] tracking-tight">{entry.nameDe}</div>
      <div className="font-script text-[14px] text-ink-soft">für {customer?.nameDe} · {formatDateDe(entry.createdAt)}</div>
      <Fingerprint scores={entry.traitScores} />
      <div className="flex items-center gap-1.5 flex-wrap">
        {entry.parts.map((p, i) => <PartIcon key={`${p.id}-${i}`} type={p.id as any} size={22} />)}
      </div>
    </article>
  );
}
```

`<Contraption />` is a small SVG composing the four picked-part icons stacked: largest at base, smallest on top. Phase 2 fakes this with a 2x2 grid of icons; the procedural `attach_hints` placement is a Phase 3 visual upgrade.

**Verify:** snapshot test for Flipbook with two, three, four, and zero entries. Manual: with eight catalogue entries, four pages, tap-through, last page shows entries 7+8.

### M20. Sound system: Howler plus eight to twelve SFX clips (~0.75 day)

**Goal:** sounds play on (a) tube swoosh on customer arrival, (b) part pick chime, (c) test ka-thunk, (d) sensor dot ticks (one per dot landing), (e) reaction tier (delight cheer, fail throw-back), (f) Day 7 fanfare, (g) tab bar tap. AudioContext is unlocked on the first user gesture, anywhere.

**Files:** `src/audio/sfx.ts`, `src/audio/useAudio.ts`, `src/hooks/useAudioUnlock.ts`, `src/App.tsx` (mount unlock hook), `public/sfx/*.mp3` (the actual clips).

**Pseudocode (dispatch table):**

```ts
export type SfxId =
  | 'tubeSwoosh' | 'partPick' | 'testKathunk' | 'dotTick'
  | 'reactionDelight' | 'reactionSatisfied' | 'reactionSortOf' | 'reactionFail'
  | 'dailyClaim' | 'pageFlip' | 'tabTap';

interface SfxDef { src: string; volume: number; rate?: number; }

export const SFX: Record<SfxId, SfxDef> = {
  tubeSwoosh: { src: '/sfx/tube-swoosh.mp3', volume: 0.7 },
  partPick: { src: '/sfx/part-pick.mp3', volume: 0.5 },
  testKathunk: { src: '/sfx/test-kathunk.mp3', volume: 0.85 },
  dotTick: { src: '/sfx/dot-tick.mp3', volume: 0.4 },
  reactionDelight: { src: '/sfx/cheer.mp3', volume: 0.8 },
  reactionSatisfied: { src: '/sfx/satisfied.mp3', volume: 0.6 },
  reactionSortOf: { src: '/sfx/hmm.mp3', volume: 0.5 },
  reactionFail: { src: '/sfx/throwback.mp3', volume: 0.7 },
  dailyClaim: { src: '/sfx/daily-claim.mp3', volume: 0.75 },
  pageFlip: { src: '/sfx/page-flip.mp3', volume: 0.4 },
  tabTap: { src: '/sfx/tab-tap.mp3', volume: 0.35 },
};
```

**Pseudocode (unlock hook):**

```ts
export function useAudioUnlock(): { unlocked: boolean; showHint: boolean } {
  const [unlocked, setUnlocked] = useState(false);
  const [showHint, setShowHint] = useState(false);

  useEffect(() => {
    if (unlocked) return;
    const isFirstSession = !localStorage.getItem('mil:audio:unlocked');
    if (isFirstSession) {
      const t = setTimeout(() => setShowHint(true), 2500);
      return () => clearTimeout(t);
    }
  }, [unlocked]);

  useEffect(() => {
    if (unlocked) return;
    const handler = () => {
      Howler.ctx?.resume();
      setUnlocked(true);
      setShowHint(false);
      localStorage.setItem('mil:audio:unlocked', '1');
    };
    document.addEventListener('pointerdown', handler, { once: true });
    return () => document.removeEventListener('pointerdown', handler);
  }, [unlocked]);

  return { unlocked, showHint };
}
```

The sources for the eight to twelve clips: free CC0 sounds from freesound.org or pixabay-audio. Each clip gets a quick 200 ms fade-in/out edit in Audacity, exported as 96 kbps mp3 (~3-8 KB each). Total payload under 80 KB.

**Open question:** whether to commission custom SFX or stay with curated CC0 clips. Recommendation: ship CC0 in Phase 2; revisit for Phase 3 polish if Marc wants signature audio.

**Verify:** unit test the dispatch table (every Sfx id in the union has a SFX entry). Manual: tap a part, hear a chime; trigger a delight, hear the cheer; toggle the global mute (added under M21), all sounds stop.

### M21. Functional `<TabBar />` plus a stubbed Shop tab (~0.5 day)

**Goal:** the four-tab navigation works on Workshop, Catalogue, Daily, and a placeholder Shop screen.

**Files:** `src/components/ui/TabBar.tsx` (new), `src/pages/ShopStubPage.tsx` (new, single sentence "Bald da."), `src/pages/WorkshopPage.tsx`/`CataloguePage.tsx`/`DailyPage.tsx` (modified to swap their static nav for `<TabBar />`), `src/App.tsx` (Shop route).

**Pseudocode:**

```tsx
type TabKey = 'lab' | 'buch' | 'laden' | 'taglich';

export interface TabBarProps {
  active: TabKey;
  onMute?: () => void;        // optional; only Shop shows the audio toggle for now
  muted?: boolean;
}

export function TabBar({ active }: TabBarProps) {
  const navigate = useNavigate();
  const audio = useAudio();
  const tabs: Array<{ key: TabKey; labelDe: string; route: string; icon: ReactNode }> = [
    { key: 'lab', labelDe: 'Lab', route: '/', icon: <PartIcon type="cog" size={26} /> },
    { key: 'buch', labelDe: 'Buch', route: '/catalogue', icon: <BookIcon /> },
    { key: 'laden', labelDe: 'Laden', route: '/shop', icon: <ShopIcon /> },
    { key: 'taglich', labelDe: 'Täglich', route: '/daily', icon: <span aria-hidden="true">★</span> },
  ];

  return (
    <nav aria-label="Hauptnavigation" className="absolute left-[18px] right-[18px] bottom-[18px] h-[72px] bg-paper border-[2.5px] border-ink rounded-[30px] flex items-center justify-around shadow-[0_8px_0_rgba(31,26,42,0.10)] px-2">
      {tabs.map((tab) => (
        <button key={tab.key} type="button" aria-label={tab.labelDe} aria-current={active === tab.key ? 'page' : undefined}
                onClick={() => { audio.play('tabTap'); navigate(tab.route); }}
                className={`w-[54px] h-[54px] rounded-2xl flex items-center justify-center font-black text-[16px] ${active === tab.key ? 'bg-gold text-ink shadow-[inset_0_-4px_0_rgba(0,0,0,0.18)]' : 'text-ink-soft'}`}>
          {tab.icon}
        </button>
      ))}
    </nav>
  );
}
```

The audio mute lives on the Shop screen for now ("Töne aus / Töne an" toggle). A proper settings surface lands in Phase 3.

**Verify:** all four tabs reachable, the active state highlights the right tab on each route, the in-flight round (arrival/test/reaction) has no tab bar (those screens stay focused).

### M22. Louis playtest plus polish loop (~1 day)

**Goal:** Louis sits with the build for fifteen minutes. We watch, take notes, fix the top three pain points before tagging Phase 2.

**Files:** issue-driven; expected hits include sensor-dot timing, Daily Special copy clarity, particle density on the Fire-tablet preview.

**Verify:** Phase 2 done checklist below all green, plus three or more concrete observations from Louis recorded in `docs/playtests/2026-05-Xx-louis-phase-2.md`. Tag the commit `phase-2-content`.

## Sample German UI copy

All `du`-form, first-grader vocabulary, no abstract verbs.

**Daily Special screen:**

- Top chip (dark): `★ TAG 1 von 7 · Mondling-Woche`
- Top chip (gold): `⏰ noch 6 Std`
- Eyebrow on hero card: `diese Woche zu Besuch`
- Sub-line under name: `kommt jeden Abend`
- Speech bubble: `bring mich heim, bevor die Sonne untergeht, bitte`
- Week progress eyebrow: `deine Woche`
- Today's reward eyebrow: `heute holst du`
- Day 7 line: `Tag 7: das Mondlicht-Teil`
- CTA primary: `Mondling helfen ➜`
- Already-claimed: `Heute schon geholt. Komm morgen wieder!`
- Mute toggle (Shop): `Töne aus`, `Töne an`
- Audio unlock hint: `tipp einmal, dann hörst du die Werkstatt`

**Flipbook screen:**

- Eyebrow: `deine Sammlung`
- Title: `Buch`
- Filter chips: `Alle`, `Selten ★` (M19 wires Alle only; the others stay disabled), `nach Kunde`
- Entry side line: `für [Name] · [Datum]`, e.g. `für Pip · 28. Apr`
- Page chip: `Seite [N] / [M]`
- Empty state title: `Noch leer.`
- Empty state subtitle: `Bau dein erstes Ding.`
- Pagination button labels: `vorherige Seite`, `nächste Seite`

## Testing approach

**Unit (Vitest):**

- Storage v1→v2 migration: write a v1 blob, load it, assert v2 fields exist with sensible defaults derived from `getDailyVisitor`. Round-trip a v2 blob.
- `claimDailyReward` is idempotent; claiming the same `dayInWeek` twice does not duplicate the reward.
- `resetWeekIfStale` advances `weekIndex` and clears `claimedRewards` only when the on-disk week is older than today's.
- Reward dispatch: every visitor id in `DAILY_VISITORS` has an entry in `DAILY_WEEK_REWARDS`, even if stubbed.
- Verb dispatch: every `BehaviorVerb` value maps to a component in `BEHAVIOR_VERB_COMPONENTS`.
- SFX dispatch: every `SfxId` union member has a `SFX` entry.

**Component snapshots (now useful):**

- `<Customer kind="..." />` for all seven kinds.
- `<PartIcon type="..." />` for all twelve parts.
- `<Flipbook entries={...} />` with zero, one, two, and three entries.
- `<DailyPage />` for Day 1, Day 4, Day 7, and the already-claimed state.

**Manual playtests:**

- Marc plays a full week of Moonling, mocking `Date.now` forward day-by-day. Confirm: the chip advances, the reward changes, Day 7 unlocks the Mondlicht-Teil, the Flipbook shows the catalogue entries with finished art.
- Louis plays the build for 15+ minutes unsupervised. Watch for confusion, abandonment, or pure delight. Capture three observations.

## Phase 2 done when...

- [ ] All six regulars in `CUSTOMERS` with finalized fingerprints; reaction quotes for all six in `reactionQuotes.ts`.
- [ ] `<Customer />` renders all seven kinds; `<PartIcon />` renders all twelve.
- [ ] OrbitStage shows finished part sprites; selection scale-bump still works.
- [ ] Twelve verb components in `src/pixi/verbs/`; dispatch table covers every `BehaviorVerb`.
- [ ] TestStage runs four verbs simultaneously over 3 seconds, big-mode shake fires on delight, reduced-motion short-circuits cleanly.
- [ ] SaveStateV2 lands; v1 saves migrate; `npm run test:run` covers all migration paths.
- [ ] DailyPage at `/daily` shows the Moonling Week arc; Day 7 unlocks `moonbeam`.
- [ ] Flipbook replaces the stub grid; tap pagination works; empty/single/many entries all render.
- [ ] Eight to twelve SFX clips wired; AudioContext unlocks on first gesture; mute toggle in Shop.
- [ ] TabBar functional across the four tabs.
- [ ] `npm run test:run` green with at least 30 tests; `npm run build` green; `npm run lint` clean.
- [ ] Louis playtest captured with three observations.
- [ ] Commit tagged `phase-2-content`.

## Open questions

1. **Save key versioning convention.** Phase 1 embedded the schema version in the localStorage key (`mil:save:v1`). The Phase 2 migration could either: (a) bump the key to `mil:save:v2` and read both keys with v1 winning if v2 is absent, or (b) keep the key as `mil:save:v1` and rely entirely on the in-blob `schemaVersion`. (a) is cleaner for cross-version coexistence (e.g. a parent and a kid on the same browser running different builds), (b) is simpler. **Recommendation:** ship (b) for Phase 2; bump the key only at v3 if it ever becomes confusing. Marc to confirm before M17.

2. **Custom SFX vs CC0.** Should Phase 2 commission ten signature clips, or use curated CC0 sources? CC0 ships faster and is free; commission gives signature audio that feels like ours. **Recommendation:** CC0 for Phase 2, revisit in Phase 3.

3. **`moonbeam` part.** The Day 7 Moonling reward is a thirteenth part, breaking the spec's "12 parts" line. Marc may want to: (a) accept it (the Daily Special is its unlock vector and stays distinct from the regular roster), or (b) reuse one of the three locked parts (magnet/eye/scope) as the Day 7 reward. **Recommendation:** ship `moonbeam` as the thirteenth; it makes Moonling Week feel meaningfully distinct.

4. **Procedural contraption thumbnail.** The catalogue thumbnail today is "Bild" placeholder text; M19 fakes it with a 2x2 icon grid. The spec mentions "auto-render from part composition." Marc to decide if M19's 2x2 grid is good enough for Louis's playtest, or if we need true procedural composition (largest at base, smallest on top, randomized per attach_hints) for Phase 2. **Recommendation:** ship the 2x2 grid for Phase 2; defer true procedural composition to Phase 3.

## Deferred to Phase 3

iOS HIG full polish (44pt audit, safe-area insets, haptics, VoiceOver labels), PWA manifest + iOS Add-to-Home-Screen guidance, onboarding (silent first-customer guided flow), watercolor and ink alt palettes, performance profile on a real Fire tablet, settings screen, true procedural catalogue thumbnails, the remaining six themed weeks (Captain Hooks, Tüftelmaus, Beep, Snorri, Wölkchen, Doc), the Shop tab made real with cosmetic packs, share-this-run artifact export, and any custom-recorded SFX. Cosmetics shop, monetization, accounts, and cloud save remain post-MVP.
