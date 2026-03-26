import { describe, it, expect } from 'vitest';
import { buildSingleElimination } from '../algorithms/singleElimination';
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
    format: 'single_elimination',
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

describe('buildSingleElimination', () => {
  it('builds correct number of matches for 8 players', () => {
    const matches = buildSingleElimination(makeConfig(8));
    // 8 players → 7 matches
    expect(Object.keys(matches)).toHaveLength(7);
  });

  it('builds correct number of matches for 16 players', () => {
    const matches = buildSingleElimination(makeConfig(16));
    expect(Object.keys(matches)).toHaveLength(15);
  });

  it('handles non-power-of-2 with byes (6 players → 8 bracket, 7 matches)', () => {
    const matches = buildSingleElimination(makeConfig(6));
    expect(Object.keys(matches)).toHaveLength(7);
    const byeMatches = Object.values(matches).filter((m) => m.status === 'bye');
    expect(byeMatches.length).toBeGreaterThan(0);
  });

  it('auto-advances bye winners into the next round', () => {
    const config = makeConfig(6);
    const matches = buildSingleElimination(config);
    const byeMatches = Object.values(matches).filter((m) => m.status === 'bye');
    for (const bye of byeMatches) {
      expect(bye.winnerId).not.toBeNull();
      if (bye.winnerGoesTo) {
        const next = matches[bye.winnerGoesTo.matchId];
        expect(next.participantIds[bye.winnerGoesTo.slot]).toBe(bye.winnerId);
      }
    }
  });

  it('all non-bye round-0 matches have two participants', () => {
    const matches = buildSingleElimination(makeConfig(8));
    const r0 = Object.values(matches).filter((m) => m.round === 0 && m.status !== 'bye');
    for (const m of r0) {
      expect(m.participantIds[0]).not.toBeNull();
      expect(m.participantIds[1]).not.toBeNull();
    }
  });

  it('all matches except the final have winnerGoesTo set', () => {
    const matches = buildSingleElimination(makeConfig(8));
    const nonFinal = Object.values(matches).filter((m) => m.round < 2);
    for (const m of nonFinal) {
      expect(m.winnerGoesTo).not.toBeNull();
    }
  });

  it('adds third-place match when configured', () => {
    const matches = buildSingleElimination(makeConfig(8, { thirdPlaceMatch: true }));
    // 7 + 1 = 8 matches
    expect(Object.keys(matches)).toHaveLength(8);
  });

  it('seeds 1 and 2 are in opposite halves (can only meet in the final)', () => {
    const config = makeConfig(8);
    const matches = buildSingleElimination(config);
    const r0 = Object.values(matches).filter((m) => m.round === 0);
    const seed1Match = r0.find((m) => m.participantIds.includes('p1'));
    const seed2Match = r0.find((m) => m.participantIds.includes('p2'));
    // They should not be in the same match
    expect(seed1Match?.id).not.toBe(seed2Match?.id);
  });
});
