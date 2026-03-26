import { createStore } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import type { Bracket, BracketConfig, Match } from '../types';
import { buildSingleElimination } from '../algorithms/singleElimination';
import { buildDoubleElimination } from '../algorithms/doubleElimination';
import { determineMatchWinner } from '../utils/scoring';

export interface BracketState {
  bracket: Bracket | null;
  highlightedParticipantId: string | null;
  highlightedMatchIds: Set<string>;
  highlightedEdgeIds: Set<string>;
}

export interface BracketActions {
  initBracket: (config: BracketConfig) => void;
  updateScore: (matchId: string, setIndex: number, slot: 0 | 1, score: number) => void;
  addSet: (matchId: string) => void;
  removeSet: (matchId: string, setIndex: number) => void;
  overrideWinner: (matchId: string, participantId: string) => void;
  resetMatch: (matchId: string) => void;
  setMatchSchedule: (matchId: string, scheduledAt: number | undefined, location: string | undefined) => void;
  setHighlightPath: (participantId: string | null) => void;
}

export type BracketStore = BracketState & BracketActions;

export function createBracketStore() {
  return createStore<BracketStore>()(
    immer((set) => ({
      bracket: null,
      highlightedParticipantId: null,
      highlightedMatchIds: new Set<string>(),
      highlightedEdgeIds: new Set<string>(),

      initBracket(config: BracketConfig) {
        const matches =
          config.format === 'double_elimination'
            ? buildDoubleElimination(config)
            : buildSingleElimination(config);

        set((state) => {
          state.bracket = {
            id: crypto.randomUUID(),
            config,
            matches,
            winnerId: null,
            createdAt: Date.now(),
          };
          state.highlightedParticipantId = null;
          state.highlightedMatchIds = new Set();
          state.highlightedEdgeIds = new Set();
        });
      },

      updateScore(matchId: string, setIndex: number, slot: 0 | 1, score: number) {
        set((state) => {
          if (!state.bracket) return;
          const match = state.bracket.matches[matchId];
          if (!match || match.status === 'bye') return;

          // Ensure the set exists
          while (match.sets.length <= setIndex) {
            const p0 = match.participantIds[0] ?? '';
            const p1 = match.participantIds[1] ?? '';
            match.sets.push({
              id: crypto.randomUUID(),
              scores: [
                { participantId: p0, score: 0 },
                { participantId: p1, score: 0 },
              ],
            });
          }

          match.sets[setIndex].scores[slot].score = score;

          // Mark as in_progress if pending
          if (match.status === 'pending') {
            match.status = 'in_progress';
          }

          // Check for winner
          const winner = determineMatchWinner(match, state.bracket.config);
          if (winner) {
            applyWinner(state.bracket, matchId, winner.winnerId, winner.loserId);
          }
        });
      },

      addSet(matchId: string) {
        set((state) => {
          if (!state.bracket) return;
          const match = state.bracket.matches[matchId];
          if (!match || match.status === 'completed' || match.status === 'bye') return;
          const p0 = match.participantIds[0] ?? '';
          const p1 = match.participantIds[1] ?? '';
          match.sets.push({
            id: crypto.randomUUID(),
            scores: [
              { participantId: p0, score: 0 },
              { participantId: p1, score: 0 },
            ],
          });
        });
      },

      removeSet(matchId: string, setIndex: number) {
        set((state) => {
          if (!state.bracket) return;
          const match = state.bracket.matches[matchId];
          if (!match || match.sets.length <= 1) return;
          match.sets.splice(setIndex, 1);
        });
      },

      overrideWinner(matchId: string, participantId: string) {
        set((state) => {
          if (!state.bracket) return;
          const match = state.bracket.matches[matchId];
          if (!match) return;
          const loserId = match.participantIds.find((id) => id !== participantId) ?? null;
          applyWinner(state.bracket, matchId, participantId, loserId);
        });
      },

      resetMatch(matchId: string) {
        set((state) => {
          if (!state.bracket) return;
          const match = state.bracket.matches[matchId];
          if (!match) return;

          // Clear winner from downstream matches that this fed into
          if (match.winnerId && match.winnerGoesTo) {
            const nextMatch = state.bracket.matches[match.winnerGoesTo.matchId];
            if (nextMatch) {
              nextMatch.participantIds[match.winnerGoesTo.slot] = null;
              nextMatch.status = 'pending';
              nextMatch.winnerId = null;
              nextMatch.loserId = null;
              nextMatch.sets = [];
            }
          }

          match.sets = [];
          match.winnerId = null;
          match.loserId = null;
          match.status = 'pending';
        });
      },

      setMatchSchedule(matchId: string, scheduledAt: number | undefined, location: string | undefined) {
        set((state) => {
          if (!state.bracket) return;
          const match = state.bracket.matches[matchId];
          if (!match) return;
          match.scheduledAt = scheduledAt;
          match.location = location || undefined;
        });
      },

      setHighlightPath(participantId: string | null) {
        set((state) => {
          if (!state.bracket || !participantId) {
            state.highlightedParticipantId = null;
            state.highlightedMatchIds = new Set();
            state.highlightedEdgeIds = new Set();
            return;
          }

          state.highlightedParticipantId = participantId;

          const matchIds = new Set<string>();
          const edgeIds = new Set<string>();

          for (const match of Object.values(state.bracket.matches)) {
            if (match.winnerId === participantId || match.participantIds.includes(participantId)) {
              matchIds.add(match.id);
              // Edge IDs follow the pattern: {sourceMatchId}->{targetMatchId}
              if (match.winnerGoesTo && match.winnerId === participantId) {
                edgeIds.add(`${match.id}->${match.winnerGoesTo.matchId}`);
              }
            }
          }

          state.highlightedMatchIds = matchIds;
          state.highlightedEdgeIds = edgeIds;
        });
      },
    })),
  );
}

/** Applies a determined winner to a match and cascades to the next match */
function applyWinner(
  bracket: Bracket,
  matchId: string,
  winnerId: string,
  loserId: string | null,
) {
  const match = bracket.matches[matchId];
  if (!match) return;

  match.winnerId = winnerId;
  match.loserId = loserId;
  match.status = 'completed';

  // Cascade winner forward
  if (match.winnerGoesTo) {
    const nextMatch = bracket.matches[match.winnerGoesTo.matchId];
    if (nextMatch) {
      nextMatch.participantIds[match.winnerGoesTo.slot] = winnerId;
      // Update set score participant IDs for the slot
      nextMatch.sets.forEach((s) => {
        s.scores[match.winnerGoesTo!.slot].participantId = winnerId;
      });
      // Auto-resolve if the other slot was already a bye
      if (nextMatch.status === 'bye') {
        const otherSlot = match.winnerGoesTo.slot === 0 ? 1 : 0;
        if (nextMatch.participantIds[otherSlot] === null) {
          nextMatch.winnerId = winnerId;
          nextMatch.status = 'completed';
          applyWinner(bracket, nextMatch.id, winnerId, null);
        }
      }
    }
  }

  // Check if this is the grand final — set overall tournament winner
  if (match.winnerGoesTo === null && match.bracketSection !== 'losers') {
    bracket.winnerId = winnerId;
  }

  // Cascade loser forward (double elim)
  if (match.loserGoesTo && loserId) {
    const loserMatch = bracket.matches[match.loserGoesTo.matchId];
    if (loserMatch) {
      loserMatch.participantIds[match.loserGoesTo.slot] = loserId;
    }
  }
}

/** Convenience: create a bracket store and call initBracket immediately */
export function createBracket(config: BracketConfig) {
  const store = createBracketStore();
  store.getState().initBracket(config);
  return store;
}

export type BracketStoreInstance = ReturnType<typeof createBracketStore>;

// Re-export match-level types needed by external consumers of the store
export type { Match };
