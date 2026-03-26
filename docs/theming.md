# Theming

All visual tokens are CSS custom properties on `:root`. Import `bracketo/dist/bracketo.css` first, then override whatever you need in your own stylesheet.

```css
/* swap to a light theme */
:root {
  --bracketo-bg:          #f8fafc;
  --bracketo-card-bg:     #ffffff;
  --bracketo-card-border: #e2e8f0;
  --bracketo-text:        #0f172a;
  --bracketo-text-muted:  #94a3b8;
  --bracketo-text-subtle: #64748b;
}
```

<!-- screenshot: light theme example -->

---

## Token reference

### Surfaces

| Token | Default | Used for |
|---|---|---|
| `--bracketo-bg` | `#0f172a` | Canvas background |
| `--bracketo-card-bg` | `#1e293b` | Match node background |
| `--bracketo-card-bg-hover` | `#243347` | Match node hover |
| `--bracketo-card-border` | `#334155` | Match node border |
| `--bracketo-card-radius` | `10px` | Match node corner radius |

### Text

| Token | Default | Used for |
|---|---|---|
| `--bracketo-text` | `#e2e8f0` | Primary text |
| `--bracketo-text-muted` | `#64748b` | Secondary / label text |
| `--bracketo-text-subtle` | `#94a3b8` | De-emphasized text |

### Winner slot

| Token | Default | Used for |
|---|---|---|
| `--bracketo-winner-bg` | `#172554` | Winner slot background |
| `--bracketo-winner-border` | `#1e40af` | Winner slot border |
| `--bracketo-winner-text` | `#93c5fd` | Winner name text |
| `--bracketo-winner-accent` | `#3b82f6` | Winner checkmark icon |

### Highlight path

| Token | Default | Used for |
|---|---|---|
| `--bracketo-highlight` | `#f59e0b` | Highlighted node border / edge color |
| `--bracketo-highlight-glow` | `rgba(245,158,11,0.2)` | Node glow |

### Edges & handles

| Token | Default | Used for |
|---|---|---|
| `--bracketo-edge` | `#334155` | Default edge color |
| `--bracketo-handle` | `#475569` | Connection handle dots |

### Scores

| Token | Default | Used for |
|---|---|---|
| `--bracketo-score-bg` | `#0f172a` | Score pill background |
| `--bracketo-score-border` | `#334155` | Score pill border |
| `--bracketo-score-winner-bg` | `#1e3a5f` | Winner score pill background |
| `--bracketo-score-winner-text` | `#60a5fa` | Winner score pill text |

### Toolbar & buttons

| Token | Default | Used for |
|---|---|---|
| `--bracketo-export-bg` | `#3b82f6` | Export / primary button background |
| `--bracketo-export-hover` | `#2563eb` | Export / primary button hover |
| `--bracketo-mode-view-bg` | `#1e293b` | View mode button background |
| `--bracketo-mode-edit-bg` | `#1a2e1a` | Edit mode button background |
| `--bracketo-mode-edit-text` | `#4ade80` | Edit mode button text |

### Modals

| Token | Default | Used for |
|---|---|---|
| `--bracketo-modal-bg` | `#1e293b` | Modal background |
| `--bracketo-modal-border` | `#334155` | Modal border |
| `--bracketo-modal-radius` | `14px` | Modal corner radius |
| `--bracketo-modal-overlay` | `rgba(0,0,0,0.7)` | Backdrop overlay |
