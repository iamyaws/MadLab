# MadLab · Mad Inventor Lab

A browser-first PWA where the player runs a tiny mad inventor's workshop. Customers arrive via a pneumatic tube with weird requests, the player picks 4 parts from a 3D-tilted orbit, the contraption auto-builds inside a glass-dome test chamber, and a sensor grid scores the invention on Fun, Zappy, Cozy, and Boom.

**Status:** Phase 1 spike complete. End-to-end loop runs on placeholder art; tagged `phase-1-spike`.

**Read first:** [Design spec](./docs/superpowers/specs/2026-05-03-mad-inventor-lab-design.md) · [Phase 1 plan](./docs/superpowers/plans/2026-05-03-phase-1-spike-plan.md)

**Audience:** ages 6-9, hard test at the 6-7 end. Universal vocabulary, no reading required.

**Stack:** Vite + React 19 + TypeScript + Tailwind + PixiJS + motion. PWA-ready, browser-first, German-first kid-facing copy.

## How to play

1. Open the Werkstatt (workshop). A customer drops in through the tube with a request like "build me something cozy that whistles".
2. Tap 4 parts on the orbit. The live trait fingerprint at the bottom previews how the contraption is shaping up across Spaß, Zapp, Kuschel, and Bumm.
3. Tap "Feuer frei!" to fire the test chamber. Sparks fly, sensors light up, and the customer reacts on one of four tiers (Volle Freude / Passt / Hmm, geht so / Oje, nochmal).
4. The invention saves to your Sammlung (catalogue). A "Volle Freude" reaction can also unlock a new part for future builds.
5. Refresh the tab; your catalogue and unlocked parts persist via localStorage.

Phase 1 is a placeholder spike. Finished customer art, the Flipbook catalogue, sound, and the Daily Special weekly visitor are Phase 2 work.

## Run locally

Requires Node 20+. From the repo root:

```bash
npm install
npm run dev          # Vite dev server on localhost:5173
npm run test:run     # Vitest run (logic + smoke render)
npm run lint         # ESLint, must pass before commit
npm run build        # tsc -b && vite build
```

## Build phases

1. **Phase 1 (week 1-2):** Core loop spike with placeholder art. **Done.**
2. **Phase 2 (week 3-4):** Content fill, finished customer + part SVGs, Flipbook, Daily Special, sound, Louis playtests.
3. **Phase 3 (week 5-6):** iOS HIG polish, PWA manifest, ship to public URL.

See spec for full phase breakdown.
