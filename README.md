# Bracketo

A React library for rendering interactive tournament brackets. Supports single and double elimination formats, flexible multi-sport scoring, match scheduling, winning-path highlighting, PDF export, and fully serializable template snapshots.

Built on [@xyflow/react](https://reactflow.dev/), [Zustand](https://github.com/pmndrs/zustand), and [Immer](https://immerjs.github.io/immer/).

---

## Table of contents

- [Installation](#installation)
- [Quick start](#quick-start)
- [Component API](#component-api)
  - [`<Bracket>`](#bracket)
- [Configuration — `BracketConfig`](#configuration--bracketconfig)
- [Data types](#data-types)
  - [Participant](#participant)
  - [Match](#match)
  - [Bracket](#bracket-data-type)
- [Indicator modes](#indicator-modes)
- [Match status system](#match-status-system)
- [Scoring](#scoring)
- [Match scheduling](#match-scheduling)
- [Winning path highlight](#winning-path-highlight)
- [Template system](#template-system)
- [PDF export](#pdf-export)
- [Headless usage (store API)](#headless-usage-store-api)
- [Hooks](#hooks)
- [Theming](#theming)
- [Algorithms](#algorithms)

---

## Installation

```bash
npm install bracketo
```

### Peer dependencies

These must be installed in your project:

```bash
npm install react react-dom @xyflow/react
```

| Package | Required version |
|---|---|
| `react` | `>=18.0.0` |
| `react-dom` | `>=18.0.0` |
| `@xyflow/react` | `>=12.0.0` |

---

## Quick start

```tsx
import { Bracket } from 'bracketo';
import 'bracketo/dist/bracketo.css';

const config = {
  format: 'single_elimination',
  participantType: 'singles',
  indicatorType: 'flag',
  participants: [
    { id: 'p1', name: 'Alice',   seed: 1, members: [{ id: 'm1', name: 'Alice' }],   flags: [{ type: 'country', value: 'US' }] },
    { id: 'p2', name: 'Bob',     seed: 2, members: [{ id: 'm2', name: 'Bob' }],     flags: [{ type: 'country', value: 'DE' }] },
    { id: 'p3', name: 'Carol',   seed: 3, members: [{ id: 'm3', name: 'Carol' }],   flags: [{ type: 'country', value: 'BR' }] },
    { id: 'p4', name: 'Dave',    seed: 4, members: [{ id: 'm4', name: 'Dave' }],    flags: [{ type: 'country', value: 'JP' }] },
  ],
  setsToWin: 1,
  maxSetsPerMatch: 1,
  allowTies: false,
  thirdPlaceMatch: false,
  grandFinalReset: false,
  showSeed: true,
  showStatus: true,
};

export default function App() {
  return (
    <Bracket
      config={config}
      height={600}
      width="100%"
      onWinnerChange={(id) => console.log('Winner:', id)}
    />
  );
}
```

---

## Component API

### `<Bracket>`

The root component. Renders a fully interactive bracket inside a ReactFlow canvas.

```tsx
import { Bracket } from 'bracketo';
```

#### Props

| Prop | Type | Default | Description |
|---|---|---|---|
| `config` | `BracketConfig` | **required** | Full bracket configuration (see below). |
| `defaultReadOnly` | `boolean` | `true` | When `true`, the bracket starts in view-only mode. Scores cannot be edited until the user clicks the mode toggle button. |
| `showMiniMap` | `boolean` | `false` | Show the ReactFlow mini-map overlay. |
| `showControls` | `boolean` | `true` | Show ReactFlow zoom/pan controls. |
| `showExportButton` | `boolean` | `true` | Show the **Export PDF** button in the toolbar. |
| `showTemplateButton` | `boolean` | `true` | Show the **Template** button in the toolbar. |
| `height` | `number \| string` | `600` | CSS height of the bracket container. |
| `width` | `number \| string` | `'100%'` | CSS width of the bracket container. |
| `onWinnerChange` | `(winnerId: string \| null) => void` | — | Called whenever the tournament winner changes. |
| `onTemplateLoad` | `(config: BracketConfig) => void` | — | Called when the user loads a template via the toolbar modal. Use this to sync external settings state. |

#### Example

```tsx
<Bracket
  config={config}
  defaultReadOnly={false}
  showMiniMap={false}
  showControls
  showExportButton
  showTemplateButton
  height="100vh"
  width="100%"
  onWinnerChange={(id) => setWinner(id)}
  onTemplateLoad={(cfg) => setSettings(cfg)}
/>
```

---

## Configuration — `BracketConfig`

All bracket behavior is controlled through a single plain-object configuration. The object is fully JSON-serializable.

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

### Field reference

#### `format` — `BracketFormat`

```ts
type BracketFormat = 'single_elimination' | 'double_elimination';
```

| Value | Description |
|---|---|
| `'single_elimination'` | One loss and you're out. Optional third-place match. |
| `'double_elimination'` | Two losses to eliminate. Includes a full losers bracket and grand final. |

---

#### `participantType` — `ParticipantType`

Controls how each slot in a match node is displayed.

```ts
type ParticipantType = 'singles' | 'couples' | 'teams';
```

| Value | Slot displays | Use case |
|---|---|---|
| `'singles'` | One player name | Tennis, chess, fighting games |
| `'couples'` | Two stacked player names | Badminton doubles, beach volleyball |
| `'teams'` | Team name | Soccer, basketball, esports |

---

#### `indicatorType` — `IndicatorType`

Controls what indicator appears alongside participant names in each match node.

```ts
type IndicatorType = 'flag' | 'photo' | 'state' | 'photo_state';
```

| Value | Displays |
|---|---|
| `'flag'` | Country flag emoji for the slot (sourced from `participant.flags`) |
| `'photo'` | Square member photo avatars side-by-side (sourced from `member.photoUrl`) |
| `'state'` | State/region text badge before each name (sourced from `member.state`) |
| `'photo_state'` | Photos on the left + state badge pinned to the right edge |

See [Indicator modes](#indicator-modes) for full details.

---

#### `participants` — `Participant[]`

Ordered list of participants. The `seed` field determines bracket placement (seed 1 is favored to meet seed 2 only in the final). See [Participant](#participant).

Non-power-of-2 counts are padded with byes automatically.

---

#### `setsToWin` — `number`

Number of sets a participant must win to win the match. Common values:

| `setsToWin` | Effective format |
|---|---|
| `1` | Best of 1 |
| `2` | Best of 3 |
| `3` | Best of 5 |

---

#### `maxSetsPerMatch` — `number`

Maximum number of sets that can be played in a single match. Controls how many score columns appear in the score modal. Use `1` for soccer, `5` or `7` for tennis.

---

#### `allowTies` — `boolean`

When `true`, a match with equal set wins is not auto-resolved. Useful for sports where draws are valid outcomes.

---

#### `thirdPlaceMatch` — `boolean`

*(Single elimination only.)* When `true`, an extra match is added between the two semifinal losers to determine third place.

---

#### `grandFinalReset` — `boolean`

*(Double elimination only.)* When `true`, if the losers bracket champion wins the grand final, a second "reset" grand final is played so the winners bracket champion has a chance to win from the winners side.

---

#### `showSeed` — `boolean`

When `true`, each participant slot displays a small seed badge (e.g., `1`, `5`) to the left of the name.

---

#### `showStatus` — `boolean`

When `true`, the match node header shows a colored status chip (Scheduled, Starting Soon, In Progress, Finished). When `false`, the location and time use the full header width.

---

## Data types

### Participant

```ts
interface Participant {
  id:       string;
  name:     string;
  seed:     number;            // 1-based ranking
  members:  TeamMember[];      // 1 for singles, 2 for couples, 5+ for teams
  flags?:   ParticipantFlag[];
}

interface TeamMember {
  id:        string;
  name:      string;
  photoUrl?: string;   // URL shown in 'photo' / 'photo_state' indicator modes
  state?:    string;   // Region label shown in 'state' / 'photo_state' indicator modes
}

interface ParticipantFlag {
  type:   'country' | 'status' | 'custom';
  value:  string;    // ISO 3166-1 alpha-2 code for 'country' (e.g. 'US', 'DE')
  label?: string;
}
```

#### Example — singles with flag

```ts
{
  id: 'p1',
  name: 'Alice Smith',
  seed: 1,
  members: [{ id: 'm1', name: 'Alice Smith', photoUrl: 'https://...', state: 'CA' }],
  flags: [{ type: 'country', value: 'US' }],
}
```

#### Example — doubles with photos

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

### Match

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
  winnerGoesTo:    MatchRef | null; // where the winner feeds next
  loserGoesTo:     MatchRef | null; // null for single elim (except with grandFinalReset)
  scheduledAt?:    number;          // Unix timestamp (ms)
  location?:       string;          // e.g. "Court A"
}

interface MatchSet {
  id:     string;
  scores: [SetScore, SetScore];   // always exactly two entries
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

### Bracket data type

```ts
interface Bracket {
  id:         string;
  config:     BracketConfig;
  matches:    Record<string, Match>;  // keyed by match.id for O(1) lookup
  winnerId:   string | null;          // overall tournament winner
  createdAt:  number;
}
```

---

## Indicator modes

The `indicatorType` config field controls what visual indicator is shown alongside participant names.

### `'flag'`

Renders a country flag emoji for the whole slot. Flags are derived from ISO 3166-1 alpha-2 country codes stored in `participant.flags`.

```
[🇺🇸] Alice Smith
[🇩🇪] Bob Müller
```

### `'photo'`

Renders square avatar images side-by-side, one per member. For couples/doubles, two avatars appear. Falls back to an initial-letter placeholder when `photoUrl` is absent.

```
[▪▪] Alice Smith        (two avatars for couples)
```

Photo sizing: avatars fill the full height of the slot row automatically and are always square (`aspect-ratio: 1/1`).

### `'state'`

Renders a small text badge before each member name.

```
[CA] Alice Smith
[TX] Bob Jones
```

For couples, each stacked name gets its own badge from `member.state`.

### `'photo_state'`

Combines both: photos on the left and the state badge pinned to the right end of the row.

```
[▪] Alice Smith ─────────────── [CA]
```

---

## Match status system

Each match node header shows a live status chip. Status is derived automatically from a combination of the match's game state and its scheduled time.

```ts
type StatusVariant = 'scheduled' | 'soon' | 'live' | 'done' | 'bye';
```

### Status derivation rules (priority order)

| Condition | Label | Color |
|---|---|---|
| `match.status === 'completed'` | **Finished** | Blue |
| `match.status === 'in_progress'` (scores entered) | **In Progress** | Green |
| `scheduledAt` set and `now >= scheduledAt` | **In Progress** | Green |
| `scheduledAt` set and `now >= scheduledAt − 15 min` | **Starting Soon** | Amber |
| `scheduledAt` set and more than 15 min away | **Scheduled** | Gray |
| No `scheduledAt`, status `pending` | **Scheduled** | Gray |

The status updates automatically every 30 seconds inside the match node.

Toggle visibility with `showStatus: false` in `BracketConfig`. When the status chip is hidden, the location/time uses the full header width.

---

## Scoring

### How scoring works

Each match contains an array of `MatchSet` objects. Each set holds two `SetScore` entries — one per participant slot.

After every score update:
1. The library counts how many sets each participant has won.
2. If a participant reaches `setsToWin`, they are declared the winner.
3. The winner automatically advances to the next match (`winnerGoesTo`).
4. In double elimination, the loser automatically moves to the losers bracket (`loserGoesTo`).

### Editing scores

In edit mode (toggle the lock button in the toolbar), a pencil button appears on every non-bye match. Clicking it opens the **Score Modal** where you can:

- Set the score for each set independently.
- Add or remove sets (up to `maxSetsPerMatch`).
- Reset the match back to pending.
- Set the match location and scheduled date/time.

### Supported sport configurations

| Sport | `setsToWin` | `maxSetsPerMatch` | `allowTies` |
|---|---|---|---|
| Soccer | 1 | 1 | `true` |
| Tennis | 2 | 5 | `false` |
| Badminton | 2 | 3 | `false` |
| Fighting games | 2 | 3 | `false` |
| Volleyball | 3 | 5 | `false` |

---

## Match scheduling

Each match can be assigned a location and a scheduled start time. These are stored on the `Match` object and are editable via the Score Modal in edit mode.

```ts
// Fields on Match
scheduledAt?: number;   // Unix ms timestamp
location?:    string;   // Free text, e.g. "Court A", "Field 3"
```

The node header displays these as `Court A · 14:30` (time shown as local time, shortened to HH:MM if the match is today, or `Mar 25 · 14:30` for a different day).

### Setting schedules programmatically

```ts
const store = createBracket(config);

store.getState().setMatchSchedule(
  matchId,
  new Date('2026-06-01T15:00:00').getTime(),  // scheduledAt (ms)
  'Centre Court',                              // location
);
```

---

## Winning path highlight

Clicking a participant's name in any match node highlights their entire path through the bracket — all matches they've played or will play are outlined in amber, and the connecting edges are animated in gold.

Click the same participant again, or click anywhere on the canvas, to clear the highlight.

---

## Template system

Templates capture the full `BracketConfig` (settings + participants) as a compact JSON string, ready to store in any document database (MongoDB, Firestore, DynamoDB, etc.).

### Save a template

Use the **Template** button in the toolbar (or call the utility directly):

```ts
import { serializeTemplate } from 'bracketo';

const json = serializeTemplate(config, 'FGC Double Elim 8');
// → compact JSON string, e.g.:
// {"version":1,"name":"FGC Double Elim 8","createdAt":1742940000000,"config":{...}}
```

Store `json` in your database as a plain string field.

### Load a template

```ts
import { deserializeTemplate, TemplateParseError } from 'bracketo';

try {
  const template = deserializeTemplate(json);
  // template.config  → BracketConfig
  // template.name    → string
  // template.version → 1
  // template.createdAt → number (unix ms)
} catch (err) {
  if (err instanceof TemplateParseError) {
    console.error(err.message);
  }
}
```

### Template format

```ts
interface BracketTemplate {
  version:    1;           // Schema version for future migrations
  name:       string;
  createdAt:  number;      // Unix ms timestamp
  config:     BracketConfig;
}
```

### React integration

```tsx
<Bracket
  config={config}
  onTemplateLoad={(loadedConfig) => {
    // Sync your local settings state when a template is loaded via the toolbar
    setSettings(loadedConfig);
  }}
/>
```

---

## PDF export

Click the **Export PDF** button in the toolbar. The library:

1. Calls `reactflow.fitView()` to ensure all nodes are visible.
2. Captures the bracket canvas at 2× scale with `html2canvas`.
3. Sizes the page automatically (A4 or A3, landscape).
4. Downloads a `bracket.pdf` file via `jsPDF`.

`html2canvas` and `jsPDF` are lazy-loaded on first export to keep the initial bundle small.

### Programmatic export

```ts
import { usePdfExport } from 'bracketo';

function ExportButton() {
  const { exportToPdf, isExporting } = usePdfExport();
  return (
    <button onClick={exportToPdf} disabled={isExporting}>
      {isExporting ? 'Exporting…' : 'Export PDF'}
    </button>
  );
}
```

---

## Headless usage (store API)

Use the store directly without the `<Bracket>` component when you need full control over rendering or state.

### Create a bracket

```ts
import { createBracket } from 'bracketo';

const store = createBracket(config);
// store is a Zustand store instance
```

### Read state

```ts
const { bracket, highlightedMatchIds } = store.getState();

bracket.matches       // Record<string, Match>
bracket.winnerId      // string | null
bracket.config        // BracketConfig
```

### Actions

```ts
const state = store.getState();

// Update a score
state.updateScore(matchId, setIndex, slot, score);
// matchId:  string
// setIndex: number  (0-based)
// slot:     0 | 1   (top = 0, bottom = 1)
// score:    number

// Add / remove a set
state.addSet(matchId);
state.removeSet(matchId, setIndex);

// Override winner manually
state.overrideWinner(matchId, participantId);

// Reset a match to pending
state.resetMatch(matchId);

// Set match schedule
state.setMatchSchedule(matchId, scheduledAt, location);
// scheduledAt: number | undefined  (Unix ms)
// location:    string | undefined

// Highlight a participant's path
state.setHighlightPath(participantId);
state.setHighlightPath(null);  // clear
```

### React + headless

```tsx
import { createBracketStore, BracketProvider, useBracketStore } from 'bracketo';
import { useMemo } from 'react';

function App() {
  const store = useMemo(() => {
    const s = createBracketStore();
    s.getState().initBracket(config);
    return s;
  }, []);

  return (
    <BracketProvider store={store}>
      <MyCustomBracketUI />
    </BracketProvider>
  );
}

function MyCustomBracketUI() {
  const matches = useBracketStore((s) => s.bracket?.matches);
  const updateScore = useBracketStore((s) => s.updateScore);
  // ...
}
```

### Multiple brackets on one page

Each `<Bracket>` (and each `createBracketStore()`) creates a fully isolated store. State never leaks between instances.

```tsx
<div>
  <Bracket config={configA} height={400} />
  <Bracket config={configB} height={400} />
</div>
```

---

## Hooks

### `useBracket()`

High-level hook for accessing bracket state and actions from inside a `<BracketProvider>`.

```ts
import { useBracket } from 'bracketo';

const {
  bracket,                 // Bracket | null
  winnerId,                // string | null
  highlightedParticipantId, // string | null
  init,                    // (config: BracketConfig) => void
  updateScore,             // (matchId, setIndex, slot, score) => void
  overrideWinner,          // (matchId, participantId) => void
  resetMatch,              // (matchId) => void
  setHighlightPath,        // (participantId | null) => void
} = useBracket();
```

### `usePdfExport()`

```ts
import { usePdfExport } from 'bracketo';

const { exportToPdf, isExporting } = usePdfExport();
```

Must be used inside a `<BracketProvider>` (i.e., inside or below a `<Bracket>`).

### `useBracketStore(selector)`

Low-level selector hook — follows the Zustand pattern for fine-grained subscriptions.

```ts
import { useBracketStore } from 'bracketo';

// Only re-renders when winnerId changes
const winnerId = useBracketStore((s) => s.bracket?.winnerId ?? null);

// Only re-renders when a specific match changes
const match = useBracketStore((s) => s.bracket?.matches[matchId]);
```

---

## Theming

All visual tokens are exposed as CSS custom properties on `:root`. Override them in your own stylesheet after importing `bracketo/dist/bracketo.css`.

```css
/* Example: swap to a light theme */
:root {
  --bracketo-bg:          #f8fafc;
  --bracketo-card-bg:     #ffffff;
  --bracketo-card-border: #e2e8f0;
  --bracketo-text:        #0f172a;
  --bracketo-text-muted:  #94a3b8;
  --bracketo-text-subtle: #64748b;
}
```

### Full token reference

#### Surfaces

| Token | Default | Use |
|---|---|---|
| `--bracketo-bg` | `#0f172a` | Canvas background |
| `--bracketo-card-bg` | `#1e293b` | Match node background |
| `--bracketo-card-bg-hover` | `#243347` | Match node hover |
| `--bracketo-card-border` | `#334155` | Match node border |
| `--bracketo-card-radius` | `10px` | Match node corner radius |

#### Text

| Token | Default | Use |
|---|---|---|
| `--bracketo-text` | `#e2e8f0` | Primary text |
| `--bracketo-text-muted` | `#64748b` | Secondary / label text |
| `--bracketo-text-subtle` | `#94a3b8` | De-emphasized text |

#### Winner slot

| Token | Default | Use |
|---|---|---|
| `--bracketo-winner-bg` | `#172554` | Winner slot background |
| `--bracketo-winner-border` | `#1e40af` | Winner slot border |
| `--bracketo-winner-text` | `#93c5fd` | Winner name text |
| `--bracketo-winner-accent` | `#3b82f6` | Winner check icon |

#### Highlight path

| Token | Default | Use |
|---|---|---|
| `--bracketo-highlight` | `#f59e0b` | Highlighted node border / edge color |
| `--bracketo-highlight-glow` | `rgba(245,158,11,0.2)` | Highlighted node glow |

#### Edges & handles

| Token | Default | Use |
|---|---|---|
| `--bracketo-edge` | `#334155` | Default edge color |
| `--bracketo-handle` | `#475569` | Connection handle dots |

#### Scores

| Token | Default | Use |
|---|---|---|
| `--bracketo-score-bg` | `#0f172a` | Score pill background |
| `--bracketo-score-border` | `#334155` | Score pill border |
| `--bracketo-score-winner-bg` | `#1e3a5f` | Winner score pill background |
| `--bracketo-score-winner-text` | `#60a5fa` | Winner score pill text |

#### Toolbar & buttons

| Token | Default | Use |
|---|---|---|
| `--bracketo-export-bg` | `#3b82f6` | Export / primary button background |
| `--bracketo-export-hover` | `#2563eb` | Export / primary button hover |
| `--bracketo-mode-view-bg` | `#1e293b` | View mode button background |
| `--bracketo-mode-edit-bg` | `#1a2e1a` | Edit mode button background |
| `--bracketo-mode-edit-text` | `#4ade80` | Edit mode button text |

#### Modals

| Token | Default | Use |
|---|---|---|
| `--bracketo-modal-bg` | `#1e293b` | Modal background |
| `--bracketo-modal-border` | `#334155` | Modal border |
| `--bracketo-modal-radius` | `14px` | Modal corner radius |
| `--bracketo-modal-overlay` | `rgba(0,0,0,0.7)` | Backdrop overlay |

---

## Algorithms

### Seeding

Bracket positions are assigned using a recursive seed ordering that guarantees top seeds can only meet in later rounds.

```
buildSeedOrder(8) → [1, 8, 4, 5, 2, 7, 3, 6]
```

- Seed 1 is always in the top half.
- Seed 2 is always in the bottom half.
- Seeds 1 and 2 can only meet in the final.

Non-power-of-2 participant counts are padded with byes. Bye matches are auto-resolved immediately, advancing the real participant.

### Single elimination

1. `bracketSize = nextPowerOf2(n)`, `byeCount = bracketSize − n`.
2. Seed positions are mapped to participants; highest seeds receive byes.
3. Round 0 matches are built. Bye matches are auto-resolved.
4. Each subsequent round is wired via `winnerGoesTo`.
5. If `thirdPlaceMatch: true`, an additional match connects the two semifinal losers.

### Double elimination

1. The winners bracket is built identically to single elimination (without third-place).
2. A losers bracket is constructed in alternating phases:
   - **Drop-in round**: winners bracket losers are seeded into the losers bracket.
   - **Internal round**: the losers bracket plays among itself (mirrored pairings to prevent immediate rematches).
3. The final winners bracket match and final losers bracket match feed into the grand final.
4. If `grandFinalReset: true`, a second reset match is available if the losers bracket champion wins.

All `loserGoesTo` references on winners bracket matches (including the winners final) are set automatically.

---

## Build output

| File | Format | Description |
|---|---|---|
| `dist/bracketo.es.js` | ES module | For bundlers (Vite, webpack, etc.) |
| `dist/bracketo.umd.js` | UMD | For CDN / non-module environments |
| `dist/index.d.ts` | TypeScript | Full type declarations |
| `dist/bracketo.css` | CSS | All styles in one file |

Bundled: `zustand`, `immer`, `html2canvas` (lazy), `jsPDF` (lazy).
Externalized (peer deps): `react`, `react-dom`, `react/jsx-runtime`, `@xyflow/react`.
