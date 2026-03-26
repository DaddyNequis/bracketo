# Bracketo

Interactive tournament brackets for React. Single and double elimination, multi-sport scoring, scheduling, path highlighting, PDF export, and serializable templates — all in one component.

Built on [@xyflow/react](https://reactflow.dev/), [Zustand](https://github.com/pmndrs/zustand), and [Immer](https://immerjs.github.io/immer/).

<img width="791" height="469" alt="image" src="https://github.com/user-attachments/assets/5ff62796-67d5-472b-a094-37d0de870c55" />


---

## Installation

```bash
npm install bracketo
```

You'll also need these peer deps if you don't have them already:

```bash
npm install react react-dom @xyflow/react
```

| Package | Version |
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
    { id: 'p1', name: 'Alice', seed: 1, members: [{ id: 'm1', name: 'Alice' }], flags: [{ type: 'country', value: 'US' }] },
    { id: 'p2', name: 'Bob',   seed: 2, members: [{ id: 'm2', name: 'Bob' }],   flags: [{ type: 'country', value: 'DE' }] },
    { id: 'p3', name: 'Carol', seed: 3, members: [{ id: 'm3', name: 'Carol' }], flags: [{ type: 'country', value: 'BR' }] },
    { id: 'p4', name: 'Dave',  seed: 4, members: [{ id: 'm4', name: 'Dave' }],  flags: [{ type: 'country', value: 'JP' }] },
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

## `<Bracket>` props

| Prop | Type | Default | Description |
|---|---|---|---|
| `config` | `BracketConfig` | **required** | Full bracket configuration. |
| `defaultReadOnly` | `boolean` | `true` | Start in view-only mode. Users click the lock button to enter edit mode. |
| `showMiniMap` | `boolean` | `false` | Show the ReactFlow mini-map. |
| `showControls` | `boolean` | `true` | Show zoom/pan controls. |
| `showExportButton` | `boolean` | `true` | Show the Export PDF button. |
| `showTemplateButton` | `boolean` | `true` | Show the Template button. |
| `height` | `number \| string` | `600` | Container height. |
| `width` | `number \| string` | `'100%'` | Container width. |
| `onWinnerChange` | `(winnerId: string \| null) => void` | — | Fires when the tournament winner changes. |
| `onTemplateLoad` | `(config: BracketConfig) => void` | — | Fires when the user loads a template. Use this to sync your local config state. |

```tsx
<Bracket
  config={config}
  defaultReadOnly={false}
  height="100vh"
  width="100%"
  onWinnerChange={(id) => setWinner(id)}
  onTemplateLoad={(cfg) => setSettings(cfg)}
/>
```

---

## Docs

- [Configuration](docs/configuration.md) — all `BracketConfig` fields explained
- [Data types](docs/data-types.md) — `Participant`, `Match`, `Bracket`
- [Indicators](docs/indicators.md) — flags, photos, state badges
- [Scoring & scheduling](docs/scoring.md) — how scoring works, sport presets, match scheduling
- [Features](docs/features.md) — winning path highlight, templates, PDF export
- [Headless / store API](docs/headless.md) — using the Zustand store directly, hooks reference
- [Theming](docs/theming.md) — CSS custom properties
- [Algorithms](docs/algorithms.md) — seeding and bracket construction

---

## Build output

| File | Format |
|---|---|
| `dist/bracketo.es.js` | ES module (Vite, webpack, etc.) |
| `dist/bracketo.umd.js` | UMD (CDN / non-module) |
| `dist/index.d.ts` | TypeScript declarations |
| `dist/bracketo.css` | All styles |

Bundled: `zustand`, `immer`, `html2canvas` (lazy), `jsPDF` (lazy).
Externalized: `react`, `react-dom`, `react/jsx-runtime`, `@xyflow/react`.
