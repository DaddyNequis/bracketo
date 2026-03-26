import { describe, it, expect } from 'vitest';
import { determineMatchWinner } from '../utils/scoring';
import type { Match } from '../types';

function makeMatch(p0: string, p1: string, sets: [number, number][]): Match {
  return {
    id: 'test',
    round: 0,
    position: 0,
    bracketSection: 'winners',
    participantIds: [p0, p1],
    sets: sets.map(([s0, s1], i) => ({
      id: `set${i}`,
      scores: [
        { participantId: p0, score: s0 },
        { participantId: p1, score: s1 },
      ],
    })),
    winnerId: null,
    loserId: null,
    status: 'in_progress',
    winnerGoesTo: null,
    loserGoesTo: null,
  };
}

describe('determineMatchWinner', () => {
  const config = { setsToWin: 1, allowTies: false };

  it('returns null when no sets played', () => {
    const m = makeMatch('a', 'b', []);
    expect(determineMatchWinner(m, config)).toBeNull();
  });

  it('returns winner when p0 wins 1 set (setsToWin=1)', () => {
    const m = makeMatch('a', 'b', [[3, 1]]);
    const result = determineMatchWinner(m, config);
    expect(result?.winnerId).toBe('a');
    expect(result?.loserId).toBe('b');
  });

  it('returns winner when p1 wins 1 set', () => {
    const m = makeMatch('a', 'b', [[1, 3]]);
    const result = determineMatchWinner(m, config);
    expect(result?.winnerId).toBe('b');
  });

  it('returns null when score is tied', () => {
    const m = makeMatch('a', 'b', [[3, 3]]);
    expect(determineMatchWinner(m, config)).toBeNull();
  });

  it('works for best-of-3 (setsToWin=2)', () => {
    const bo3 = { setsToWin: 2, allowTies: false };
    const m = makeMatch('a', 'b', [[6, 3], [6, 4]]);
    const result = determineMatchWinner(m, bo3);
    expect(result?.winnerId).toBe('a');
  });

  it('returns null when each player has won 1 set in best-of-3', () => {
    const bo3 = { setsToWin: 2, allowTies: false };
    const m = makeMatch('a', 'b', [[6, 3], [3, 6]]);
    expect(determineMatchWinner(m, bo3)).toBeNull();
  });

  it('returns null when both participantIds are null', () => {
    const m: Match = {
      ...makeMatch('', '', []),
      participantIds: [null, null],
    };
    expect(determineMatchWinner(m, config)).toBeNull();
  });
});
