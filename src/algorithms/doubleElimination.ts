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
 * Builds the full double-elimination bracket:
 *  - Winners bracket (single-elim structure)
 *  - Losers bracket:
 *      LR0: WR0 losers play each other (bracketSize/4 matches)
 *      Then for each winners round r=1..n-1:
 *        Drop-in: WRr.length matches (prev LR winners vs WRr losers)
 *        Internal (if not last): drop-in.length/2 matches
 *  - Grand final (+ optional reset match)
 */
export function buildDoubleElimination(config: BracketConfig): Record<string, Match> {
  const { participants, grandFinalReset } = config;
  const n = participants.length;
  const bracketSize = nextPowerOf2(n);
  const totalWinnersRounds = Math.log2(bracketSize);

  const seedOrder = buildSeedOrder(bracketSize);
  const slots = slotsFromSeeds(seedOrder, n);

  const matches: Record<string, Match> = {};

  // ─── Winners Bracket ────────────────────────────────────────────────────────

  const winnersRounds: Match[][] = [];

  // Round 0
  const wr0: Match[] = [];
  for (let pos = 0; pos < bracketSize / 2; pos++) {
    const p0idx = slots[pos * 2];
    const p1idx = slots[pos * 2 + 1];
    const p0 = p0idx !== null ? participants[p0idx].id : null;
    const p1 = p1idx !== null ? participants[p1idx].id : null;
    const m = makeMatch(0, pos, p0, p1, 'winners');
    matches[m.id] = m;
    wr0.push(m);
  }
  winnersRounds.push(wr0);

  // Subsequent winners rounds
  let prevWR = wr0;
  for (let r = 1; r < totalWinnersRounds; r++) {
    const matchCount = bracketSize / Math.pow(2, r + 1);
    const wr: Match[] = [];
    for (let pos = 0; pos < matchCount; pos++) {
      const m = makeMatch(r, pos, null, null, 'winners');
      matches[m.id] = m;
      wr.push(m);
      prevWR[pos * 2].winnerGoesTo = { matchId: m.id, slot: 0 };
      prevWR[pos * 2 + 1].winnerGoesTo = { matchId: m.id, slot: 1 };
    }
    prevWR = wr;
    winnersRounds.push(wr);
  }

  // Auto-resolve byes in winners R0
  for (const m of winnersRounds[0]) {
    if (m.status === 'bye') {
      const winnerId = m.participantIds[0] ?? m.participantIds[1];
      if (winnerId && m.winnerGoesTo) {
        m.winnerId = winnerId;
        const next = matches[m.winnerGoesTo.matchId];
        if (next) next.participantIds[m.winnerGoesTo.slot] = winnerId;
      }
    }
  }

  // ─── Losers Bracket ─────────────────────────────────────────────────────────
  //
  // Structure (for bracketSize=8, totalWinnersRounds=3):
  //   LR0 (initial):  2 matches  ← WR0's 4 losers (2 per match)
  //   LR1 (drop-in):  2 matches  ← LR0 winners vs WR1's 2 losers
  //   LR2 (internal): 1 match    ← LR1 winners vs each other
  //   LR3 (drop-in):  1 match    ← LR2 winner vs WR-final's loser
  //   → Grand Final
  //
  // Algorithm:
  //   1. Build LR0: bracketSize/4 matches, wire WR0 losers in pairs
  //   2. For each winners round r (1..totalWinnersRounds-1):
  //      a. Drop-in: WRr.length matches (prevLR winner in slot 0, WRr loser in slot 1)
  //      b. Internal (if r < totalWinnersRounds-1): drop-in.length/2 matches

  let lrRoundIndex = 0;

  // LR0 — WR0 losers pair up
  const lr0Count = Math.max(1, bracketSize / 4);
  const lr0: Match[] = [];
  for (let pos = 0; pos < lr0Count; pos++) {
    const m = makeMatch(lrRoundIndex, pos, null, null, 'losers');
    matches[m.id] = m;
    lr0.push(m);
  }
  lrRoundIndex++;

  // Wire WR0 losers into LR0 (2 per match: slot 0 and slot 1)
  for (let i = 0; i < wr0.length; i++) {
    const lrMatchIdx = Math.floor(i / 2);
    const lrSlot = (i % 2) as 0 | 1;
    if (lr0[lrMatchIdx]) {
      wr0[i].loserGoesTo = { matchId: lr0[lrMatchIdx].id, slot: lrSlot };
    }
  }

  let prevLR: Match[] = lr0;

  // Now alternate: drop-in (from WRr) → internal → drop-in (from WRr+1) → ...
  for (let wr = 1; wr < totalWinnersRounds; wr++) {
    const wrLosers = winnersRounds[wr];
    const dropInCount = wrLosers.length; // must equal prevLR.length

    // Drop-in round
    const dropInRound: Match[] = [];
    for (let pos = 0; pos < dropInCount; pos++) {
      const m = makeMatch(lrRoundIndex, pos, null, null, 'losers');
      matches[m.id] = m;
      dropInRound.push(m);
      // prevLR winner → slot 0
      if (prevLR[pos]) {
        prevLR[pos].winnerGoesTo = { matchId: m.id, slot: 0 };
      }
      // WRr loser → slot 1
      if (wrLosers[pos]) {
        wrLosers[pos].loserGoesTo = { matchId: m.id, slot: 1 };
      }
    }
    lrRoundIndex++;
    prevLR = dropInRound;

    // Internal round (only if not the last winners round)
    if (wr < totalWinnersRounds - 1) {
      const internalCount = Math.max(1, dropInCount / 2);
      const internalRound: Match[] = [];
      for (let pos = 0; pos < internalCount; pos++) {
        const m = makeMatch(lrRoundIndex, pos, null, null, 'losers');
        matches[m.id] = m;
        internalRound.push(m);
        if (prevLR[pos * 2]) {
          prevLR[pos * 2].winnerGoesTo = { matchId: m.id, slot: 0 };
        }
        if (prevLR[pos * 2 + 1]) {
          prevLR[pos * 2 + 1].winnerGoesTo = { matchId: m.id, slot: 1 };
        }
      }
      lrRoundIndex++;
      prevLR = internalRound;
    }
  }

  // ─── Grand Final ────────────────────────────────────────────────────────────

  const grandFinal = makeMatch(0, 0, null, null, 'grand_final');
  matches[grandFinal.id] = grandFinal;

  // Winners bracket champion → GF slot 0
  const winnersFinal = winnersRounds[totalWinnersRounds - 1][0];
  if (winnersFinal) {
    winnersFinal.winnerGoesTo = { matchId: grandFinal.id, slot: 0 };
  }

  // Losers bracket champion → GF slot 1
  const losersFinal = prevLR[0];
  if (losersFinal) {
    losersFinal.winnerGoesTo = { matchId: grandFinal.id, slot: 1 };
  }

  // Optional grand final reset match
  if (grandFinalReset) {
    const resetMatch = makeMatch(1, 0, null, null, 'grand_final');
    matches[resetMatch.id] = resetMatch;
    // If losers bracket winner wins grand final → reset match is played
    grandFinal.winnerGoesTo = { matchId: resetMatch.id, slot: 0 };
    grandFinal.loserGoesTo = { matchId: resetMatch.id, slot: 1 };
  }

  return matches;
}
