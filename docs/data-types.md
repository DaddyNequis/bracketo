# Data types

The core types you'll work with when building on top of Bracketo.

---

## Participant

```ts
interface Participant {
  id:       string;
  name:     string;
  seed:     number;            // 1-based
  members:  TeamMember[];      // 1 for singles, 2 for couples, 5+ for teams
  flags?:   ParticipantFlag[];
}

interface TeamMember {
  id:        string;
  name:      string;
  photoUrl?: string;   // used in 'photo' and 'photo_state' indicator modes
  state?:    string;   // region label used in 'state' and 'photo_state' indicator modes
}

interface ParticipantFlag {
  type:   'country' | 'status' | 'custom';
  value:  string;    // ISO 3166-1 alpha-2 for 'country' (e.g. 'US', 'DE', 'BR')
  label?: string;
}
```

**Singles with a country flag:**

```ts
{
  id: 'p1',
  name: 'Alice Smith',
  seed: 1,
  members: [{ id: 'm1', name: 'Alice Smith', photoUrl: 'https://...', state: 'CA' }],
  flags: [{ type: 'country', value: 'US' }],
}
```

**Doubles with photos:**

```ts
{
  id: 'p1',
  name: 'Smith / Jones',
  seed: 1,
  members: [
    { id: 'm1a', name: 'Alice Smith', photoUrl: 'https://...', state: 'CA' },
    { id: 'm1b', name: 'Bob Jones',   photoUrl: 'https://...', state: 'TX' },
  ],
  flags: [{ type: 'country', value: 'US' }],
}
```

---

## Match

```ts
interface Match {
  id:              string;
  round:           number;          // 0-based round index within its bracket section
  position:        number;          // 0-based position within the round
  bracketSection:  BracketSection;  // 'winners' | 'losers' | 'grand_final'
  participantIds:  [string | null, string | null];  // null = TBD or bye
  sets:            MatchSet[];
  winnerId:        string | null;
  loserId:         string | null;
  status:          MatchStatus;     // 'pending' | 'in_progress' | 'completed' | 'bye'
  winnerGoesTo:    MatchRef | null;
  loserGoesTo:     MatchRef | null; // null in single elim (except with grandFinalReset)
  scheduledAt?:    number;          // Unix ms timestamp
  location?:       string;
}

interface MatchSet {
  id:     string;
  scores: [SetScore, SetScore];
}

interface SetScore {
  participantId: string;
  score:         number;
}

interface MatchRef {
  matchId: string;
  slot:    0 | 1;  // which participant slot to fill in the target match
}
```

---

## Bracket

The top-level state object returned by the store.

```ts
interface Bracket {
  id:         string;
  config:     BracketConfig;
  matches:    Record<string, Match>;  // keyed by match.id for O(1) lookup
  winnerId:   string | null;
  createdAt:  number;
}
```
