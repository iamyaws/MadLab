# Phase 1 Spike Plan · Mad Inventor Lab

**Date:** 2026-05-03
**Status:** Plan ready for execution (Phase 1, weeks 1-2, solo dev)
**Repo:** `C:/Users/öööö/dev/mad-inventor-lab/`
**Spec:** [`../specs/2026-05-03-mad-inventor-lab-design.md`](../specs/2026-05-03-mad-inventor-lab-design.md)
**Conventions reference:** [`../notes/2026-05-03-codebase-conventions-survey.md`](../notes/2026-05-03-codebase-conventions-survey.md)

## Goal

End-to-end loop running on placeholder art by end of week 2: customer arrives via tube animation, player picks 4 parts from a Pixi orbit, contraption "tests" with a particle burst, sensors light up live, customer reacts at one of four tiers, the entry persists to a localStorage catalogue, and a part can unlock as a tip. No finished art, no sound, no PWA polish, no onboarding. The five core screens (Workshop, Arrival, Build, Test, Reaction) are wired together with a stubbed Catalogue list. Vitest covers trait scoring, tier resolution, and daily-week rotation. Marc must be able to play one full round and see the entry in `localStorage` after closing and reopening the tab.

## Critical files (created in Phase 1)

The list below is the target structure once Phase 1 lands. Naming mirrors BeyArena (kebab-case files, PascalCase components, lowercase lib modules, types in `src/lib/types.ts`, hooks in `src/hooks/`, screen-level pages under `src/pages/`).

- `src/lib/types.ts` · All shared domain types (`Trait`, `TraitScores`, `Tier`, `Part`, `Customer`, `Invention`, `RunState`, `CatalogueEntry`, `SaveStateV1`).
- `src/data/parts.ts` · Static part roster (12 parts), each with id, German label, behavior verb, trait contribution. 9 starter + 3 locked.
- `src/data/customers.ts` · 3 placeholder customers for Phase 1 (`pip`, `bo`, `crunch`), with wants, forbidden traits, request copy in German.
- `src/data/dailyRoster.ts` · 7 daily-special visitors as data only (no UI yet); used by `dailyRotation.ts` so the rotation logic can be tested before Phase 2 builds the screen.
- `src/lib/composition.ts` · Pure function: `compose(parts: Part[], customer: Customer): Invention` returning `{ traitScores, tier, parts, customerId, createdAt }`. No I/O.
- `src/lib/satisfaction.ts` · Pure function: `resolveTier(scores, customer): Tier`. Imported by `composition.ts`. Split out so the tier rules are testable in isolation.
- `src/lib/dailyRotation.ts` · Pure function: `getDailyVisitor(date: Date): { visitorId, dayInWeek, weekIndex }`. ISO-week-based, deterministic.
- `src/lib/storage.ts` · Typed `localStorage` wrapper with schema versioning (`SaveStateV1`, `loadSave()`, `saveSave()`, `migrate()`). One key: `mil:save:v1`.
- `src/hooks/useGameState.ts` · The single source of truth for the round and persistence. Wraps `useReducer` over `RunState`. Auto-persists on change.
- `src/hooks/useRoundFlow.ts` · Phase machine for the round: `idle → arrival → build → test → reaction → idle`. Returns `{ phase, advance, customer, picks, invention }`.
- `src/pixi/PixiRoot.tsx` · Single `<Application>` mount + sizing observer. All Pixi work re-uses this stage.
- `src/pixi/OrbitStage.tsx` · The 3D-tilted orbit with parts and central contraption. Driven by props (parts, selected ids, onPick).
- `src/pixi/TestStage.tsx` · Glass-dome test chamber + particle burst. Plays for 3-4 seconds and emits an `onComplete` callback.
- `src/components/ui/PhoneShell.tsx` · The 390x820 phone-shell wrapper Marc keeps for visual parity with the wireframe; deliberately not full-bleed in Phase 1.
- `src/components/ui/Fingerprint.tsx` · 4-trait dot scoreline (predict + final variants). Pure presentational.
- `src/components/ui/SensorGrid.tsx` · 4 sensor cells, dots fill in over the test animation.
- `src/components/ui/CustomerHeroCard.tsx` · Customer portrait + request bubble + wants chips. Placeholder portrait is a colored circle with the customer name.
- `src/components/ui/PartChip.tsx` · The "selected part" chip with icon slot and remove affordance.
- `src/pages/WorkshopPage.tsx` · C1 main loop screen.
- `src/pages/ArrivalPage.tsx` · C2 customer arrival.
- `src/pages/BuildPage.tsx` · C3 pick parts.
- `src/pages/TestPage.tsx` · C4 test reveal.
- `src/pages/ReactionPage.tsx` · C5 reaction + maybe-unlock.
- `src/pages/CataloguePage.tsx` · C6 stub (grid list, no flipbook yet).
- `src/routes.tsx` · Route definitions, mirrors BeyArena's `routes.tsx`.
- `src/App.tsx` + `src/main.tsx` + `src/index.css` · Bootstrap, Tailwind layer, design tokens.
- `tailwind.config.ts` · Cel-shaded palette as theme tokens.
- `src/test/setup.ts` · Same one-liner as BeyArena.
- `src/lib/__tests__/composition.test.ts`, `satisfaction.test.ts`, `dailyRotation.test.ts`, `storage.test.ts` · Vitest specs colocated.

That's roughly 20 source files + 4 test files. Within budget for two weeks.

## Architectural trade-offs

**1. Pixi-React boundary.** A single `<Application>` lives in `src/pixi/PixiRoot.tsx` and mounts only on routes that need it (Workshop, Build, Test). React + Tailwind own all chrome (nav, hero card, chips, buttons, sensor grid, catalogue list, route transitions). Pixi owns: the orbit, the parts as draggable/tappable sprites, the contraption silhouette, the particle burst, screen-shake. Crucially, *trait state and selected-part state live in React*, not in Pixi. Pixi receives them as props and emits intents via callbacks. This keeps the testable code free of WebGL and lets Vitest run without canvas. A small `usePixiTicker` hook bridges the two when needed (e.g., for the live-firing sensor dots, React state is updated each tick on a throttled cadence).

**2. State management.** `useReducer` + a single `useGameState` hook wrapped in a thin Context provider. No Zustand or React Query in Phase 1.

BeyArena uses Zustand for cross-route session state, but Mad Inventor Lab in Phase 1 has exactly one piece of cross-route state (the in-progress round + catalogue), and a reducer hook is enough. Choosing Zustand now would be premature; choosing Context + useReducer keeps the surface area small and the persistence story trivial (one effect calls `saveSave(state)` on change, debounced 200ms). Zustand can be adopted in Phase 2 if multiple stores emerge (daily progress, cosmetics, settings) — at that point migration is a few hours of work. **This is a deliberate divergence from BeyArena's pattern; revisit at Phase 2 boundary.**

**3. Routing.** React Router v6 (already in BeyArena) wins over a hash router. The screens map cleanly to routes (`/`, `/arrival`, `/build`, `/test`, `/reaction`, `/catalogue`), Marc gets back/forward for free during dev, and we avoid hand-rolling history. The cost is a slightly heavier dep, but it's one Marc already trusts and types.

**4. Animation orchestration.** Two animation systems coexist with a clear rule: *Pixi tickers for in-stage motion (parts orbiting, parts settling on workbench, particle burst, screen-shake), `motion` for UI shell motion (page transitions, chip enter/exit, button press feedback, hero card swap when a new customer arrives).* No overlap. `motion`'s `AnimatePresence` wraps the `<Routes>` outlet to cross-fade between screens; Pixi handles everything inside the canvas. The reduced-motion CSS rule short-circuits both: Pixi tickers check `window.matchMedia('(prefers-reduced-motion: reduce)').matches` once at mount and bypass the burst; `motion` respects it natively.

**5. Testing strategy.** Logic-first, no E2E in Phase 1. Vitest covers the four pure modules (`composition`, `satisfaction`, `dailyRotation`, `storage`). One smoke render-test ensures `App` mounts under `MemoryRouter` (mirrors `App.test.tsx` in BeyArena). Snapshot tests are skipped: the visuals are placeholders and will churn in Phase 2. The validation gate is "Marc plays one full round, the entry shows up after a tab close/reopen."

## Numbered milestones

### M1 · Project scaffold

**Goal:** `npm run dev` serves a blank Tailwind-styled phone shell.
**Files:** `package.json`, `vite.config.ts`, `tsconfig.json`, `tsconfig.app.json`, `tsconfig.node.json`, `tailwind.config.ts`, `postcss.config.js`, `eslint.config.js`, `.prettierrc`, `src/main.tsx`, `src/App.tsx`, `src/index.css`, `index.html`.

**Notes:** Mirror BeyArena's setup minus the PWA plugin (deferred to Phase 3) and minus Supabase chunking. Use `npm` (matches BeyArena). TypeScript in strict mode with `noUnusedLocals` and `noUnusedParameters` enabled (BeyArena pattern, catches dead code early).

Dependencies (production): `react`, `react-dom`, `react-router-dom`, `pixi.js`, `@pixi/react`, `motion`.
Dev: `vite`, `@vitejs/plugin-react`, `typescript`, `@types/react`, `@types/react-dom`, `tailwindcss`, `autoprefixer`, `postcss`, `eslint`, `@typescript-eslint/eslint-plugin`, `@typescript-eslint/parser`, `eslint-plugin-react-hooks`, `prettier`, `vitest`, `@testing-library/react`, `@testing-library/jest-dom`, `@testing-library/user-event`, `jsdom`.

Scripts (BeyArena pattern):
```json
{
  "dev": "vite",
  "build": "tsc -b && vite build",
  "preview": "vite preview",
  "test": "vitest",
  "test:run": "vitest run",
  "lint": "eslint src --ext .ts,.tsx",
  "format": "prettier --write src"
}
```

**Verify:** Vite dev server starts on `localhost:5173`, no console errors. `npm run test:run` runs and reports zero specs. `npm run lint` passes. `npm run build` produces a clean `dist/`.

### M2 · Design tokens + phone shell + Tailwind palette

**Goal:** Phone shell renders, palette is reachable as Tailwind classes.
**Files:** `tailwind.config.ts`, `src/index.css`, `src/components/ui/PhoneShell.tsx`.

**Notes:** Token map in Tailwind:

```ts
colors: {
  bg: '#FFE9C4',
  'bg-2': '#FFD089',
  paper: '#FFFBEF',
  ink: '#1F1A2A',
  'ink-soft': '#6A6275',
  primary: '#3CC4DA',
  'primary-deep': '#1F88A0',
  gold: '#FFC93C',
  plum: '#B970D2',
  rose: '#FF6F61',
  sage: '#7DD66F',
  line: '#1F1A2A',
}
```

Fonts: Fraunces, Nunito, Caveat as Google Fonts in `index.html`. Three font-family tokens: `display` (Fraunces), `body` (Nunito), `script` (Caveat). PhoneShell is a `390 x 820` div with `border-2.5 border-ink rounded-[48px]`; later phases can drop it for full-screen.

**Verify:** A page renders using `bg-bg`, `text-ink`, `font-display` classes successfully.

### M3 · Domain types + part/customer data

**Goal:** Static data is loaded and typed.
**Files:** `src/lib/types.ts`, `src/data/parts.ts`, `src/data/customers.ts`, `src/data/dailyRoster.ts`.

**Notes:** Skeleton:

```ts
export type Trait = 'fun' | 'zappy' | 'cozy' | 'boom';
export type TraitScores = Record<Trait, number>; // 0-3 each
export type Tier = 'delight' | 'satisfied' | 'sortOf' | 'fail';
export interface Part {
  id: string;
  labelDe: string;
  behaviorVerb: 'spin' | 'bounce' | 'spark' | 'puff' | 'chime' | 'wobble' | 'soft' | 'flutter' | 'glow' | 'attract' | 'watch' | 'zoom';
  contributes: Partial<TraitScores>;
  category: 'mechanical' | 'energy' | 'sensory' | 'material';
  unlock?: { customerId: string; tier: 'delight' };
}
export interface Customer {
  id: string;
  nameDe: string;
  requestDe: string;
  wants: Trait[];
  forbidden: Trait[];
  visualKind: 'pip' | 'kid' | 'crunch' | 'oma' | 'twig' | 'kit' | 'moonling' | 'creature';
}
export interface Invention {
  parts: Part[];
  customerId: string;
  traitScores: TraitScores;
  tier: Tier;
  createdAt: number;
}
export interface CatalogueEntry extends Invention { id: string; nameDe: string; }
export interface SaveStateV1 {
  schemaVersion: 1;
  catalogue: CatalogueEntry[];
  unlockedPartIds: string[];
  lastDailySeed: string | null;
}
```

3 customers populated for Phase 1 (`pip`, `bo`, `crunch`). 9 starter parts + 3 locked parts (full data, not all visible).

**Verify:** Types compile, a quick `console.log(parts.length)` returns 12.

### M4 · Pure logic: composition + satisfaction + tests

**Goal:** Trait scoring and tier resolution work, tests green.
**Files:** `src/lib/composition.ts`, `src/lib/satisfaction.ts`, two test files.

**Pseudocode:**

```ts
// satisfaction.ts
export function resolveTier(s: TraitScores, c: Customer): Tier {
  const forbiddenFires = c.forbidden.some(t => s[t] > 0);
  if (forbiddenFires) return 'fail';
  const wantsHigh = c.wants.every(t => s[t] >= 2);
  const wantsAny  = c.wants.every(t => s[t] >= 1);
  const wantsAtLeastOne = c.wants.some(t => s[t] >= 1);
  if (wantsHigh) return 'delight';
  if (wantsAny)  return 'satisfied';
  if (wantsAtLeastOne) return 'sortOf';
  return 'fail';
}

// composition.ts
export function sumTraits(parts: Part[]): TraitScores {
  const out: TraitScores = { fun: 0, zappy: 0, cozy: 0, boom: 0 };
  for (const p of parts) for (const k in p.contributes) {
    out[k as Trait] = Math.min(3, out[k as Trait] + (p.contributes[k as Trait] ?? 0));
  }
  return out;
}
export function compose(parts: Part[], customer: Customer): Invention {
  const scores = sumTraits(parts);
  return { parts, customerId: customer.id, traitScores: scores, tier: resolveTier(scores, customer), createdAt: Date.now() };
}
```

**Tests:**
- `sumTraits` sums correctly and caps at 3 per trait.
- `resolveTier` returns `fail` whenever a forbidden trait fires, regardless of wants.
- `resolveTier` returns each of the four tiers given representative inputs (table-driven test).
- `compose` integrates both correctly.

**Verify:** `npm run test:run` shows 6+ green tests.

### M5 · localStorage wrapper + schema v1

**Goal:** State round-trips through `localStorage` with versioning.
**Files:** `src/lib/storage.ts`, `src/lib/__tests__/storage.test.ts`.

**Pseudocode for versioning:**

```ts
const KEY = 'mil:save:v1';

export function loadSave(): SaveStateV1 {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return defaultSave();
    const parsed = JSON.parse(raw) as { schemaVersion?: number };
    return migrate(parsed);
  } catch {
    return defaultSave(); // never throw on read; corrupt save = fresh start
  }
}

function migrate(blob: unknown): SaveStateV1 {
  const v = (blob as any)?.schemaVersion;
  if (v === 1) return blob as SaveStateV1;
  return defaultSave();
}

export function saveSave(s: SaveStateV1): void {
  localStorage.setItem(KEY, JSON.stringify(s));
}
```

The key embeds the version so a future v2 (Phase 2/3) can co-exist briefly during migration. `defaultSave()` returns `{ schemaVersion: 1, catalogue: [], unlockedPartIds: [9 starter ids], lastDailySeed: null }`.

**Verify:** Test writes a save, reads it back, asserts equality. Test reads a malformed blob and asserts `defaultSave()` is returned.

### M6 · Daily rotation logic + tests (data only, no screen)

**Goal:** Given a date, return the right visitor and day-in-week.
**Files:** `src/lib/dailyRotation.ts`, test file.

**Pseudocode:**

```ts
const DAILY_VISITOR_ORDER = ['moonling','hooks','tinker','beep','snorri','whisp','doc'];
const EPOCH = Date.UTC(2026, 4, 4); // ISO Monday week-anchor

export function getDailyVisitor(now: Date) {
  const ms = now.getTime() - EPOCH;
  const day = Math.floor(ms / 86_400_000);
  const weekIndex = Math.floor(day / 7);
  const dayInWeek = ((day % 7) + 7) % 7; // 0..6, 0 = Monday
  const visitorId = DAILY_VISITOR_ORDER[weekIndex % DAILY_VISITOR_ORDER.length];
  return { visitorId, dayInWeek, weekIndex };
}
```

**Tests:** known dates land on known visitors; rotation wraps after 7 weeks; pre-epoch dates (defensive) don't crash.

**Verify:** Test file green.

### M7 · useGameState + useRoundFlow

**Goal:** A reducer-driven round flow drives the screens.
**Files:** `src/hooks/useGameState.ts`, `src/hooks/useRoundFlow.ts`.

**Notes:** `useGameState` exposes catalogue, unlocked-part ids, and daily seed. Persists on every change via a `useEffect` that calls `saveSave`. `useRoundFlow` owns ephemeral round state (`currentCustomerId`, `pickedPartIds`, `phase`). `phase` is `'idle' | 'arrival' | 'build' | 'test' | 'reaction'`. `advance()` is the only exposed mutation; the route navigation reacts to phase changes via `useEffect`. Phase 2 may collapse these into one store; in Phase 1 the split keeps catalogue (persisted) and round (ephemeral) cleanly separated.

**Verify:** A test renders a tiny harness, calls `advance()` four times, asserts the final phase and that `catalogue.length === 1` after the reaction.

### M8 · Pixi root + OrbitStage with placeholder parts

**Goal:** A tappable orbit of 8 placeholder parts renders inside React.
**Files:** `src/pixi/PixiRoot.tsx`, `src/pixi/OrbitStage.tsx`, integration into `WorkshopPage.tsx`.

**Notes:** Each part is a Pixi `Graphics` rounded rectangle with the part name in a `Text` child. The orbit applies `rotateX(56deg)` and a slow `rotateZ` ticker; tap targets up-rotate on hover/tap to keep them readable (mirroring the wireframe's `rotateX(-56deg)` upright trick). Selection state comes from props (`selectedPartIds: string[]`); tap emits `onPick(partId)`. The contraption in the center is a single `Graphics` placeholder for now.

**Verify:** Manual: orbit spins, tapping a part fires the callback, selection visibly toggles. No state lives in Pixi.

### M9 · Five core screens wired, with motion transitions

**Goal:** Marc can walk through Workshop → Arrival → Build → Test → Reaction → Catalogue.
**Files:** `src/pages/WorkshopPage.tsx`, `ArrivalPage.tsx`, `BuildPage.tsx`, `TestPage.tsx`, `ReactionPage.tsx`, `CataloguePage.tsx`, `src/routes.tsx`, `src/components/ui/CustomerHeroCard.tsx`, `Fingerprint.tsx`, `SensorGrid.tsx`, `PartChip.tsx`.

**Notes:**
- ArrivalPage shows a placeholder customer (named circle), German request quote, "OK, los geht's!" CTA. Uses `motion` for the tube-drop entry.
- BuildPage embeds `OrbitStage` and the "Dein Bau" card. Picks update in real time; Fingerprint preview re-renders.
- TestPage swaps `OrbitStage` for `TestStage`. The particle burst plays for 3 seconds. During play, the SensorGrid fills its dots over the same 3 seconds via a single `setInterval` driven by React state. After the burst, advance fires automatically. Reduced-motion: skip the burst, fill dots instantly.
- ReactionPage shows the resolved tier in big Fraunces type, the customer hero card with a German one-liner, a "+1 Teil entdeckt" card *if* the round was a delight that triggers an unlock, and a catalogue-entry preview. "Weiter" button writes the entry to `useGameState` and routes back to Workshop.
- CataloguePage in Phase 1 is a simple grid of placeholder cards (no flipbook). German chip filters render but only "Alle" is wired.

**Verify:** Manual playtest: full round runs, entry persists across tab refresh, unlocking magnet glove (Sir Crunch delight) updates the unlocked-parts list and a subsequent round shows it in the orbit.

### M10 · Reduced-motion check + smoke test + cleanup

**Goal:** Ship a clean Phase 1.
**Files:** `src/App.test.tsx`, small `prefers-reduced-motion` audit across Pixi + motion components, README update with "How to play."

**Notes:** Mirror BeyArena's smoke test pattern. Confirm that with `matchMedia` mocked to `(prefers-reduced-motion: reduce)`, the test still mounts without throwing (Pixi animations short-circuit, `motion` honors it natively). Tag the commit `phase-1-spike`.

**Verify:** `npm run test:run` green; `npm run build` green; manual playtest one more time.

## Sample German UI copy (first-grader vocabulary, `du` form)

These are placeholders for Phase 1 and will be retuned in Phase 2 with finished customers.

- Workshop arrival eyebrow: "Pip ist da."
- Build CTA: "Los, bau es!"
- Test action: "Feuer frei!"
- Reaction tiers: "Volle Freude!" / "Passt!" / "Hmm, geht so." / "Oje, nochmal!"
- Catalogue header: "Deine Sammlung"
- Empty-state: "Bau dein erstes Ding."

## Testing approach

**Unit tests (Vitest):**
- `composition.test.ts`: trait sum, cap at 3, integration with `compose`.
- `satisfaction.test.ts`: all four tier outcomes, forbidden-trait short-circuit.
- `dailyRotation.test.ts`: known dates → known visitors, week wrap, pre-epoch defensive case.
- `storage.test.ts`: round-trip, malformed blob → default save, schema-version mismatch → default save.

**Component tests:** one smoke render in `App.test.tsx`. No screen snapshots; visuals will churn in Phase 2 and snapshots become noise.

**Manual playtest (validation gate):** Marc runs through one round, verifies (1) the customer's wants visibly drive the tier outcome, (2) refresh preserves the catalogue, (3) Sir Crunch's first delight unlocks the magnet glove and it appears in the orbit on the next round, (4) `prefers-reduced-motion: reduce` skips the particle burst.

**No E2E and no Pixi-specific test runner** in Phase 1. The pure-logic layer is what Phase 1 bugs hide in; the visual layer will be redone in Phase 2 anyway.

## Phase 1 done when...

- [ ] `npm run dev` starts cleanly, no console errors, no TypeScript errors.
- [ ] `npm run build` succeeds (`tsc -b && vite build`).
- [ ] `npm run lint` passes.
- [ ] `npm run test:run` green with at least 8 unit tests across the four pure modules + 1 smoke render.
- [ ] One full round playable end-to-end with placeholder art.
- [ ] Catalogue entry persists across tab close/reopen (manual check).
- [ ] At least one unlock condition demonstrably fires (Sir Crunch delight → Magnet glove).
- [ ] Daily-rotation logic tested but not displayed (no Daily screen yet).
- [ ] `prefers-reduced-motion: reduce` short-circuits the test-burst animation.
- [ ] German placeholder copy reads OK to a German speaker (no `Sie`, no jargon).
- [ ] Phase 1 spike committed and tagged.

## Open architectural decisions for Marc to weigh in on

1. **State management.** Plan picks `useReducer + Context` for Phase 1 over BeyArena's Zustand. Rationale: minimal cross-route state, lighter surface area, easy migration to Zustand at Phase 2 if multi-store needs emerge. **Alternative:** adopt Zustand on day one for consistency with BeyArena. Cost: ~1-2 hours, slightly heavier but matches existing muscle memory.

2. **Phone shell wrapper.** Plan keeps the `390 x 820` `PhoneShell` wrapper in Phase 1 for visual parity with the wireframe. **Alternative:** go full-bleed responsive immediately. Trade-off: full-bleed forces breakpoint thinking earlier; phone-shell delays it.

3. **Routing.** Plan uses React Router v6 with distinct paths per screen (`/build`, `/test`, ...). **Alternative:** single-route phase machine where the URL doesn't change. Trade-off: distinct paths give back-button + dev navigation; phase machine is simpler but loses URL scaffolding.

## Deferred to Phase 2

Finished customer art (6 customers with proper SVG portraits), 12 finished part SVGs with behavior-verb animations, the Flipbook Catalogue (two-page spread + filters wired), the Daily Special "Moonling Week" screen, sound (chime, swoosh, ka-thunk SFX), tab bar wiring across screens, screen-shake polish for the big-explosion variant, polish on chips/buttons. Louis playtests at the end of Phase 2.

## Deferred to Phase 3

iOS HIG full polish pass (44pt tap targets audit, 56-64pt buttons everywhere, safe-area insets, haptics where supported, VoiceOver labels), PWA manifest + iOS Add-to-Home-Screen guidance, onboarding (silent guided first round, no tutorial walls), watercolor/ink alt palettes via `data-art="..."` switching, performance profile on a real Fire tablet. Watercolor and ink palettes can defer further if time slips. Cloud save / Supabase migration is post-MVP and not on Phase 3.
