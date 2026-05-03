import { describe, it, expect } from 'vitest';
import { resolveTier } from '../satisfaction';
import type { Customer, Tier, TraitScores } from '../types';

/** Build a TraitScores quickly without naming every key inline. */
function scores(partial: Partial<TraitScores>): TraitScores {
  return { fun: 0, zappy: 0, cozy: 0, boom: 0, ...partial };
}

/** Build a fixture Customer with the wants and forbidden traits we need. */
function customer(overrides: Partial<Customer> = {}): Customer {
  return {
    id: 'fixture',
    nameDe: 'Fixture',
    requestDe: 'test',
    wants: [],
    forbidden: [],
    visualKind: 'creature',
    ...overrides,
  };
}

describe('resolveTier', () => {
  it("returns 'fail' when a forbidden trait fires, regardless of wants", () => {
    const c = customer({ wants: ['fun', 'cozy'], forbidden: ['boom'] });
    // wants are fully met, but boom > 0 must short-circuit to fail.
    const s = scores({ fun: 3, cozy: 3, boom: 1 });
    expect(resolveTier(s, c)).toBe<Tier>('fail');
  });

  it("returns 'delight' when all wanted traits are >= 2 and no forbidden fires", () => {
    const c = customer({ wants: ['fun', 'cozy'], forbidden: ['boom'] });
    const s = scores({ fun: 2, cozy: 3 });
    expect(resolveTier(s, c)).toBe<Tier>('delight');
  });

  it("returns 'satisfied' when all wanted traits are exactly 1 and no forbidden fires", () => {
    const c = customer({ wants: ['fun', 'cozy'], forbidden: ['boom'] });
    const s = scores({ fun: 1, cozy: 1 });
    expect(resolveTier(s, c)).toBe<Tier>('satisfied');
  });

  it("returns 'sortOf' when only one of two wanted traits is at >= 1 and no forbidden fires", () => {
    const c = customer({ wants: ['fun', 'cozy'], forbidden: ['boom'] });
    const s = scores({ fun: 2, cozy: 0 });
    expect(resolveTier(s, c)).toBe<Tier>('sortOf');
  });

  it("returns 'fail' when zero wanted traits hit and no forbidden fires", () => {
    const c = customer({ wants: ['fun', 'cozy'], forbidden: ['boom'] });
    const s = scores({ zappy: 3 });
    expect(resolveTier(s, c)).toBe<Tier>('fail');
  });

  it("returns 'satisfied' when wants and forbidden are both empty (daily-roster placeholder)", () => {
    const c = customer({ wants: [], forbidden: [] });
    const s = scores({ fun: 0, cozy: 0, zappy: 0, boom: 0 });
    expect(resolveTier(s, c)).toBe<Tier>('satisfied');
  });

  it("returns 'fail' when wants is empty but a forbidden fires", () => {
    const c = customer({ wants: [], forbidden: ['boom'] });
    const s = scores({ boom: 1 });
    expect(resolveTier(s, c)).toBe<Tier>('fail');
  });

  // Table-driven sweep so future readers see the rule shape at a glance.
  const cases: Array<{
    name: string;
    wants: Customer['wants'];
    forbidden: Customer['forbidden'];
    s: TraitScores;
    expected: Tier;
  }> = [
    {
      name: 'three wants all at 2 with one forbidden silent',
      wants: ['fun', 'cozy', 'zappy'],
      forbidden: ['boom'],
      s: scores({ fun: 2, cozy: 2, zappy: 2 }),
      expected: 'delight',
    },
    {
      name: 'three wants, one at 0, one forbidden silent',
      wants: ['fun', 'cozy', 'zappy'],
      forbidden: ['boom'],
      s: scores({ fun: 2, cozy: 2, zappy: 0 }),
      expected: 'sortOf',
    },
    {
      name: 'wantsHigh wins even when forbidden array is empty',
      wants: ['boom'],
      forbidden: [],
      s: scores({ boom: 3 }),
      expected: 'delight',
    },
    {
      name: 'a single want at 1 with empty forbidden settles at satisfied',
      wants: ['boom'],
      forbidden: [],
      s: scores({ boom: 1 }),
      expected: 'satisfied',
    },
  ];

  it.each(cases)('table case: $name resolves to $expected', ({ wants, forbidden, s, expected }) => {
    expect(resolveTier(s, customer({ wants, forbidden }))).toBe(expected);
  });
});
