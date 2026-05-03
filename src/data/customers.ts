import type { Customer } from '../lib/types';

/**
 * The 6 regular customers who anchor the core arrival rotation.
 *
 * - Pip       Cozy + Fun
 * - Bo        Fun + Zappy   (unlocks Fernrohr on first delight)
 * - Sir Knirps Boom + Zappy (unlocks Magnethandschuh on first delight)
 * - Oma       Cozy + Zappy
 * - Twig      Cozy, forbidden Boom (the "boom-forbidden" rule lives here)
 * - Kit       Boom + Fun     (unlocks Auge on first delight)
 *
 * All `requestDe` lines use `du`-form, first-grader vocabulary.
 */
export const CUSTOMERS: Customer[] = [
  {
    id: 'pip',
    nameDe: 'Pip',
    requestDe: 'ich brauche einen Stuhl, der mich knuddelt',
    wants: ['cozy', 'fun'],
    forbidden: [],
    visualKind: 'pip',
  },
  {
    id: 'bo',
    nameDe: 'Bo',
    requestDe: 'mein Goldfisch ist gelangweilt. kannst du ihn aufmuntern?',
    wants: ['fun', 'zappy'],
    forbidden: [],
    visualKind: 'kid',
  },
  {
    id: 'crunch',
    nameDe: 'Sir Knirps',
    requestDe: 'ich hab mein Quietschen verloren. bau mir ein neues!',
    wants: ['boom', 'zappy'],
    forbidden: [],
    visualKind: 'crunch',
  },
  {
    id: 'oma',
    nameDe: 'Oma',
    requestDe: 'mach mir was, das pfeift, wenn der Tee fertig ist',
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

/**
 * Stable id list for the regular roster. Useful for callers (rotation,
 * catalogue filters) that need to iterate just the regulars without
 * pulling in the daily-special visitors.
 */
export const REGULAR_CUSTOMER_IDS: string[] = CUSTOMERS.map((c) => c.id);

/**
 * Lookup helper. Returns undefined when the id is unknown so callers can
 * decide how to handle a missing customer (typically a fresh save where the
 * id was persisted before the customer was removed).
 */
export function getCustomerById(id: string): Customer | undefined {
  return CUSTOMERS.find((c) => c.id === id);
}
