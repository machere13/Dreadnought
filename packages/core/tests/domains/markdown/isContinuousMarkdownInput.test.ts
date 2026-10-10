import { expect, it } from 'vitest';
import { isContinuousMarkdownInput } from '../../../src/domains/markdown/isContinuousMarkdownInput.ts';

it.each([
  ['insertText', 'ab', 1, 'axb', 2, true],
  ['insertText', 'ab', 1, 'axb', 1, false],
  ['insertText', 'ab', 1, 'axy', 2, false],
  ['deleteContentBackward', 'abc', 2, 'ac', 1, true],
  ['deleteContentForward', 'abc', 1, 'ac', 1, true],
  ['deleteContentBackward', 'abc', 0, 'bc', 0, false],
  ['insertFromPaste', 'ab', 1, 'axb', 2, false],
] as const)(
  'groups only adjacent %s edits from %s to %s',
  (type, before, start, after, end, expected) => {
    expect(
      isContinuousMarkdownInput(
        type,
        { text: before, selection: { start, end: start } },
        { text: after, selection: { start: end, end } },
      ),
    ).toBe(expected);
  },
);

it('never groups replacement of a selection', () => {
  expect(
    isContinuousMarkdownInput(
      'insertText',
      { text: 'abc', selection: { start: 1, end: 2 } },
      { text: 'axc', selection: { start: 2, end: 2 } },
    ),
  ).toBe(false);
});
