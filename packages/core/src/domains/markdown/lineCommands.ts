import type { MarkdownDocument } from './markdown.types.ts';
import { lineRange, listParts, newline, replaceRange } from './document.ts';

export function indentLines(doc: MarkdownDocument, remove: boolean, size = 2): MarkdownDocument {
  if (typeof size !== 'number') {
    throw new TypeError('Indent size must be a number.');
  }
  if (!Number.isInteger(size) || size < 1 || size > 16) {
    throw new RangeError('Indent size must be an integer from 1 to 16.');
  }
  const range = lineRange(doc);
  const edits = range.lines.slice(range.first, range.last + 1).map((line) => ({
    at: line.start,
    removed: remove
      ? line.text.startsWith('\t')
        ? 1
        : Math.min(size, line.text.match(/^ */)![0].length)
      : 0,
    inserted: remove ? '' : ' '.repeat(size),
  }));
  let text = doc.text;
  for (const edit of [...edits].reverse()) {
    text = text.slice(0, edit.at) + edit.inserted + text.slice(edit.at + edit.removed);
  }
  const map = (offset: number) =>
    offset +
    edits.reduce(
      (delta, edit) =>
        offset < edit.at
          ? delta
          : delta + edit.inserted.length - Math.min(edit.removed, offset - edit.at),
      0,
    );
  return { text, selection: { start: map(doc.selection.start), end: map(doc.selection.end) } };
}

export function duplicateLines(doc: MarkdownDocument): MarkdownDocument {
  const { start, end } = lineRange(doc);
  return replaceRange(
    doc,
    { start: end, end },
    newline(doc.text) + doc.text.slice(start, end),
    doc.selection,
  );
}

export function moveLines(doc: MarkdownDocument, direction: 'previous' | 'next'): MarkdownDocument {
  if (direction !== 'previous' && direction !== 'next') {
    throw new TypeError('Unknown line direction.');
  }
  const { lines, first, last } = lineRange(doc);
  if (direction === 'previous' ? first === 0 : last === lines.length - 1) {
    return { text: doc.text, selection: { ...doc.selection } };
  }
  const order = lines.map((_, index) => index);
  const block = order.splice(first, last - first + 1);
  order.splice(direction === 'previous' ? first - 1 : first + 1, 0, ...block);
  const starts: number[] = [];
  let length = 0;
  const text = order
    .map((original, slot) => {
      starts[original] = length;
      const value = lines[original]!.text + lines[slot]!.ending;
      length += value.length;
      return value;
    })
    .join('');
  const map = (offset: number, original: number) => {
    const slot = order.indexOf(original);
    const length = lines[original]!.text.length + lines[slot]!.ending.length;
    return starts[original]! + Math.min(offset - lines[original]!.start, length);
  };
  return {
    text,
    selection: { start: map(doc.selection.start, first), end: map(doc.selection.end, last) },
  };
}

export function newLine(doc: MarkdownDocument): MarkdownDocument {
  const { lines, first } = lineRange(doc);
  const line = lines[first]!;
  const parts = listParts(line.text);
  const eol = newline(doc.text);
  let start = doc.selection.start;
  let end = doc.selection.end;
  let prefix = parts.indent;
  if (parts.style && !parts.body.trim() && doc.selection.start === doc.selection.end) {
    start = line.start;
    end = line.end;
  } else if (parts.style && start >= line.start + parts.indent.length + parts.prefix.length) {
    prefix +=
      parts.style === 'task'
        ? '- [ ] '
        : parts.style === 'ordered'
          ? `${Number.parseInt(parts.prefix, 10) + 1}. `
          : parts.prefix;
  }
  const value = eol + prefix;
  const cursor = start + value.length;
  return replaceRange(doc, { start, end }, value, { start: cursor, end: cursor });
}
