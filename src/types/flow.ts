import type { Participant } from './player';
import type { MatchSet, MatchStatus, BracketSection } from './match';

export interface SlotData {
  participant: Participant | null;
  isBye: boolean;
  isWinner: boolean;
  /** Score per set for this participant */
  scores: number[];
}

export interface MatchNodeData extends Record<string, unknown> {
  matchId: string;
  round: number;
  position: number;
  bracketSection: BracketSection;
  slots: [SlotData, SlotData];
  sets: MatchSet[];
  status: MatchStatus;
  isHighlighted: boolean;
}

export interface ByeNodeData extends Record<string, unknown> {
  round: number;
  position: number;
}

export interface LabelNodeData extends Record<string, unknown> {
  label: string;
  bracketSection: BracketSection;
}
