import { describe, it, expect } from 'vitest';
import { buildDoubleElimination } from '../algorithms/doubleElimination';
import type { BracketConfig, Participant } from '../types';

function makeParticipants(n: number): Participant[] {
  return Array.from({ length: n }, (_, i) => ({
    id: `p${i + 1}`,
    name: `Player ${i + 1}`,
    seed: i + 1,
    members: [{ id: `m${i + 1}`, name: `Player ${i + 1}` }],
  }));
}

function makeConfig(n: number, overrides?: Partial<BracketConfig>): BracketConfig {
  return {
    format: 'double_elimination',
    participantType: 'singles',
    indicatorType: 'flag',
    participants: makeParticipants(n),
    setsToWin: 1,
    maxSetsPerMatch: 1,
    allowTies: false,
    thirdPlaceMatch: false,
    grandFinalReset: false,
    showSeed: true,
    showStatus: true,
    ...overrides,
  };
}

describe('buildDoubleElimination', () => {
  it('produces matches with three sections for 8 players', () => {
    const matches = buildDoubleElimination(makeConfig(8));
    const sections = new Set(Object.values(matches).map((m) => m.bracketSection));
    expect(sections).toContain('winners');
    expect(sections).toContain('losers');
    expect(sections).toContain('grand_final');
  });

  it('winners bracket has bracketSize-1 matches (8 players → 7)', () => {
    const matches = buildDoubleElimination(makeConfig(8));
    const w = Object.values(matches).filter((m) => m.bracketSection === 'winners');
    expect(w).toHaveLength(7);
  });

  it('grand final exists', () => {
    const matches = buildDoubleElimination(makeConfig(8));
    const gf = Object.values(matches).filter((m) => m.bracketSection === 'grand_final');
    expect(gf.length).toBeGreaterThanOrEqual(1);
  });

  it('adds a reset match when grandFinalReset=true', () => {
    const matches = buildDoubleElimination(makeConfig(8, { grandFinalReset: true }));
    const gf = Object.values(matches).filter((m) => m.bracketSection === 'grand_final');
    expect(gf).toHaveLength(2);
  });

  it('all WR matches have loserGoesTo set (including the winners final)', () => {
    const matches = buildDoubleElimination(makeConfig(8));
    const wMatches = Object.values(matches).filter((m) => m.bracketSection === 'winners');
    for (const m of wMatches) {
      expect(m.loserGoesTo).not.toBeNull();
    }
  });
});
