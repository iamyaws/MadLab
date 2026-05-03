import type { Customer, Tier, Trait, TraitScores } from './types';

/**
 * Resolve a customer's reaction tier from a build's TraitScores fingerprint.
 *
 * Rule order:
 * 1. Any forbidden trait fires (score > 0): short-circuit to 'fail'.
 * 2. Wants is empty (no forbidden fired): 'satisfied'. See edge-case note below.
 * 3. All wanted traits at level 2 or higher: 'delight'.
 * 4. All wanted traits at level 1 or higher: 'satisfied'.
 * 5. At least one wanted trait at level 1 or higher: 'sortOf'.
 * 6. Otherwise: 'fail'.
 *
 * Edge case: when `customer.wants` is empty, the standard "every wanted trait
 * at level N" predicates would trivially pass via `Array.prototype.every` on
 * an empty array, which would land an empty-wants customer at 'delight'.
 * That is wrong for the daily-roster placeholder shape, where wants stay
 * empty until a visitor's request is finalized; the build was not actually
 * targeting anything, so 'satisfied' (a neutral pass) is the right floor.
 * We special-case empty wants to return 'satisfied' instead of 'delight'.
 * If a forbidden still fires, step 1 wins regardless.
 */
export function resolveTier(scores: TraitScores, customer: Customer): Tier {
  const forbiddenFires = customer.forbidden.some((t: Trait) => scores[t] > 0);
  if (forbiddenFires) return 'fail';

  if (customer.wants.length === 0) return 'satisfied';

  const wantsHigh = customer.wants.every((t: Trait) => scores[t] >= 2);
  const wantsAny = customer.wants.every((t: Trait) => scores[t] >= 1);
  const wantsAtLeastOne = customer.wants.some((t: Trait) => scores[t] >= 1);

  if (wantsHigh) return 'delight';
  if (wantsAny) return 'satisfied';
  if (wantsAtLeastOne) return 'sortOf';
  return 'fail';
}
