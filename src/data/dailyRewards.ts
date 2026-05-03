/**
 * Daily-Week reward ladder for Moonling Week (M17).
 *
 * Each themed week is a 7-day arc; the player visits the lab once per day
 * and tomorrow's reward is gated behind today's claim. The first themed
 * week shipped is Moonling's: Day 1-6 alternate sticker / bonus-stars
 * cosmetic-grade rewards, Day 7 climaxes with the legendary Mondstrahl
 * (`moonbeam`) part unlock. The ladder reads kid-friendly: a sticker, a
 * little star bump, a cooler sticker, more stars, a bigger sticker, even
 * more stars, then the legendary part on Day 7.
 *
 * Sticker rewards are metadata only for Phase 2; no UI surface exists for
 * stickers yet (a counter on the player profile lands in Phase 3). The
 * `bonusStars` kind awards the player extra catalogue-counter stars
 * without minting a real catalogue entry; the implementation lives in
 * `DailyPage.tsx` and uses `addCatalogueEntry` with a "star-only"
 * synthetic entry so the counter visibly ticks up. The `partUnlock` kind
 * (Day 7) calls `unlockPart('moonbeam')` directly.
 *
 * Phase 3 will fan out to the other six themed weeks (Käpt'n Haken,
 * Tüftelmaus, Beep, Snorri, Wölkchen, Doc); each gets its own `*_WEEK_REWARDS`
 * export and a `DAILY_WEEK_REWARDS_BY_VISITOR` lookup added at that point.
 */

/**
 * The three reward kinds Phase 2 ships. Stickers are metadata-only
 * (no UI surface yet); bonus stars increment the visible catalogue
 * counter; partUnlock fires a real `unlockPart` dispatch on the
 * legendary moonbeam.
 */
export type DailyRewardKind = 'sticker' | 'bonusStars' | 'partUnlock';

/**
 * One day's reward in a themed week. `dayInWeek` mirrors
 * `DailyWeekState.dayInWeek` (0..6); the payload holds whichever fields
 * the kind needs (sticker id, star count, part id) plus a German
 * label the UI can show without further lookup.
 */
export interface DailyReward {
  dayInWeek: number;
  kind: DailyRewardKind;
  payload: {
    stickerId?: string;
    starCount?: number;
    partId?: string;
    nameDe: string;
  };
}

/**
 * Moonling Week's seven-day reward ladder. Sticker / 2 stars / sticker /
 * 3 stars / sticker / 4 stars / Mondstrahl. Day 7 is the legendary unlock
 * the rest of the week builds toward.
 */
export const MOONLING_WEEK_REWARDS: DailyReward[] = [
  {
    dayInWeek: 0,
    kind: 'sticker',
    payload: { stickerId: 'moon-day-1', nameDe: 'Mond-Sticker' },
  },
  {
    dayInWeek: 1,
    kind: 'bonusStars',
    payload: { starCount: 2, nameDe: '2 Bonus-Sterne' },
  },
  {
    dayInWeek: 2,
    kind: 'sticker',
    payload: { stickerId: 'moon-day-3', nameDe: 'Stern-Sticker' },
  },
  {
    dayInWeek: 3,
    kind: 'bonusStars',
    payload: { starCount: 3, nameDe: '3 Bonus-Sterne' },
  },
  {
    dayInWeek: 4,
    kind: 'sticker',
    payload: { stickerId: 'moon-day-5', nameDe: 'Wolken-Sticker' },
  },
  {
    dayInWeek: 5,
    kind: 'bonusStars',
    payload: { starCount: 4, nameDe: '4 Bonus-Sterne' },
  },
  {
    dayInWeek: 6,
    kind: 'partUnlock',
    payload: { partId: 'moonbeam', nameDe: 'Mondstrahl (legendär)' },
  },
];

/**
 * Look up the reward for a given dayInWeek (0..6). Returns `undefined`
 * for out-of-range indices so the UI can render a neutral fallback
 * instead of crashing on bad input.
 */
export function getRewardForDay(dayInWeek: number): DailyReward | undefined {
  return MOONLING_WEEK_REWARDS.find((r) => r.dayInWeek === dayInWeek);
}
