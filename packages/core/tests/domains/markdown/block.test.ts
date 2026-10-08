import { describe, expect, it } from 'vitest';
import { applyMarkdownCommand } from '../../../src/index.ts';
import type { MarkdownCommand } from '../../../src/index.ts';

const run = (text: string, command: MarkdownCommand, start = 0, end = text.length) =>
  applyMarkdownCommand({ text, selection: { start, end } }, command);

describe('Markdown blocks', () => {
  it('excludes a line beginning at selection end', () => {
    expect(run('a\nb', { type: 'heading', level: 2 }, 0, 2)).toEqual({
      text: '## a\nb',
      selection: { start: 0, end: 4 },
    });
  });
  it('changes heading level and toggles the same level', () => {
    expect(run('  # a', { type: 'heading', level: 3 })).toEqual({
      text: '  ### a',
      selection: { start: 0, end: 7 },
    });
    expect(run('  ### a', { type: 'heading', level: 3 })).toEqual({
      text: '  a',
      selection: { start: 0, end: 3 },
    });
  });
  it.each([0, 7, 1.5, NaN])('rejects heading level %s', (level) => {
    expect(() => run('a', { type: 'heading', level } as MarkdownCommand)).toThrow(RangeError);
  });
  it.each([
    ['unordered', '- a\n- b', 7],
    ['ordered', '1. a\n2. b', 9],
    ['task', '- [ ] a\n- [ ] b', 15],
  ] as const)('toggles a %s list as a block', (style, text, end) => {
    expect(run('a\nb', { type: 'list', style })).toEqual({ text, selection: { start: 0, end } });
    expect(run(text, { type: 'list', style })).toEqual({
      text: 'a\nb',
      selection: { start: 0, end: 3 },
    });
  });
  it('replaces mixed list prefixes and preserves a checked task', () => {
    expect(run('- [x] a\n2. b', { type: 'list', style: 'task' })).toEqual({
      text: '- [x] a\n- [ ] b',
      selection: { start: 0, end: 15 },
    });
  });
  it('keeps indentation when changing list style', () => {
    expect(run('  - a\n\tb', { type: 'list', style: 'ordered' })).toEqual({
      text: '  1. a\n\t2. b',
      selection: { start: 0, end: 12 },
    });
  });
  it('includes empty lines and preserves a final CRLF', () => {
    expect(run('a\r\n\r\nb\r\n', { type: 'list', style: 'unordered' })).toEqual({
      text: '- a\r\n- \r\n- b\r\n',
      selection: { start: 0, end: 12 },
    });
  });
  it('formats the final empty line when the cursor is there', () => {
    expect(run('a\n', { type: 'heading', level: 1 }, 2, 2)).toEqual({
      text: 'a\n# ',
      selection: { start: 2, end: 4 },
    });
  });
  it('separates a quote from neighboring text and leaves blank lines on removal', () => {
    const next = run('before\na\nafter', { type: 'quote' }, 7, 8);
    expect(next).toEqual({ text: 'before\n\n> a\n\nafter', selection: { start: 8, end: 11 } });
    expect(applyMarkdownCommand(next, { type: 'quote' })).toEqual({
      text: 'before\n\na\n\nafter',
      selection: { start: 8, end: 9 },
    });
  });
  it('removes quote markers without touching indentation', () => {
    expect(run('  > a\n> b', { type: 'quote' })).toEqual({
      text: '  a\nb',
      selection: { start: 0, end: 5 },
    });
  });
  it('inserts a rule without replacing the selected text', () => {
    expect(run('abc', { type: 'horizontalRule' }, 1, 2)).toEqual({
      text: 'a\n\n---\n\nbc',
      selection: { start: 8, end: 8 },
    });
  });
  it('inserts a table and selects its first header', () => {
    expect(run('abc', { type: 'table' }, 0, 3)).toEqual({
      text: '| Header | Header |\n|--------|--------|\n| Cell | Cell |\n| Cell | Cell |\n| Cell | Cell |\n\nabc',
      selection: { start: 2, end: 8 },
    });
  });
  it.each(['codeBlock', 'inlineCode'] as const)(
    'uses a fenced block for multiline %s and toggles it',
    (type) => {
      const next = run('a\nb', { type });
      expect(next).toEqual({ text: '```\na\nb\n```', selection: { start: 4, end: 7 } });
      expect(applyMarkdownCommand(next, { type })).toEqual({
        text: 'a\nb',
        selection: { start: 0, end: 3 },
      });
    },
  );
  it('uses longer fences when the content contains backticks', () => {
    expect(run('x```y', { type: 'codeBlock' })).toEqual({
      text: '````\nx```y\n````',
      selection: { start: 5, end: 10 },
    });
  });
  it('keeps CRLF and inserts boundary newlines for a code block', () => {
    expect(run('a\r\nbc\r\nd', { type: 'codeBlock' }, 4, 5)).toEqual({
      text: 'a\r\nb\r\n```\r\nc\r\n```\r\nd',
      selection: { start: 11, end: 12 },
    });
  });
  it('preserves plain carriage return characters', () => {
    expect(run('a\rb', { type: 'heading', level: 1 })).toEqual({
      text: '# a\rb',
      selection: { start: 0, end: 5 },
    });
  });
  it('rejects an unknown list style', () => {
    expect(() => run('a', { type: 'list', style: 'unknown' } as MarkdownCommand)).toThrow(
      TypeError,
    );
  });
});
