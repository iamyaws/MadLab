import { describe, it, expect } from 'vitest';
import {
  REACTION_QUOTES,
  DEFAULT_REACTION_QUOTES,
  pickReactionQuote,
} from '../reactionQuotes';
import { CUSTOMERS, REGULAR_CUSTOMER_IDS } from '../customers';
import type { Tier } from '../../lib/types';

const TIERS: Tier[] = ['delight', 'satisfied', 'sortOf', 'fail'];

describe('REACTION_QUOTES', () => {
  it('covers every regular customer id with all four tiers populated', () => {
    expect(REGULAR_CUSTOMER_IDS).toHaveLength(6);
    for (const id of REGULAR_CUSTOMER_IDS) {
      const set = REACTION_QUOTES[id];
      expect(set, `customer "${id}" should have a quote set`).toBeDefined();
      for (const tier of TIERS) {
        expect(
          set[tier],
          `customer "${id}" tier "${tier}" should be defined`,
        ).toBeDefined();
      }
    }
  });

  it('has at least 2 candidate quotes per tier per customer', () => {
    for (const id of REGULAR_CUSTOMER_IDS) {
      for (const tier of TIERS) {
        const bag = REACTION_QUOTES[id][tier];
        expect(
          bag.length,
          `${id}.${tier} needs >=2 variants for replay variety`,
        ).toBeGreaterThanOrEqual(2);
      }
    }
  });

  it('has all customer-id keys also present in CUSTOMERS', () => {
    const valid = new Set(CUSTOMERS.map((c) => c.id));
    for (const id of Object.keys(REACTION_QUOTES)) {
      expect(valid.has(id), `key "${id}" must match a CUSTOMERS entry`).toBe(
        true,
      );
    }
  });

  it('keeps all quotes non-empty and under 80 characters', () => {
    const allQuotes = [
      ...Object.values(REACTION_QUOTES).flatMap((set) =>
        TIERS.flatMap((t) => set[t]),
      ),
      ...TIERS.flatMap((t) => DEFAULT_REACTION_QUOTES[t]),
    ];
    for (const q of allQuotes) {
      expect(q.length, `quote "${q}" must be non-empty`).toBeGreaterThan(0);
      expect(q.length, `quote "${q}" must stay under 80 chars`).toBeLessThan(
        80,
      );
    }
  });

  it('has no em-dashes anywhere (Marc rule)', () => {
    const allQuotes = [
      ...Object.values(REACTION_QUOTES).flatMap((set) =>
        TIERS.flatMap((t) => set[t]),
      ),
      ...TIERS.flatMap((t) => DEFAULT_REACTION_QUOTES[t]),
    ];
    for (const q of allQuotes) {
      expect(q, `quote "${q}" must not contain an em-dash`).not.toContain('—');
    }
  });
});

describe('DEFAULT_REACTION_QUOTES', () => {
  it('covers all four tiers with at least 2 variants', () => {
    for (const tier of TIERS) {
      expect(DEFAULT_REACTION_QUOTES[tier].length).toBeGreaterThanOrEqual(2);
    }
  });
});

describe('pickReactionQuote', () => {
  it('returns the first delight quote for pip when seed=0', () => {
    expect(pickReactionQuote('pip', 'delight', 0)).toBe(
      REACTION_QUOTES.pip.delight[0],
    );
  });

  it('returns the second quote when seed=1 (modulo bag length)', () => {
    const bag = REACTION_QUOTES.bo.satisfied;
    expect(pickReactionQuote('bo', 'satisfied', 1)).toBe(bag[1 % bag.length]);
  });

  it('wraps with modulo when seed exceeds bag length', () => {
    const bag = REACTION_QUOTES.kit.fail;
    expect(pickReactionQuote('kit', 'fail', bag.length + 0)).toBe(bag[0]);
    expect(pickReactionQuote('kit', 'fail', bag.length + 1)).toBe(bag[1]);
  });

  it('handles negative seeds via Math.abs', () => {
    const bag = REACTION_QUOTES.twig.delight;
    expect(pickReactionQuote('twig', 'delight', -1)).toBe(bag[1 % bag.length]);
  });

  it('falls back to DEFAULT_REACTION_QUOTES for unknown customer ids', () => {
    expect(pickReactionQuote('unknown', 'delight', 0)).toBe(
      DEFAULT_REACTION_QUOTES.delight[0],
    );
    expect(pickReactionQuote('moonling', 'fail', 0)).toBe(
      DEFAULT_REACTION_QUOTES.fail[0],
    );
  });

  it('returns one of the candidate strings when seed is omitted', () => {
    const bag = REACTION_QUOTES.oma.satisfied;
    const result = pickReactionQuote('oma', 'satisfied');
    expect(bag).toContain(result);
  });
});
