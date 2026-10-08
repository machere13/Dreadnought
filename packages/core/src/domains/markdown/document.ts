import type { MarkdownDocument, MarkdownSelection } from './markdown.types.ts';

export function validateDocument(doc: MarkdownDocument): void {
  if (
    !doc ||
    typeof doc.text !== 'string' ||
    !doc.selection ||
    typeof doc.selection.start !== 'number' ||
    typeof doc.selection.end !== 'number'
  ) {
    throw new TypeError('Markdown document requires text and numeric selection offsets.');
  }
  const { start, end } = doc.selection;
  if (
    !Number.isSafeInteger(start) ||
    !Number.isSafeInteger(end) ||
    start < 0 ||
    start > end ||
    end > doc.text.length
  ) {
    throw new RangeError('Markdown selection must be inside the text.');
  }
}

export function replaceRange(
  doc: MarkdownDocument,
  range: MarkdownSelection,
  text: string,
  selection: MarkdownSelection,
): MarkdownDocument {
  return {
    text: doc.text.slice(0, range.start) + text + doc.text.slice(range.end),
    selection: { ...selection },
  };
}

export function wordRange(doc: MarkdownDocument): MarkdownSelection {
  let { start, end } = doc.selection;
  if (start !== end || /\s/.test(doc.text[start] ?? '') || !doc.text.length) {
    return { start, end };
  }
  while (start > 0 && !/\s/.test(doc.text[start - 1]!)) {
    start--;
  }
  while (end < doc.text.length && !/\s/.test(doc.text[end]!)) {
    end++;
  }
  return { start, end };
}

export function newline(text: string): string {
  return text.match(/\r?\n/)?.[0] ?? '\n';
}

export interface MarkdownLine {
  start: number;
  end: number;
  text: string;
  ending: string;
}

export function documentLines(text: string): MarkdownLine[] {
  let start = 0;
  const parts = text.split('\n');
  return parts.map((part, index) => {
    const hasEnding = index < parts.length - 1;
    const ending = hasEnding ? (part.endsWith('\r') ? '\r\n' : '\n') : '';
    const value = ending === '\r\n' ? part.slice(0, -1) : part;
    const line = { start, end: start + value.length, text: value, ending };
    start += part.length + (hasEnding ? 1 : 0);
    return line;
  });
}

export function lineRange(doc: MarkdownDocument) {
  const lines = documentLines(doc.text);
  const containing = (offset: number) => {
    const index = lines.findIndex((line) => offset < line.end + line.ending.length);
    return index < 0 ? lines.length - 1 : index;
  };
  const first = containing(doc.selection.start);
  const last = containing(
    doc.selection.end > doc.selection.start ? doc.selection.end - 1 : doc.selection.end,
  );
  return { lines, first, last, start: lines[first]!.start, end: lines[last]!.end };
}

export function blockPadding(text: string, start: number, end: number) {
  const eol = newline(text);
  const before = text.slice(0, start);
  const after = text.slice(end);
  return {
    before:
      !before.trim() || /\r?\n[ \t]*\r?\n$/.test(before)
        ? ''
        : /\r?\n$/.test(before)
          ? eol
          : eol + eol,
    after:
      !after.trim() || /^\r?\n[ \t]*\r?\n/.test(after)
        ? ''
        : /^\r?\n/.test(after)
          ? eol
          : eol + eol,
  };
}

export function listParts(text: string) {
  const match = /^([ \t]*)([-+*] (?:\[([ xX])\] )?|\d+\. )(.*)$/.exec(text);
  if (!match) {
    return {
      indent: text.match(/^[ \t]*/)![0],
      body: text.replace(/^[ \t]*/, ''),
      style: undefined,
      checked: undefined,
      prefix: '',
    };
  }
  return {
    indent: match[1]!,
    body: match[4]!,
    style: match[3] !== undefined ? 'task' : /^\d/.test(match[2]!) ? 'ordered' : 'unordered',
    checked: match[3],
    prefix: match[2]!,
  };
}
