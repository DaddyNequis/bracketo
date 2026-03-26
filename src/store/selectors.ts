import type { BracketStore } from './bracketStore';
import type { Match } from '../types';

export const selectMatch =
  (matchId: string) =>
  (state: BracketStore): Match | undefined =>
    state.bracket?.matches[matchId];

export const selectAllMatches = (state: BracketStore): Match[] =>
  state.bracket ? Object.values(state.bracket.matches) : [];

export const selectWinnerId = (state: BracketStore): string | null =>
  state.bracket?.winnerId ?? null;

export const selectIsHighlighted =
  (matchId: string) =>
  (state: BracketStore): boolean =>
    state.highlightedMatchIds.has(matchId);
