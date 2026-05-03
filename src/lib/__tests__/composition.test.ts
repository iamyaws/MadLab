import { describe, it, expect } from 'vitest';
import { compose, sumTraits } from '../composition';
import { PARTS } from '../../data/parts';
import { CUSTOMERS } from '../../data/customers';
import type { Part } from '../types';

/** Look up a part by id from the live PARTS roster, throwing if missing. */
function part(id: string): Part {
  const p = PARTS.find((x) => x.id === id);
  if (!p) throw new Error(`fixture part missing: ${id}`);
  return p;
}

/** Look up a customer by id from the live roster, throwing if missing. */
function pickCustomer(id: string) {
  const c = CUSTOMERS.find((x) => x.id === id);
  if (!c) throw new Error(`fixture customer missing: ${id}`);
  return c;
}

describe('sumTraits', () => {
  it('returns a zeroed TraitScores when given no parts', () => {
    expect(sumTraits([])).toEqual({ fun: 0, zappy: 0, cozy: 0, boom: 0 });
  });

  it('adds contributions correctly across multiple parts', () => {
    // bolt:   { zappy: 1, boom: 1 }
    // beaker: { boom: 1 }
    // bell:   { fun: 1, cozy: 1 }
    // Expected: fun 1, zappy 1, cozy 1, boom 2.
    const result = sumTraits([part('bolt'), part('beaker'), part('bell')]);
    expect(result).toEqual({ fun: 1, zappy: 1, cozy: 1, boom: 2 });
  });

  it('caps each trait at 3 when contributions would otherwise exceed it', () => {
    // sock contributes cozy 2; jelly, bell, feather each contribute cozy 1.
    // Raw cozy total = 2 + 1 + 1 + 1 = 5; expect capped at 3.
    // Raw fun total = 0 + 1 + 1 + 1 = 3; equal to cap.
    const result = sumTraits([part('sock'), part('jelly'), part('bell'), part('feather')]);
    expect(result.cozy).toBe(3);
    expect(result.fun).toBe(3);
    expect(result.zappy).toBe(0);
    expect(result.boom).toBe(0);
  });
});

describe('compose', () => {
  it('returns an Invention whose traitScores match sumTraits(parts)', () => {
    const parts = [part('bolt'), part('beaker'), part('bell')];
    const customer = pickCustomer('pip');
    const invention = compose(parts, customer);
    expect(invention.traitScores).toEqual(sumTraits(parts));
    expect(invention.parts).toBe(parts);
    expect(invention.customerId).toBe('pip');
    expect(typeof invention.createdAt).toBe('number');
  });

  it("Pip + [sock, jelly, bell, feather] resolves to 'delight'", () => {
    // sock cozy=2; jelly fun=1 cozy=1; bell fun=1 cozy=1; feather cozy=1 fun=1.
    // Sum: fun=3, cozy=5 -> capped to 3, zappy=0, boom=0.
    // Pip wants [cozy, fun] both >= 2, no forbidden -> 'delight'.
    const invention = compose(
      [part('sock'), part('jelly'), part('bell'), part('feather')],
      pickCustomer('pip'),
    );
    expect(invention.traitScores).toEqual({ fun: 3, zappy: 0, cozy: 3, boom: 0 });
    expect(invention.tier).toBe('delight');
  });

  it("Pip + [bolt, cog, beaker, spring] resolves to 'sortOf'", () => {
    // bolt zappy=1 boom=1; cog zappy=1; beaker boom=1; spring fun=1 zappy=1.
    // Sum: fun=1, zappy=3, cozy=0, boom=2.
    // Pip wants [cozy, fun]. cozy=0 fails wantsAny; fun>=1 so wantsAtLeastOne -> 'sortOf'.
    const invention = compose(
      [part('bolt'), part('cog'), part('beaker'), part('spring')],
      pickCustomer('pip'),
    );
    expect(invention.traitScores).toEqual({ fun: 1, zappy: 3, cozy: 0, boom: 2 });
    expect(invention.tier).toBe('sortOf');
  });

  it("Sir Knirps + [bolt, spring, cog, beaker] resolves to 'delight'", () => {
    // Same parts as above, different order. Sum identical:
    // fun=1, zappy=3, cozy=0, boom=2.
    // Sir Knirps wants [boom, zappy]. boom=2 >= 2 and zappy=3 >= 2 -> 'delight'.
    const invention = compose(
      [part('bolt'), part('spring'), part('cog'), part('beaker')],
      pickCustomer('crunch'),
    );
    expect(invention.traitScores).toEqual({ fun: 1, zappy: 3, cozy: 0, boom: 2 });
    expect(invention.tier).toBe('delight');
  });
});
