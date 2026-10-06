export function getCountdownRemaining(remaining: number, elapsed: number): number {
  if (!Number.isFinite(remaining) || remaining < 0 || !Number.isFinite(elapsed) || elapsed < 0) {
    throw new RangeError('Countdown values must be finite and nonnegative.');
  }
  return Math.max(0, remaining - elapsed);
}
