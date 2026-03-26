# Headless usage & hooks

If you want full control over rendering or need to drive bracket state from your own code, you can skip `<Bracket>` entirely and use the store directly.

---

## Creating a store

```ts
import { createBracket } from 'bracketo';

const store = createBracket(config);
// store is a standard Zustand store
```

---

## Reading state

```ts
const { bracket, highlightedMatchIds } = store.getState();

bracket.matches       // Record<string, Match>
bracket.winnerId      // string | null
bracket.config        // BracketConfig
```

---

## Actions

```ts
const state = store.getState();

// Update a score
// setIndex: 0-based | slot: 0 = top, 1 = bottom
state.updateScore(matchId, setIndex, slot, score);

// Add or remove sets
state.addSet(matchId);
state.removeSet(matchId, setIndex);

// Override winner manually
state.overrideWinner(matchId, participantId);

// Reset a match back to pending
state.resetMatch(matchId);

// Set schedule
// scheduledAt: Unix ms | undefined
state.setMatchSchedule(matchId, scheduledAt, location);

// Highlight a participant's path through the bracket
state.setHighlightPath(participantId);
state.setHighlightPath(null);  // clear
```

---

## React + headless

Use `BracketProvider` to make the store available to a component tree, then access it with `useBracketStore`:

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

---

## Multiple brackets on one page

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
  bracket,
  winnerId,
  highlightedParticipantId,
  init,
  updateScore,
  overrideWinner,
  resetMatch,
  setHighlightPath,
} = useBracket();
```

### `usePdfExport()`

```ts
import { usePdfExport } from 'bracketo';

const { exportToPdf, isExporting } = usePdfExport();
```

Must be used inside a `<BracketProvider>`. See [PDF export](features.md#pdf-export) for usage.

### `useBracketStore(selector)`

Low-level selector hook — follows the standard Zustand pattern. Good for fine-grained subscriptions that only re-render when a specific slice of state changes.

```ts
import { useBracketStore } from 'bracketo';

// Re-renders only when winnerId changes
const winnerId = useBracketStore((s) => s.bracket?.winnerId ?? null);

// Re-renders only when a specific match changes
const match = useBracketStore((s) => s.bracket?.matches[matchId]);
```
