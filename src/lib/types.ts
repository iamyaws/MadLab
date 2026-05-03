/**
 * Domain types for Mad Inventor Lab.
 *
 * The kid-product domain is small: a Customer arrives with a request, the
 * player picks Parts whose contributions sum into a TraitScores fingerprint,
 * a Tier resolves from how that fingerprint matches the customer's wants,
 * and the resulting Invention persists into the catalogue.
 *
 * No I/O lives in this file. Pure type definitions only.
 */

/**
 * The four trait axes every Part contributes to and every Customer's
 * fingerprint is measured against. Matches the wireframe's sensor row
 * (Fun / Zappy / Cozy / Boom).
 */
export type Trait = 'fun' | 'zappy' | 'cozy' | 'boom';

/**
 * The summed contribution of a build's parts across all four traits.
 * Each axis runs 0 to 3, capped at 3 even if more parts contribute.
 */
export type TraitScores = Record<Trait, number>;

/**
 * Customer reaction tier. Drives the celebration animation, the star reward,
 * and whether an unlock fires on this round.
 *
 * - 'delight'   all wanted traits >= 2, no forbidden present
 * - 'satisfied' all wanted traits >= 1, no forbidden present
 * - 'sortOf'    at least one wanted trait >= 1, no forbidden present
 * - 'fail'      forbidden trait fired, or no wanted trait at all
 */
export type Tier = 'delight' | 'satisfied' | 'sortOf' | 'fail';

/**
 * The animation verb a Part plays during the test reveal. Each verb keys
 * a Pixi-side animation (cog spins, spring bounces, magnet attracts, etc).
 */
export type BehaviorVerb =
  | 'spin'
  | 'bounce'
  | 'spark'
  | 'puff'
  | 'chime'
  | 'wobble'
  | 'soft'
  | 'flutter'
  | 'glow'
  | 'attract'
  | 'watch'
  | 'zoom';

/**
 * Loose taxonomy used for catalogue filters and orbit grouping. Every Part
 * belongs to exactly one category.
 */
export type PartCategory = 'mechanical' | 'energy' | 'sensory' | 'material';

/**
 * Visual identity for a Customer. Drives portrait selection in
 * CustomerHeroCard. The 'creature' bucket is a generic fallback used by most
 * daily-special visitors until they get bespoke portraits.
 */
export type CustomerVisualKind =
  | 'pip'
  | 'kid'
  | 'crunch'
  | 'oma'
  | 'twig'
  | 'kit'
  | 'moonling'
  | 'creature';

/**
 * A single buildable Part. Players pick four of these per round and the
 * sum of their `contributes` becomes the build's TraitScores.
 *
 * `unlock` is undefined for the 9 starter parts. The 3 unlock-pool parts
 * carry an unlock condition tying them to a customer's first 'delight'.
 */
export interface Part {
  id: string;
  labelDe: string;
  behaviorVerb: BehaviorVerb;
  contributes: Partial<TraitScores>;
  category: PartCategory;
  unlock?: { customerId: string; tier: 'delight' };
}

/**
 * A Customer that arrives in the workshop with a request. `wants` and
 * `forbidden` define the trait fingerprint the player is matching against.
 * `requestDe` is the kid-readable German quote shown in the hero card.
 */
export interface Customer {
  id: string;
  nameDe: string;
  requestDe: string;
  wants: Trait[];
  forbidden: Trait[];
  visualKind: CustomerVisualKind;
}

/**
 * One completed round's resolved data: the four parts, the customer it was
 * built for, the summed scores, the tier, and a creation timestamp.
 *
 * Constructed by the pure `compose()` function in `lib/composition.ts`.
 */
export interface Invention {
  parts: Part[];
  customerId: string;
  traitScores: TraitScores;
  tier: Tier;
  createdAt: number;
}

/**
 * An Invention that has been written to the catalogue, gaining a stable
 * `id` for routing and a kid-given `nameDe` for display.
 */
export interface CatalogueEntry extends Invention {
  id: string;
  nameDe: string;
}

/**
 * The schema-versioned localStorage save shape. Stored under one key
 * (`mil:save:v1`). `migrate()` in `lib/storage.ts` is the only path that
 * reads anything else.
 */
export interface SaveStateV1 {
  schemaVersion: 1;
  catalogue: CatalogueEntry[];
  unlockedPartIds: string[];
  lastDailySeed: string | null;
}
