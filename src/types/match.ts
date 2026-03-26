export interface SetScore {
  participantId: string;
  score: number;
}

export interface MatchSet {
  id: string;
  /** Always exactly two entries, one per participant slot */
  scores: [SetScore, SetScore];
}

export type MatchStatus = 'pending' | 'in_progress' | 'completed' | 'bye';

export type BracketSection = 'winners' | 'losers' | 'grand_final';

export interface MatchRef {
  matchId: string;
  /** Which participant slot (0 = top, 1 = bottom) to fill in the target match */
  slot: 0 | 1;
}

export interface Match {
  id: string;
  round: number;
  position: number;
  bracketSection: BracketSection;
  /** null = TBD or bye placeholder */
  participantIds: [string | null, string | null];
  sets: MatchSet[];
  winnerId: string | null;
  loserId: string | null;
  status: MatchStatus;
  /** Where the winner feeds into next */
  winnerGoesTo: MatchRef | null;
  /** Where the loser feeds into next (null for single elim except grand final reset) */
  loserGoesTo: MatchRef | null;
  /** Unix timestamp (ms) for the scheduled start time */
  scheduledAt?: number;
  /** Venue / court / location label */
  location?: string;
}
