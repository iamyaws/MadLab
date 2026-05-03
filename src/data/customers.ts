import type { Customer } from '../lib/types';

/**
 * Phase-1 placeholder customer roster: 3 of the eventual 6 regulars.
 *
 * The full 6-customer roster (adding Oma, Twig, Kit) lands in Phase 2.
 * Phase 1 keeps the smallest set that still exercises every wants pattern
 * the trait fingerprint needs to score:
 *
 * - Pip       Cozy + Fun
 * - Bo        Fun + Zappy   (unlocks Fernrohr on first delight)
 * - Sir Knirps Boom + Zappy (unlocks Magnethandschuh on first delight)
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
];

/**
 * Lookup helper. Returns undefined when the id is unknown so callers can
 * decide how to handle a missing customer (typically a fresh save where the
 * id was persisted before the customer was removed).
 */
export function getCustomerById(id: string): Customer | undefined {
  return CUSTOMERS.find((c) => c.id === id);
}
