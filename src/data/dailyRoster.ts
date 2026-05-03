import type { Customer } from '../lib/types';

/**
 * The 7 daily-special visitors. Each anchors a 7-day themed week; the order
 * below is the rotation order consumed by `lib/dailyRotation.ts` (M6).
 *
 * Daily visitors share the `Customer` shape. Moonling (the M17 themed week)
 * has its full `wants` + `forbidden` fingerprint populated so the round
 * resolves cleanly when the player taps "Mondling helfen". The other six
 * keep `[]` placeholders for now; their themed weeks ship in Phase 3+ and
 * will tune their fingerprints alongside their reward ladders.
 *
 * Moonling design: cozy + fun reads as gentle, sleepy, "let the sun set
 * softly". Forbidding `boom` means explosive contraptions wake him up and
 * fail the round. With these wants the satisfaction tier resolves through
 * the standard `resolveTier` rules, so Day 7's Moonbeam unlock fires when
 * the player builds a cozy + fun contraption with no boom-leaning parts.
 */
export const DAILY_VISITORS: Customer[] = [
  {
    id: 'moonling',
    nameDe: 'Mondling',
    requestDe: 'bring mich heim, bevor die Sonne untergeht',
    wants: ['cozy', 'fun'],
    forbidden: ['boom'],
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
