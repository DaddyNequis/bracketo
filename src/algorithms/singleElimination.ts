import type { Match, BracketConfig } from '../types';
import { nextPowerOf2, generateId } from '../utils/math';
import { buildSeedOrder, slotsFromSeeds } from './seeding';

function makeMatch(
  round: number,
  position: number,
  p0: string | null,
  p1: string | null,
  bracketSection: Match['bracketSection'] = 'winners',
): Match {
  const isBye = (p0 !== null && p1 === null) || (p0 === null && p1 !== null);
  return {
    id: generateId(),
    round,
    position,
    bracketSection,
    participantIds: [p0, p1],
    sets: [],
    winnerId: null,
    loserId: null,
    status: isBye ? 'bye' : 'pending',
    winnerGoesTo: null,
    loserGoesTo: null,
  };
}

/**
 * Builds the full single-elimination match tree.
 * Returns a flat Record<matchId, Match> suitable for the bracket store.
 */
export function buildSingleElimination(config: BracketConfig): Record<string, Match> {
  const { participants, thirdPlaceMatch } = config;
  const n = participants.length;
  const bracketSize = nextPowerOf2(n);
  const totalRounds = Math.log2(bracketSize);

  const seedOrder = buildSeedOrder(bracketSize);
  const slots = slotsFromSeeds(seedOrder, n);

  const matches: Record<string, Match> = {};

  // --- Round 0: build initial matches ---
  const round0Matches: Match[] = [];
  for (let pos = 0; pos < bracketSize / 2; pos++) {
    const p0idx = slots[pos * 2];
    const p1idx = slots[pos * 2 + 1];
    const p0 = p0idx !== null ? participants[p0idx].id : null;
    const p1 = p1idx !== null ? participants[p1idx].id : null;
    const m = makeMatch(0, pos, p0, p1);
    matches[m.id] = m;
    round0Matches.push(m);
  }

  // --- Subsequent rounds ---
  let prevRoundMatches = round0Matches;
  const allRoundMatches: Match[][] = [round0Matches];

  for (let round = 1; round < totalRounds; round++) {
    const matchCount = bracketSize / Math.pow(2, round + 1);
    const currentRoundMatches: Match[] = [];

    for (let pos = 0; pos < matchCount; pos++) {
      const m = makeMatch(round, pos, null, null);
      matches[m.id] = m;
      currentRoundMatches.push(m);

      // Wire the two feeder matches from the previous round
      const feeder0 = prevRoundMatches[pos * 2];
      const feeder1 = prevRoundMatches[pos * 2 + 1];

      feeder0.winnerGoesTo = { matchId: m.id, slot: 0 };
      feeder1.winnerGoesTo = { matchId: m.id, slot: 1 };
    }

    prevRoundMatches = currentRoundMatches;
    allRoundMatches.push(currentRoundMatches);
  }

  // --- Auto-resolve byes in round 0 ---
  for (const m of round0Matches) {
    if (m.status === 'bye') {
      const winnerId = m.participantIds[0] ?? m.participantIds[1];
      if (winnerId && m.winnerGoesTo) {
        m.winnerId = winnerId;
        const next = matches[m.winnerGoesTo.matchId];
        if (next) {
          next.participantIds[m.winnerGoesTo.slot] = winnerId;
        }
      }
    }
  }

  // --- Optional third-place match ---
  if (thirdPlaceMatch && totalRounds >= 2) {
    const semiFinals = allRoundMatches[totalRounds - 2];
    if (semiFinals && semiFinals.length >= 2) {
      const sf0 = semiFinals[0];
      const sf1 = semiFinals[1];
      const thirdPlace = makeMatch(totalRounds - 1, 1, null, null);
      matches[thirdPlace.id] = thirdPlace;
      sf0.loserGoesTo = { matchId: thirdPlace.id, slot: 0 };
      sf1.loserGoesTo = { matchId: thirdPlace.id, slot: 1 };
    }
  }

  return matches;
}
