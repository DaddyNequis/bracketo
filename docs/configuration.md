# Configuration — `BracketConfig`

Everything about how a bracket behaves comes from a single plain object you pass to `<Bracket config={...}>`. It's fully JSON-serializable, so you can store it, send it over the wire, or snapshot it as a [template](features.md#templates).

```ts
interface BracketConfig {
  format:           BracketFormat;
  participantType:  ParticipantType;
  indicatorType:    IndicatorType;
  participants:     Participant[];
  setsToWin:        number;
  maxSetsPerMatch:  number;
  allowTies:        boolean;
  thirdPlaceMatch:  boolean;
  grandFinalReset:  boolean;
  showSeed:         boolean;
  showStatus:       boolean;
}
```

---

## `format`

```ts
type BracketFormat = 'single_elimination' | 'double_elimination';
```

| Value | What it means |
|---|---|
| `'single_elimination'` | One loss and you're out. Optional third-place match available. |
| `'double_elimination'` | Two losses to eliminate. Includes a full losers bracket and grand final. |

---

## `participantType`

Controls how each slot in a match node is displayed.

```ts
type ParticipantType = 'singles' | 'couples' | 'teams';
```

| Value | Slot displays | Good for |
|---|---|---|
| `'singles'` | One player name | Tennis, chess, fighting games |
| `'couples'` | Two stacked player names | Badminton doubles, beach volleyball |
| `'teams'` | Team name | Soccer, basketball, esports |

---

## `indicatorType`

What visual indicator appears alongside participant names.

```ts
type IndicatorType = 'flag' | 'photo' | 'state' | 'photo_state';
```

See [Indicators](indicators.md) for the full breakdown with visuals.

---

## `participants`

Ordered list of participants. The `seed` field determines bracket placement — seed 1 is set up to only meet seed 2 in the final.

Non-power-of-2 counts are padded with byes automatically. Bye matches are resolved immediately and the real participant advances.

See [Data types](data-types.md#participant) for the full `Participant` shape.

---

## `setsToWin`

How many sets a participant needs to win the match.

| `setsToWin` | Effective format |
|---|---|
| `1` | Best of 1 |
| `2` | Best of 3 |
| `3` | Best of 5 |

---

## `maxSetsPerMatch`

The maximum number of sets that can be played. This controls how many score columns show up in the score modal. Use `1` for soccer, `5` or `7` for tennis.

---

## `allowTies`

When `true`, a match where both participants have equal set wins isn't auto-resolved. Useful for sports where draws are valid (e.g. soccer group stages).

---

## `thirdPlaceMatch`

*(Single elimination only.)* Adds a bronze medal match between the two semifinal losers.

---

## `grandFinalReset`

*(Double elimination only.)* If the losers bracket champion wins the grand final, a reset match is played — giving the winners bracket champion a chance to win from the undefeated side.

---

## `showSeed`

When `true`, a small seed badge (e.g. `1`, `5`) appears to the left of each participant's name in every match node.

---

## `showStatus`

When `true`, the match node header shows a colored status chip (Scheduled, Starting Soon, In Progress, Finished).

When `false`, the location/time field uses the full header width instead.

See [Scoring & scheduling](scoring.md#match-status) for how status is derived.
