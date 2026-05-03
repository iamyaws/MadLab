import type { Part } from '../lib/types';

/**
 * The 12-part Phase-1 roster. Trait contributions match the spec balance
 * table at `docs/superpowers/specs/2026-05-03-mad-inventor-lab-design.md`.
 *
 * Parts 1-9 are visible from the first round. Parts 10-12 are unlock-pool
 * entries gated behind a customer's first 'delight':
 * - magnet  Sir Knirps (crunch) first delight
 * - eye     Kit first delight
 * - scope   Bo first delight
 *
 * `STARTER_PART_IDS` below seeds `unlockedPartIds` in a default save.
 */
export const PARTS: Part[] = [
  {
    id: 'cog',
    labelDe: 'Zahnrad',
    behaviorVerb: 'spin',
    contributes: { zappy: 1 },
    category: 'mechanical',
  },
  {
    id: 'spring',
    labelDe: 'Sprungfeder',
    behaviorVerb: 'bounce',
    contributes: { fun: 1, zappy: 1 },
    category: 'mechanical',
  },
  {
    id: 'bolt',
    labelDe: 'Blitzbolzen',
    behaviorVerb: 'spark',
    contributes: { zappy: 1, boom: 1 },
    category: 'mechanical',
  },
  {
    id: 'beaker',
    labelDe: 'Becher',
    behaviorVerb: 'puff',
    contributes: { boom: 1 },
    category: 'energy',
  },
  {
    id: 'bell',
    labelDe: 'Glöckchen',
    behaviorVerb: 'chime',
    contributes: { fun: 1, cozy: 1 },
    category: 'sensory',
  },
  {
    id: 'jelly',
    labelDe: 'Wackelpudding',
    behaviorVerb: 'wobble',
    contributes: { fun: 1, cozy: 1 },
    category: 'material',
  },
  {
    id: 'sock',
    labelDe: 'Socke',
    behaviorVerb: 'soft',
    contributes: { cozy: 2 },
    category: 'material',
  },
  {
    id: 'feather',
    labelDe: 'Feder',
    behaviorVerb: 'flutter',
    contributes: { cozy: 1, fun: 1 },
    category: 'material',
  },
  {
    id: 'cloud',
    labelDe: 'Wölkchen',
    behaviorVerb: 'glow',
    contributes: { cozy: 1, zappy: 1 },
    category: 'sensory',
  },
  {
    id: 'magnet',
    labelDe: 'Magnethandschuh',
    behaviorVerb: 'attract',
    contributes: { zappy: 1, boom: 1 },
    category: 'mechanical',
    unlock: { customerId: 'crunch', tier: 'delight' },
  },
  {
    id: 'eye',
    labelDe: 'Auge',
    behaviorVerb: 'watch',
    contributes: { fun: 1, boom: 1 },
    category: 'sensory',
    unlock: { customerId: 'kit', tier: 'delight' },
  },
  {
    id: 'scope',
    labelDe: 'Fernrohr',
    behaviorVerb: 'zoom',
    contributes: { zappy: 1, fun: 1 },
    category: 'sensory',
    unlock: { customerId: 'bo', tier: 'delight' },
  },
];

/**
 * IDs of the 9 starter parts visible from the first round. `storage.ts`
 * uses this to seed `unlockedPartIds` when a fresh save is created.
 */
export const STARTER_PART_IDS: string[] = [
  'cog',
  'spring',
  'bolt',
  'beaker',
  'bell',
  'jelly',
  'sock',
  'feather',
  'cloud',
];
