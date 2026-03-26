import type { Match, BracketConfig } from '../types';

interface MatchWinnerResult {
  winnerId: string;
  loserId: string | null;
}

/**
 * Determines whether a match has a winner based on the current set scores.
 * Returns null if the match is not yet decided.
 */
export function determineMatchWinner(
  match: Match,
  config: Pick<BracketConfig, 'setsToWin' | 'allowTies'>,
): MatchWinnerResult | null {
  const [id0, id1] = match.participantIds;
  if (!id0 || !id1) return null;
  if (match.sets.length === 0) return null;

  let wins0 = 0;
  let wins1 = 0;

  for (const set of match.sets) {
    const s0 = set.scores[0].score;
    const s1 = set.scores[1].score;
    if (s0 > s1) wins0++;
    else if (s1 > s0) wins1++;
    // ties are ignored unless allowTies=true (future: configurable tie rules)
  }

  if (wins0 >= config.setsToWin) {
    return { winnerId: id0, loserId: id1 };
  }
  if (wins1 >= config.setsToWin) {
    return { winnerId: id1, loserId: id0 };
  }

  return null;
}

/**
 * Returns the set winner for a single set (0 or 1 index, or null for a tie).
 */
export function getSetWinner(
  set: { scores: [{ participantId: string; score: number }, { participantId: string; score: number }] },
): string | null {
  const s0 = set.scores[0].score;
  const s1 = set.scores[1].score;
  if (s0 > s1) return set.scores[0].participantId;
  if (s1 > s0) return set.scores[1].participantId;
  return null; // tie
}
