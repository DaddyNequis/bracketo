# Algorithms

How Bracketo builds and wires brackets under the hood.

---

## Seeding

Bracket positions are assigned using recursive seed ordering so top seeds only meet in later rounds.

```
buildSeedOrder(8) → [1, 8, 4, 5, 2, 7, 3, 6]
```

- Seed 1 is always in the top half.
- Seed 2 is always in the bottom half.
- Seeds 1 and 2 can only meet in the final.

Non-power-of-2 participant counts are padded with byes. The highest seeds always receive byes (so the top seed never plays a bye match in round 1 unless the count requires it). Bye matches are auto-resolved immediately.

---

## Single elimination

1. `bracketSize = nextPowerOf2(n)`, `byeCount = bracketSize − n`
2. Seed positions are mapped to participants; highest seeds get byes.
3. Round 0 matches are built. Bye matches are auto-resolved.
4. Each subsequent round is wired via `winnerGoesTo` on each match.
5. If `thirdPlaceMatch: true`, an extra match connects the two semifinal losers.

---

## Double elimination

1. The winners bracket is built the same way as single elimination (no third-place match).
2. A losers bracket is built in alternating phases:
   - **Drop-in round** — losers from the winners bracket are seeded into the losers bracket.
   - **Internal round** — the losers bracket plays within itself (mirrored pairings to avoid immediate rematches).
3. The final winners bracket match and the final losers bracket match both feed into the grand final.
4. If `grandFinalReset: true`, a second reset match is available in case the losers side wins.

All `loserGoesTo` references on winners bracket matches (including the winners final) are set automatically during construction.
