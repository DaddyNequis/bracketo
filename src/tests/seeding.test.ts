import { describe, it, expect } from 'vitest';
import { buildSeedOrder, slotsFromSeeds } from '../algorithms/seeding';

describe('buildSeedOrder', () => {
  it('returns [1] for size 1', () => {
    expect(buildSeedOrder(1)).toEqual([1]);
  });

  it('returns [1, 2] for size 2', () => {
    expect(buildSeedOrder(2)).toEqual([1, 2]);
  });

  it('returns [1, 4, 2, 3] for size 4', () => {
    expect(buildSeedOrder(4)).toEqual([1, 4, 2, 3]);
  });

  it('returns valid 8-player seeding with seed 1 and 2 in opposite halves', () => {
    const order = buildSeedOrder(8);
    expect(order).toHaveLength(8);
    // Seed 1 should be in the first half (indices 0-3) and seed 2 in the second half (4-7)
    expect(order.indexOf(1)).toBeLessThan(4);
    expect(order.indexOf(2)).toBeGreaterThanOrEqual(4);
  });

  it('has length equal to size', () => {
    expect(buildSeedOrder(16)).toHaveLength(16);
  });

  it('seed 1 and seed N are always paired first', () => {
    const order = buildSeedOrder(8);
    expect(order[0]).toBe(1);
    expect(order[1]).toBe(8);
  });
});

describe('slotsFromSeeds', () => {
  it('maps seeds within participant count to 0-based indices', () => {
    const order = buildSeedOrder(4);
    const slots = slotsFromSeeds(order, 4);
    // All 4 seeds present, all 0-based indices 0-3 present
    expect(slots.sort()).toEqual([0, 1, 2, 3]);
  });

  it('maps seeds beyond participant count to null (byes)', () => {
    const order = buildSeedOrder(4);
    const slots = slotsFromSeeds(order, 3);
    // seed 4 > 3 → null
    expect(slots.some((s) => s === null)).toBe(true);
  });
});
