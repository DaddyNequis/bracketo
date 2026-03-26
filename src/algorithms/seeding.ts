/**
 * Builds the canonical seed slot ordering for a bracket of the given power-of-2 size.
 *
 * Example: buildSeedOrder(8) → [1, 8, 5, 4, 3, 6, 7, 2]
 *
 * This guarantees:
 *  - Seed 1 and Seed 2 can only meet in the final
 *  - Seed 1 and Seeds 3/4 can only meet in the semis
 *  - etc.
 */
export function buildSeedOrder(size: number): number[] {
  if (size === 1) return [1];
  const half = size / 2;
  const top = buildSeedOrder(half);
  // Each position i in the top half is paired with its mirror: size + 1 - seed
  return top.flatMap((seed) => [seed, size + 1 - seed]);
}

/**
 * Maps a seed-ordered slot list to actual participant indices (0-based).
 * Slots beyond participantCount are byes (returned as null).
 */
export function slotsFromSeeds(
  seedOrder: number[],
  participantCount: number,
): (number | null)[] {
  return seedOrder.map((seed) => (seed <= participantCount ? seed - 1 : null));
}
