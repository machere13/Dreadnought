import { describe, expect, it } from 'vitest';
import { applyMarkdownCommand } from '../../../src/index.ts';
import type { MarkdownCommand } from '../../../src/index.ts';

describe('Markdown inline commands', () => {
  it.each([
    ['bold', '**hello**', 2, 7],
    ['italic', '*hello*', 1, 6],
    ['strikethrough', '~~hello~~', 2, 7],
    ['inlineCode', '`hello`', 1, 6],
    ['comment', '<!-- hello -->', 5, 10],
  ] as const)('adds and removes %s around the content', (type, text, start, end) => {
    const doc = Object.freeze({ text: 'hello', selection: Object.freeze({ start: 0, end: 5 }) });
    const next = applyMarkdownCommand(doc, { type });
    expect(next).toEqual({ text, selection: { start, end } });
    expect(applyMarkdownCommand(next, { type })).toEqual(doc);
    expect(next).not.toBe(doc);
    expect(doc.text).toBe('hello');
  });

  it('formats a word around an empty cursor', () => {
    expect(applyMarkdownCommand({ text: 'hello world', selection: { start: 2, end: 2 } }, { type: 'bold' }))
      .toEqual({ text: '**hello** world', selection: { start: 2, end: 7 } });
  });

  it.each([
    ['', 0, '****', 2],
    ['a b', 1, 'a**** b', 3],
    ['a\tb', 1, 'a****\tb', 3],
    ['a\r\nb', 1, 'a****\r\nb', 3],
  ])('does not select a word on whitespace in %j', (text, offset, want, cursor) => {
    expect(applyMarkdownCommand({ text: text as string, selection: { start: offset as number, end: offset as number } }, { type: 'bold' }))
      .toEqual({ text: want, selection: { start: cursor, end: cursor } });
  });

  it('removes markers included in the selection', () => {
    expect(applyMarkdownCommand({ text: '**hello**', selection: { start: 0, end: 9 } }, { type: 'bold' }))
      .toEqual({ text: 'hello', selection: { start: 0, end: 5 } });
  });

  it('preserves UTF-16 offsets and surrounding content', () => {
    expect(applyMarkdownCommand({ text: 'a😀b', selection: { start: 1, end: 3 } }, { type: 'italic' }))
      .toEqual({ text: 'a*😀*b', selection: { start: 2, end: 4 } });
  });

  it.each([
    ['link', 'hello', undefined, '[hello](url)', 8, 11],
    ['link', '', undefined, '[title](url)', 8, 11],
    ['link', 'https://a.test', undefined, '[](https://a.test)', 3, 17],
    ['link', 'myhttptext', undefined, '[myhttptext](url)', 13, 16],
    ['link', 'hello', '/a', '[hello](/a)', 1, 6],
    ['image', '', undefined, '![image](url)', 9, 12],
    ['image', 'hello', undefined, '![hello]()', 2, 7],
    ['image', 'https://a.test', undefined, '![image](https://a.test)', 9, 23],
    ['image', 'hello', '/a', '![hello](/a)', 2, 7],
    ['link', 'a[b]', '/a (b)', '[a\\[b\\]](</a (b)>)', 1, 7],
  ] as const)('inserts %s with text %j and destination %j', (type, text, destination, want, start, end) => {
    expect(applyMarkdownCommand({ text, selection: { start: 0, end: text.length } }, { type, destination }))
      .toEqual({ text: want, selection: { start, end } });
  });

  it.each(['link', 'image'] as const)('removes its own %s template on repeat', type => {
    const next = applyMarkdownCommand({ text: 'hello', selection: { start: 0, end: 5 } }, { type });
    expect(applyMarkdownCommand(next, { type })).toEqual({ text: 'hello', selection: { start: 0, end: 5 } });
  });

  it.each(['link', 'image'] as const)('removes its own %s template with parentheses in the URL', type => {
    const doc = { text: 'https://a.test/(b)', selection: { start: 0, end: 18 } };
    expect(applyMarkdownCommand(applyMarkdownCommand(doc, { type }), { type })).toEqual(doc);
  });

  it.each(['x\ny', 'x\ry', 'x\u0000y', '<x>', 'x\u007fy'])('rejects a control or delimiter in destination %j', destination => {
    expect(() => applyMarkdownCommand({ text: '', selection: { start: 0, end: 0 } }, { type: 'link', destination })).toThrow(TypeError);
  });

  it.each([
    { start: -1, end: 1 }, { start: 1, end: 0 }, { start: 0, end: 4 },
    { start: 0.5, end: 1 }, { start: NaN, end: 1 }, { start: 0, end: Infinity },
  ])('rejects invalid offsets %j', selection => {
    expect(() => applyMarkdownCommand({ text: 'abc', selection }, { type: 'bold' })).toThrow(RangeError);
  });

  it('rejects invalid runtime structures and commands', () => {
    const doc = { text: '', selection: { start: 0, end: 0 } };
    for (const command of [null, {}, { type: 'unknown' }, { type: 'link', destination: 1 }]) {
      expect(() => applyMarkdownCommand(doc, command as MarkdownCommand)).toThrow(TypeError);
    }
    expect(() => applyMarkdownCommand(null!, { type: 'bold' })).toThrow(TypeError);
    expect(() => applyMarkdownCommand({ text: 1 as unknown as string, selection: doc.selection }, { type: 'bold' })).toThrow(TypeError);
  });
});
