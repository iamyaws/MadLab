import type { Tier } from '../lib/types';

/**
 * Per-tier quote bag for a single customer. Each tier holds 2-3 candidate
 * lines so the same customer doesn't repeat the same reaction across rounds.
 *
 * All quotes use `du`-form, first-grader vocabulary, no abstract verbs,
 * and stay under 80 characters (most under 60). They are written in
 * character: Pip cozies, Bo cheers his Goldfisch, Sir Knirps shouts about
 * Quietschen, Oma is calm and warm, Twig is forest-soft, Kit is mischief.
 */
export type ReactionQuoteSet = Record<Tier, string[]>;

/**
 * Reaction quotes for the 6 regular customers. Daily-special visitors and
 * any not-yet-named id fall back to `DEFAULT_REACTION_QUOTES`. M17 will fill
 * in entries for the 7 daily visitors as their themed weeks ship.
 */
export const REACTION_QUOTES: Record<string, ReactionQuoteSet> = {
  pip: {
    delight: [
      'das knuddelt fester als meine Oma!',
      'ich will hier nie mehr aufstehen.',
      'weich, weich, weich!',
    ],
    satisfied: [
      'passt!',
      'gemütlich, danke.',
      'gut so.',
    ],
    sortOf: [
      'hmm, fast.',
      'geht so.',
      'naja, ein bisschen.',
    ],
    fail: [
      'oh nein, das kratzt!',
      'lieber nochmal.',
      'autsch, das ist hart.',
    ],
  },
  bo: {
    delight: [
      'mein Goldfisch tanzt schon!',
      'wow! wow! wow!',
      'er hüpft im Glas!',
    ],
    satisfied: [
      'er guckt jetzt fröhlich.',
      'schwimmt fröhlich!',
      'gut für meinen Fisch.',
    ],
    sortOf: [
      'er gähnt halt.',
      'naja, ein Lächeln.',
      'fast lustig.',
    ],
    fail: [
      'der schläft jetzt erst recht weiter.',
      'öde.',
      'er dreht sich weg.',
    ],
  },
  crunch: {
    delight: [
      'ENDLICH wieder QUIETSCH!',
      'ich klinge wie ein König!',
      'lautes Quietschen, juhu!',
    ],
    satisfied: [
      'ein gutes Quietschen.',
      'das passt, Ritter!',
      'ja, das hört man.',
    ],
    sortOf: [
      'leiser als gehofft.',
      'ein bisschen Quietsch.',
      'okay, ein Mucks.',
    ],
    fail: [
      'das ist KEIN Quietschen.',
      'still wie eine Maus, nein!',
      'wo ist mein Lärm?',
    ],
  },
  oma: {
    delight: [
      'wie früher!',
      'perfekt für meinen Tee.',
      'hach, schön.',
    ],
    satisfied: [
      'oh, das ist nett.',
      'gut gemacht, Kind.',
      'das mag ich.',
    ],
    sortOf: [
      'naja, fast Tee-Zeit.',
      'hmm, geht so.',
      'ein klein wenig.',
    ],
    fail: [
      'mein Tee bleibt kalt.',
      'oje, kein Pfiff.',
      'das hilft mir nicht.',
    ],
  },
  twig: {
    delight: [
      'ahhh, der Wald atmet wieder.',
      'ja. so still. so weich.',
      'die Blätter freuen sich.',
    ],
    satisfied: [
      'leise, danke.',
      'das tut gut.',
      'sanft genug.',
    ],
    sortOf: [
      'fast leise.',
      'noch ein Lufthauch laut.',
      'naja, halb still.',
    ],
    fail: [
      'AAAH zu laut!',
      'nicht so laut bitte!',
      'das tut den Ohren weh.',
    ],
  },
  kit: {
    delight: [
      'die Katze rennt! Mission erfüllt.',
      'buuh! ha!',
      'wuuusch!',
    ],
    satisfied: [
      'die Katze zuckt kurz.',
      'klein erschreckt, gut!',
      'okay, sie schaut!',
    ],
    sortOf: [
      'sie blinzelt nur.',
      'fast erschreckt.',
      'hmm, halb gruselig.',
    ],
    fail: [
      'die Katze schaut nur böse.',
      'miau, langweilig.',
      'nichts passiert.',
    ],
  },
};

/**
 * Default fallback quotes for customers without an explicit set. Phase 2
 * uses these for the 7 daily-special visitors until M17 fills them in;
 * tests assert this fallback fires for unknown ids.
 */
export const DEFAULT_REACTION_QUOTES: ReactionQuoteSet = {
  delight: [
    'super, das liebe ich!',
    'wow, ganz toll!',
    'das ist wunderbar!',
  ],
  satisfied: [
    'das passt gut.',
    'danke, schön.',
    'ja, mag ich.',
  ],
  sortOf: [
    'naja, geht so.',
    'fast.',
    'hmm, ein wenig.',
  ],
  fail: [
    'das ist nichts für mich.',
    'lieber nicht.',
    'oje.',
  ],
};

/**
 * Pick a reaction quote for a customer + tier. When `seed` is provided the
 * pick is deterministic (modulo into the tier's array); otherwise a uniform
 * random index is used. Live consumers omit the seed; tests pass a fixed
 * seed for stable output.
 */
export function pickReactionQuote(
  customerId: string,
  tier: Tier,
  seed?: number,
): string {
  const set = REACTION_QUOTES[customerId] ?? DEFAULT_REACTION_QUOTES;
  const bag = set[tier];
  if (bag.length === 0) {
    // Type guarantees at least one entry per tier in our data, but keep a
    // defensive fallback so a future bad data shape can't crash the UI.
    return DEFAULT_REACTION_QUOTES[tier][0];
  }
  const index =
    typeof seed === 'number'
      ? Math.abs(Math.trunc(seed)) % bag.length
      : Math.floor(Math.random() * bag.length);
  return bag[index];
}
