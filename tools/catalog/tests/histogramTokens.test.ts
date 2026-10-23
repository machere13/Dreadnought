import { expect, it } from 'vitest';
import { readComponentTokens } from '../src/tokens.mjs';

it('resolves Histogram to the shared BarChart theme instead of requiring duplicate CSS', () => {
  const histogram = readComponentTokens(process.cwd(), 'Visualization', 'Histogram');
  expect(histogram.length).toBeGreaterThan(0);
  expect(histogram).toEqual(readComponentTokens(process.cwd(), 'Visualization', 'BarChart'));
});
