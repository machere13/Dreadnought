export interface HistoryState<T> {
  readonly past: readonly T[];
  readonly present: T;
  readonly future: readonly T[];
}

export type HistoryAction<T> =
  { type: 'commit' | 'replace' | 'reset'; value: T } | { type: 'undo' | 'redo' };
export interface HistoryOptions {
  limit?: number;
}

export function getHistoryState<T>(
  state: HistoryState<T>,
  action: HistoryAction<T>,
  options: HistoryOptions = {},
): HistoryState<T> {
  if (
    !state ||
    !Array.isArray(state.past) ||
    !Array.isArray(state.future) ||
    !Object.hasOwn(state, 'present')
  ) {
    throw new TypeError('History state requires past, present and future');
  }
  if (
    !action ||
    !['commit', 'replace', 'reset', 'undo', 'redo'].includes(action.type) ||
    (['commit', 'replace', 'reset'].includes(action.type) && !Object.hasOwn(action, 'value'))
  ) {
    throw new TypeError('Invalid history action');
  }
  if (!options || typeof options !== 'object') {
    throw new TypeError('History options must be an object');
  }
  const limit = options.limit === undefined ? 100 : options.limit;
  if (!Number.isSafeInteger(limit) || limit <= 0) {
    throw new RangeError('History limit must be a positive safe integer');
  }
  const { past, present, future } = state;
  switch (action.type) {
    case 'commit':
      return { past: [...past, present].slice(-limit), present: action.value, future: [] };
    case 'replace':
      return { past: past.slice(-limit), present: action.value, future: future.slice(0, limit) };
    case 'reset':
      return { past: [], present: action.value, future: [] };
    case 'undo':
      return past.length
        ? {
            past: past.slice(0, -1).slice(-limit),
            present: past[past.length - 1]!,
            future: [present, ...future].slice(0, limit),
          }
        : state;
    case 'redo':
      return future.length
        ? {
            past: [...past, present].slice(-limit),
            present: future[0]!,
            future: future.slice(1, limit + 1),
          }
        : state;
  }
}
