# Indicators

The `indicatorType` config field controls the visual indicator shown alongside participant names in each match node. Pick the one that fits your sport or event.

---

## `'flag'`

Shows a country flag emoji for the slot, derived from the ISO 3166-1 alpha-2 code in `participant.flags`.

```
[🇺🇸] Alice Smith
[🇩🇪] Bob Müller
```

<!-- screenshot: flag indicator mode -->

---

## `'photo'`

Renders square avatar images side-by-side — one per member. For doubles, two avatars appear next to each other. Falls back to an initials placeholder when `photoUrl` is missing.

```
[▪▪] Smith / Jones     ← two avatars for a doubles pair
[▪]  Alice Smith       ← single avatar for singles
```

Avatars fill the full height of the slot row and are always square (`aspect-ratio: 1/1`).

<!-- screenshot: photo indicator mode -->

---

## `'state'`

Shows a small text badge before each member's name, pulled from `member.state`.

```
[CA] Alice Smith
[TX] Bob Jones
```

For doubles/couples, each stacked name gets its own badge.

<!-- screenshot: state indicator mode -->

---

## `'photo_state'`

Combines photos and state — avatar on the left, state badge pinned to the right edge of the row.

```
[▪] Alice Smith ─────────────── [CA]
```

<!-- screenshot: photo_state indicator mode -->

---

## Setting up participant data

For flags, set `participant.flags`:

```ts
flags: [{ type: 'country', value: 'US' }]
```

For photos and state badges, set them on each `TeamMember`:

```ts
members: [
  { id: 'm1', name: 'Alice Smith', photoUrl: 'https://...', state: 'CA' },
]
```

See [Data types](data-types.md#participant) for the full shapes.
