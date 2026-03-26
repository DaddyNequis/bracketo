import { useBracketStore, useBracketStoreInstance } from '../components/Bracket/BracketContext';
import type { BracketConfig } from '../types';

/**
 * Main hook for controlling the bracket from outside the ReactFlow canvas.
 * Must be used inside a <Bracket> or <BracketProvider>.
 */
export function useBracket() {
  const store = useBracketStoreInstance();

  const bracket = useBracketStore((s) => s.bracket);
  const winnerId = useBracketStore((s) => s.bracket?.winnerId ?? null);
  const highlightedParticipantId = useBracketStore((s) => s.highlightedParticipantId);

  function init(config: BracketConfig) {
    store.getState().initBracket(config);
  }

  function updateScore(matchId: string, setIndex: number, slot: 0 | 1, score: number) {
    store.getState().updateScore(matchId, setIndex, slot, score);
  }

  function overrideWinner(matchId: string, participantId: string) {
    store.getState().overrideWinner(matchId, participantId);
  }

  function resetMatch(matchId: string) {
    store.getState().resetMatch(matchId);
  }

  function setHighlightPath(participantId: string | null) {
    store.getState().setHighlightPath(participantId);
  }

  return {
    bracket,
    winnerId,
    highlightedParticipantId,
    init,
    updateScore,
    overrideWinner,
    resetMatch,
    setHighlightPath,
  };
}
