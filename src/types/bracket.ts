import type { Participant } from './player';
import type { Match } from './match';

export type BracketFormat = 'single_elimination' | 'double_elimination';

/**
 * Controls how participant slots are displayed on the bracket node.
 * - 'singles'  → one player per slot, show participant.name
 * - 'couples'  → two players per slot, show both member names stacked
 * - 'teams'    → a full team per slot, show participant.name (the team name)
 */
export type ParticipantType = 'singles' | 'couples' | 'teams';

/**
 * Controls what indicator is shown alongside participant names.
 * - 'flag'       → one country flag emoji for the whole participant slot
 * - 'photo'      → member photo avatars displayed side-by-side horizontally
 * - 'state'      → state/region text badge shown before each member name
 * - 'photo_state' → photo avatars + state badge combined
 */
export type IndicatorType = 'flag' | 'photo' | 'state' | 'photo_state';

export interface BracketConfig {
  format: BracketFormat;
  /** How each slot is displayed — singles, couples (doubles), or teams */
  participantType: ParticipantType;
  participants: Participant[];
  /**
   * Number of sets a participant must win to win the match.
   * e.g. 2 for best-of-3, 3 for best-of-5
   */
  setsToWin: number;
  /**
   * Maximum sets per match (controls how many score columns appear).
   * Soccer: 1, Tennis: up to 5 or 7
   */
  maxSetsPerMatch: number;
  allowTies: boolean;
  /** Single elim option: add a 3rd place match */
  thirdPlaceMatch: boolean;
  /** Double elim option: losers bracket winner gets a second chance if they win grand final */
  grandFinalReset: boolean;
  /** Whether to display the seed / order number on each participant slot (default true) */
  showSeed: boolean;
  /** Whether to display the match status chip (Scheduled / In Progress / etc.) on nodes (default true) */
  showStatus: boolean;
  /** What indicator to show alongside participant names (default 'flag') */
  indicatorType: IndicatorType;
}

export interface Bracket {
  id: string;
  config: BracketConfig;
  /** All matches keyed by match.id for O(1) lookup */
  matches: Record<string, Match>;
  /** Overall tournament winner participant ID */
  winnerId: string | null;
  createdAt: number;
}
