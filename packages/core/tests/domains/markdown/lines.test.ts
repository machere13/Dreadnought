import { describe, expect, it } from 'vitest';
import { applyMarkdownCommand } from '../../../src/index.ts';
import type { MarkdownCommand } from '../../../src/index.ts';

describe('Markdown line commands', () => {
  it.each([
    ['1. a', 4, { type: 'newLine' }, '1. a\n2. ', 8],
    ['- [x] a', 7, { type: 'newLine' }, '- [x] a\n- [ ] ', 14],
    ['- ', 2, { type: 'newLine' }, '\n', 1],
    ['- ', 1, { type: 'newLine' }, '\n', 1],
    ['- [x] ', 2, { type: 'newLine' }, '\n', 1],
    ['  a', 3, { type: 'newLine' }, '  a\n  ', 6],
    ['a\r\nb', 4, { type: 'newLine' }, 'a\r\nb\r\n', 6],
  ] as const)('continues %s', (text, offset, command, expected, cursor) => {
    expect(applyMarkdownCommand({ text, selection: { start: offset, end: offset } }, command))
      .toEqual({ text: expected, selection: { start: cursor, end: cursor } });
  });

  it.each([
    ['a\nb', 0, 2, { type: 'indent' }, '  a\nb', 2, 4],
    ['  a\r\n\tb', 2, 7, { type: 'outdent' }, 'a\r\nb', 0, 4],
    ['a\nb', 2, 3, { type: 'duplicateLines' }, 'a\nb\nb', 2, 3],
    ['a\nb\n', 2, 3, { type: 'duplicateLines' }, 'a\nb\nb\n', 2, 3],
    ['a\nb', 2, 3, { type: 'moveLines', direction: 'previous' }, 'b\na', 0, 1],
    ['a\nb\n', 0, 1, { type: 'moveLines', direction: 'next' }, 'b\na\n', 2, 3],
    ['a\r\nb\nc', 3, 4, { type: 'moveLines', direction: 'previous' }, 'b\r\na\nc', 0, 1],
    ['a\r\nb', 2, 2, { type: 'moveLines', direction: 'next' }, 'b\r\na', 4, 4],
    ['a\r\nb\nc', 0, 3, { type: 'moveLines', direction: 'next' }, 'b\r\na\nc', 3, 5],
    ['a\nb\nc\nd', 2, 5, { type: 'moveLines', direction: 'next' }, 'a\nd\nb\nc', 4, 7],
    ['abc', 1, 2, { type: 'newLine' }, 'a\nc', 2, 2],
    ['a', 0, 1, { type: 'moveLines', direction: 'previous' }, 'a', 0, 1],
    ['a', 0, 1, { type: 'moveLines', direction: 'next' }, 'a', 0, 1],
  ] as const)('transforms %s with %j', (text, start, end, command, expected, nextStart, nextEnd) => {
    const input = Object.freeze({ text, selection: Object.freeze({ start, end }) });
    expect(applyMarkdownCommand(input, command)).toEqual({ text: expected, selection: { start: nextStart, end: nextEnd } });
    expect(input).toEqual({ text, selection: { start, end } });
  });

  it.each([0, 17, 1.5, NaN, Infinity])('rejects indent size %s', size => {
    expect(() => applyMarkdownCommand({ text: '', selection: { start: 0, end: 0 } }, { type: 'indent', size })).toThrow(RangeError);
  });

  it('rejects invalid runtime parameters', () => {
    const doc = { text: '', selection: { start: 0, end: 0 } };
    expect(() => applyMarkdownCommand(doc, { type: 'outdent', size: '2' } as unknown as MarkdownCommand)).toThrow(TypeError);
    expect(() => applyMarkdownCommand(doc, { type: 'moveLines', direction: 'up' } as unknown as MarkdownCommand)).toThrow(TypeError);
  });
});
