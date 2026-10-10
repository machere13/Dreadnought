import { getHistoryState } from '@dreadnought/core';
import type { HistoryState, MarkdownDocument, MarkdownSelection } from '@dreadnought/core';

export const sameSelection = (a: MarkdownSelection, b: MarkdownSelection) =>
  a.start === b.start && a.end === b.end;
export const snapshot = (text: string, selection: MarkdownSelection): MarkdownDocument => ({
  text,
  selection: { ...selection },
});
export const baseline = (document: MarkdownDocument): HistoryState<MarkdownDocument> => ({
  past: [],
  present: document,
  future: [],
});

export function recordDocument(
  state: HistoryState<MarkdownDocument>,
  document: MarkdownDocument,
  replace: boolean,
  limit: number,
) {
  return getHistoryState(
    state,
    {
      type: replace || state.present.text === document.text ? 'replace' : 'commit',
      value: document,
    },
    { limit },
  );
}
