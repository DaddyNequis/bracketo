# Scoring & scheduling

---

## How scoring works

Each match holds an array of `MatchSet` objects. Every set has two `SetScore` entries — one per participant slot.

After each score update:
1. The library counts how many sets each participant has won.
2. Once a participant reaches `setsToWin`, they're declared the winner.
3. The winner automatically advances to the next match (`winnerGoesTo`).
4. In double elimination, the loser moves to the losers bracket (`loserGoesTo`).

---

## Editing scores in the UI

Toggle edit mode with the lock button in the toolbar. Once unlocked, a pencil icon appears on every non-bye match. Clicking it opens the score modal where you can:

- Set scores for each set independently
- Add or remove sets (up to `maxSetsPerMatch`)
- Reset the match back to pending
- Set the match location and scheduled date/time

<!-- screenshot: score modal open -->

---

## Sport presets

A few common configurations to get you started:

| Sport | `setsToWin` | `maxSetsPerMatch` | `allowTies` |
|---|---|---|---|
| Soccer | 1 | 1 | `true` |
| Tennis | 2 | 5 | `false` |
| Badminton | 2 | 3 | `false` |
| Fighting games | 2 | 3 | `false` |
| Volleyball | 3 | 5 | `false` |

---

## Match scheduling

Each match can have a location and a scheduled start time. Both are stored on the `Match` object and are editable via the score modal.

```ts
scheduledAt?: number;   // Unix ms timestamp
location?:    string;   // e.g. "Court A", "Field 3"
```

The node header shows them as `Court A · 14:30`. Time is displayed in local time — `HH:MM` if the match is today, or `Mar 25 · 14:30` for a different day.

### Setting schedules from code

```ts
const store = createBracket(config);

store.getState().setMatchSchedule(
  matchId,
  new Date('2026-06-01T15:00:00').getTime(),  // scheduledAt (ms)
  'Centre Court',                              // location
);
```

---

## Match status

Each match node header shows a live status chip. Status is derived automatically from the match state and scheduled time.

```ts
type StatusVariant = 'scheduled' | 'soon' | 'live' | 'done' | 'bye';
```

### Derivation rules (checked in priority order)

| Condition | Label | Color |
|---|---|---|
| `match.status === 'completed'` | Finished | Blue |
| `match.status === 'in_progress'` (scores entered) | In Progress | Green |
| `scheduledAt` set and `now >= scheduledAt` | In Progress | Green |
| `scheduledAt` set and `now >= scheduledAt − 15 min` | Starting Soon | Amber |
| `scheduledAt` set and more than 15 min away | Scheduled | Gray |
| No `scheduledAt`, status `pending` | Scheduled | Gray |

The chip updates automatically every 30 seconds.

You can hide it entirely with `showStatus: false` in `BracketConfig` — the location/time field takes over the full header width when it's off.

<!-- screenshot: match node showing status chip variants -->
