/** Returns the smallest power of 2 >= n */
export function nextPowerOf2(n: number): number {
  if (n <= 1) return 1;
  let p = 1;
  while (p < n) p <<= 1;
  return p;
}

/** Integer log base 2 (only valid for exact powers of 2) */
export function log2(n: number): number {
  return Math.log2(n) | 0;
}

export function generateId(): string {
  return crypto.randomUUID();
}
