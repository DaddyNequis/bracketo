# Features

---

## Winning path highlight

Click any participant's name in the bracket to highlight their full path — every match they've played or are heading toward gets an amber outline, and the connecting edges animate in gold.

Click the same participant again, or anywhere on the canvas, to clear it.

<!-- screenshot: winning path highlighted in amber -->

---

## Templates

Templates let you snapshot the full `BracketConfig` — settings and participants — as a compact JSON string. Store it anywhere: MongoDB, Firestore, DynamoDB, localStorage, wherever.

### Saving a template

Use the **Template** button in the toolbar, or call the utility directly:

```ts
import { serializeTemplate } from 'bracketo';

const json = serializeTemplate(config, 'FGC Double Elim 8');
// → compact JSON string:
// {"version":1,"name":"FGC Double Elim 8","createdAt":1742940000000,"config":{...}}
```

Store `json` as a plain string field in your database.

### Loading a template

```ts
import { deserializeTemplate, TemplateParseError } from 'bracketo';

try {
  const template = deserializeTemplate(json);
  // template.config    → BracketConfig
  // template.name      → string
  // template.version   → 1
  // template.createdAt → number (unix ms)
} catch (err) {
  if (err instanceof TemplateParseError) {
    console.error(err.message);
  }
}
```

### Template shape

```ts
interface BracketTemplate {
  version:    1;
  name:       string;
  createdAt:  number;
  config:     BracketConfig;
}
```

### Syncing with React state

When a user loads a template through the toolbar UI, use `onTemplateLoad` to sync it back into your own state:

```tsx
<Bracket
  config={config}
  onTemplateLoad={(loadedConfig) => setSettings(loadedConfig)}
/>
```

<!-- screenshot: template modal -->

---

## PDF export

Click the **Export PDF** button in the toolbar. Here's what happens under the hood:

1. `reactflow.fitView()` is called so every node is visible.
2. The bracket canvas is captured at 2× scale using `html2canvas`.
3. The page size is picked automatically (A4 or A3, landscape).
4. A `bracket.pdf` is downloaded via `jsPDF`.

`html2canvas` and `jsPDF` are lazy-loaded on first export so they don't bloat your initial bundle.

### Triggering export from your own UI

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

`usePdfExport` must be used inside a `<BracketProvider>` (i.e., somewhere inside or below a `<Bracket>`).
