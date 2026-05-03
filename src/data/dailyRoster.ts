import type { Customer } from '../lib/types';

/**
 * The 7 daily-special visitors. Each anchors a 7-day themed week; the order
 * below is the rotation order consumed by `lib/dailyRotation.ts` (M6).
 *
 * Phase 1 does not render these. The list is needed now so the rotation
 * logic can be tested before Phase 2 builds the Daily Special screen.
 *
 * Daily visitors share the `Customer` shape but their `wants` and
 * `forbidden` fingerprints are tuned in Phase 2 once the themed-week reward
 * arcs are designed; `[]` for Phase 1.
 */
export const DAILY_VISITORS: Customer[] = [
  {
    id: 'moonling',
    nameDe: 'Mondling',
    requestDe: 'bring mich heim, bevor die Sonne untergeht',
    wants: [],
    forbidden: [],
    visualKind: 'moonling',
  },
  {
    id: 'hooks',
    nameDe: "Käpt'n Haken",
    requestDe: 'ich hab meine Schatzkarte verlegt',
    wants: [],
    forbidden: [],
    visualKind: 'creature',
  },
  {
    id: 'tinker',
    nameDe: 'Tüftelmaus',
    requestDe: 'zieh mich für immer auf',
    wants: [],
    forbidden: [],
    visualKind: 'creature',
  },
  {
    id: 'beep',
    nameDe: 'Beep',
    requestDe: 'schick das hier zu einem Planeten, den ich vergessen hab',
    wants: [],
    forbidden: [],
    visualKind: 'creature',
  },
  {
    id: 'snorri',
    nameDe: 'Snorri',
    requestDe: 'weck mich ganz sanft auf, bitte',
    wants: [],
    forbidden: [],
    visualKind: 'creature',
  },
  {
    id: 'whisp',
    nameDe: 'Wölkchen',
    requestDe: 'trag mich, ohne mich fallen zu lassen',
    wants: [],
    forbidden: [],
    visualKind: 'creature',
  },
  {
    id: 'doc',
    nameDe: 'Doc',
    requestDe: 'repariere, was ich nicht hingekriegt hab',
    wants: [],
    forbidden: [],
    visualKind: 'creature',
  },
];
