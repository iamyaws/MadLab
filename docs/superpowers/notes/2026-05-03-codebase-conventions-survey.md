# Codebase Conventions Survey · BeyArena + Ronki

**Date:** 2026-05-03
**Purpose:** Reference doc for Mad Inventor Lab's tooling decisions. Survey of Marc's two existing PWAs to identify patterns worth mirroring and patterns worth diverging from.

## Quick comparison table

| Aspect | BeyArena | Ronki (louis-quest) |
|---|---|---|
| Package manager | npm (package-lock.json) | npm (package-lock.json) |
| Vite version | 5.4.11 | 5.4.19 |
| TypeScript | 5.6.3 (strict mode) | 6.0.2 (strict mode, relaxed linting) |
| Build approach | `tsc -b && vite build` | `vite build` (no pre-type-check) |
| State management | Zustand (with persist middleware) | React Context (Game/Task/Auth) |
| Testing | Vitest + @testing-library/react | Vitest + @testing-library/react |
| PWA | vite-plugin-pwa (Workbox) | Hand-written sw.js with build-id stamping |
| Component files | `.tsx` (TypeScript) | `.jsx` (JavaScript, mixed) |
| Component export | Named (`export function`) | Default (`export default function`) |
| Tailwind version | 3.4.19 | 4.2.2 (`@tailwindcss/vite`) |
| ESLint / Prettier | Configured (separate) | Not configured |
| Tailwind config | `tailwind.config.ts` | (none, uses v4 vite plugin) |

## BeyArena deep-dive

### Build + tooling

- `"build": "tsc -b && vite build"` runs TypeScript check before bundling. Catches type errors early.
- Vite 5.4.11 with React plugin; no custom alias setup visible.
- TypeScript strict mode; `noUnusedLocals` and `noUnusedParameters` enabled in `tsconfig.app.json`.
- ESLint extends `eslint:recommended`, `@typescript-eslint/recommended`, `react-hooks/recommended`. Prettier separate.

### PWA setup

- `vite-plugin-pwa` with Workbox.
- `registerType: 'autoUpdate'`, `skipWaiting`, `clientsClaim` for instant deploys.
- NetworkFirst caching for Supabase API (5-second timeout).
- SVG icons only.

### Styling

- Tailwind 3.4.19, custom theme:
  - Colors: BX palette (bx-yellow, bx-crimson, bx-cobalt, bx-ink shades)
  - Fonts: display (Saira Stencil One), body (Inter Tight), mono (JetBrains Mono)
  - Animations: bx-spin, bx-pulse, bx-sweep
- Fonts loaded via Google Fonts in `index.html`.

### Directory structure

- `src/components/` organized by feature: `auth/`, `battle/`, `bey/`, `nav/`, `profile/`, `tower/`, `ui/`. Domain-driven.
- `src/stores/` for Zustand stores.
- `src/hooks/` for custom hooks.
- `src/lib/` for pure utilities and types.
- `src/pages/` for route-level components.
- `src/test/setup.ts` minimal (jest-dom matchers).

### Code conventions

- Named exports (`export function ComponentName`).
- One component per file, PascalCase.tsx.
- Standard import ordering.
- Zustand stores: `export const useStore = create<T>()(persist(...))`.

### State

- Zustand + persist middleware (session under `beystadium-session`).
- React Query (`@tanstack/react-query`) for server state.

### Testing

- Vitest + jsdom.
- `@testing-library/react`.
- `setup.ts` imports jest-dom matchers.
- Vitest UI enabled.

### Scripts

- `dev` → `vite`
- `build` → `tsc -b && vite build`
- `preview` → `vite preview`
- `test` → `vitest`
- `test:run` → `vitest run`
- `lint` → `eslint src tests --ext .ts,.tsx`
- `format` → `prettier --write src tests`
- `types:supabase` → generate from Supabase schema

## Ronki (louis-quest) deep-dive

### Build + tooling

- Vite 5.4.19; **no separate type-check step** (relies on Vite). Faster iteration but types not validated until build.
- TypeScript 6.0.2 strict, but `noUnusedLocals` and `noUnusedParameters` disabled.
- No ESLint or Prettier configured.
- Has a separate `website/` subdirectory with its own Vite config.

### PWA setup

- Hand-written `sw.js` instead of vite-plugin-pwa.
- Custom Vite plugin `stampServiceWorkerBuildId` injects unique build ID into CACHE_NAME at build time.
- Comment in plugin source: "Without this, the hand-written SW's cache name only changes when a developer remembers to bump it — and twice this sprint that led to users stuck on stale cache."

### Styling

- Tailwind 4.2.2 with `@tailwindcss/vite` plugin (no `tailwind.config.ts`).
- Defaults integrated directly into Vite pipeline.

### Directory structure

- `src/arcs/`, `src/companion/`, `src/dream/` for game-logic domains.
- `src/components/` with `drachennest/`, `onboarding/` subdirs.
- `src/context/` for React Context (Auth, Game, Task, CelebrationQueue, LanguageContext, i18n).
- `src/hooks/`, `src/lib/`, `src/pages/`, `src/data/`, `src/utils/`, `src/types/`, `src/test/`.
- Component files are `.jsx` (JavaScript), not `.tsx`. Gradual TypeScript adoption (`allowJs: true`, `checkJs: false`).

### Code conventions

- Default exports (`export default function ComponentName()`).
- PascalCase filenames.

### State

- React Context API only (Game/Task/Auth/CelebrationQueue/Language). No Zustand or Redux.

### Testing

- Vitest + jsdom + globals.
- `@testing-library/react`, `@testing-library/user-event`.
- Sample test (`game-mechanics.test.js`) tests game balance constants (level thresholds, XP, reward boundaries).

### Scripts

- `dev`, `build`, `preview`, `test`, `test:watch`.
- `dev:web` / `build:web` / `preview:web` / `test:web` for the website subdirectory.

## Recommendations for Mad Inventor Lab

### Adopt these (mostly BeyArena patterns)

1. **npm + BeyArena script names** (`dev`, `build`, `preview`, `test`, `test:run`, `lint`, `format`).
2. **Vite 5.4.x.** Use BeyArena's two-step `tsc -b && vite build` for type safety at build time.
3. **TypeScript strict mode** with `noUnusedLocals: true` and `noUnusedParameters: true`. Catches dead code from day one.
4. **Tailwind 3.4.x with `tailwind.config.ts`.** Define cel-shaded palette tokens there.
5. **Fonts via Google Fonts in `index.html`** (Fraunces / Nunito / Caveat).
6. **Directory structure: feature-domain folders** under `src/components/` (e.g., `ui/`, `customer/`, `parts/`, `lab/`). Plus `src/hooks/`, `src/lib/`, `src/pages/`, `src/data/`, `src/test/`.
7. **Named exports**, one component per file, PascalCase.tsx.
8. **Vitest + jsdom + @testing-library/react.** Setup in `src/test/setup.ts`.
9. **ESLint + Prettier** configured (BeyArena style). Keep code consistent.

### Diverge here

1. **State management: useReducer + Context for Phase 1.** Don't adopt Zustand on day one. Rationale: Mad Inventor Lab Phase 1 has minimal cross-route state. Migration to Zustand is straightforward at Phase 2 boundary if needed. (Marc may want to override this and adopt Zustand for consistency with BeyArena. Open decision.)
2. **No React Query.** No backend in MVP, so no server state to manage.
3. **TypeScript-only.** No `.jsx` files. Don't replicate Ronki's mixed JS/TS approach.
4. **Add `src/pixi/` directory.** New pattern for this project: PixiJS components live separately from React UI components. Neither BeyArena nor Ronki has this.
5. **PWA setup deferred to Phase 3.** Use BeyArena's `vite-plugin-pwa` when we add it (simpler than Ronki's hand-written approach).
6. **No Supabase types script.** No backend in MVP.

### Open decisions Marc should weigh in on

- **Zustand on day one or wait?** Plan picks "wait." Cost of switching later: 1-2 hours.
- **Path aliases in tsconfig?** Neither project uses them prominently. Phase 1 can skip; revisit if imports get noisy.
- **Test file location: co-located vs. `__tests__/`?** BeyArena's pattern is unclear from the survey. Plan picks `src/lib/__tests__/` for the pure-logic tests; `*.test.tsx` co-located for component tests. Easy to change.
