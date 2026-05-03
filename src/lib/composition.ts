import type { Customer, Invention, Part, Trait, TraitScores } from './types';
import { resolveTier } from './satisfaction';

/**
 * Sum each part's `contributes` into a fully-keyed TraitScores object.
 *
 * Every trait axis (fun, zappy, cozy, boom) is present in the result with a
 * default of 0. Each axis is capped at 3 even if the running total would
 * exceed it; this matches the wireframe sensor row's three-dot maximum and
 * keeps the tier rules well-defined.
 */
export function sumTraits(parts: Part[]): TraitScores {
  const out: TraitScores = { fun: 0, zappy: 0, cozy: 0, boom: 0 };
  for (const part of parts) {
    for (const key of Object.keys(part.contributes) as Trait[]) {
      const add = part.contributes[key] ?? 0;
      out[key] = Math.min(3, out[key] + add);
    }
  }
  return out;
}

/**
 * Compose a finished Invention from the picked parts and the active customer.
 *
 * Pure on its inputs except for the `createdAt` timestamp, which uses
 * `Date.now()` at call time (not at module import). The result is the shape
 * the catalogue and reaction screens consume.
 */
export function compose(parts: Part[], customer: Customer): Invention {
  const traitScores = sumTraits(parts);
  const tier = resolveTier(traitScores, customer);
  return {
    parts,
    customerId: customer.id,
    traitScores,
    tier,
    createdAt: Date.now(),
  };
}
