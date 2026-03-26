export interface TeamMember {
  id: string;
  name: string;
  /** URL to the member's photo (used when indicatorType = 'photo') */
  photoUrl?: string;
  /** State or region name (used when indicatorType = 'state') */
  state?: string;
}

export interface ParticipantFlag {
  type: 'country' | 'status' | 'custom';
  /** ISO 3166-1 alpha-2 country code, status label, or custom icon URL */
  value: string;
  label?: string;
}

export interface Participant {
  id: string;
  name: string;
  /** 1-based seed/ranking */
  seed: number;
  /** Individual members. Length 1 for solo players, 2+ for doubles/team formats */
  members: TeamMember[];
  flags?: ParticipantFlag[];
}
