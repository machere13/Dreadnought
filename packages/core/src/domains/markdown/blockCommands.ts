import type { MarkdownCommand, MarkdownDocument } from './markdown.types.ts';
import {
  blockPadding,
  lineRange,
  listParts,
  newline,
  replaceRange,
  wordRange,
} from './document.ts';

export function formatBlock(
  doc: MarkdownDocument,
  command: Extract<MarkdownCommand, { type: 'heading' | 'list' }> | { type: 'quote' },
): MarkdownDocument {
  if (command.type === 'heading') {
    if (typeof command.level !== 'number') {
      throw new TypeError('Heading level must be numeric.');
    }
    if (!Number.isInteger(command.level) || command.level < 1 || command.level > 6) {
      throw new RangeError('Heading level must be 1..6.');
    }
  }
  if (command.type === 'list' && !['unordered', 'ordered', 'task'].includes(command.style)) {
    throw new TypeError('Unknown list style.');
  }
  const range = lineRange(doc);
  const selected = range.lines.slice(range.first, range.last + 1);
  const nonempty = selected.filter((line) => line.text.trim());
  const removing =
    command.type === 'quote'
      ? nonempty.length > 0 && nonempty.every((line) => /^[ \t]*> /.test(line.text))
      : command.type === 'list' &&
        nonempty.length > 0 &&
        nonempty.every((line) => listParts(line.text).style === command.style);
  const transformed = selected
    .map((line, index) => {
      const indent = line.text.match(/^[ \t]*/)![0];
      const body = line.text.slice(indent.length);
      let text: string;
      if (command.type === 'heading') {
        const current = /^(#{1,6}) (.*)$/.exec(body);
        text =
          indent +
          (current?.[1]!.length === command.level
            ? current[2]
            : '#'.repeat(command.level) + ' ' + (current?.[2] ?? body));
      } else if (command.type === 'quote') {
        text = indent + (removing ? body.replace(/^> /, '') : '> ' + body);
      } else {
        const parts = listParts(line.text);
        const marker =
          command.style === 'ordered'
            ? `${index + 1}. `
            : command.style === 'task'
              ? `- [${parts.checked ?? ' '}] `
              : '- ';
        text = parts.indent + (removing ? '' : marker) + parts.body;
      }
      return text + (index < selected.length - 1 ? line.ending : '');
    })
    .join('');
  const padding =
    command.type === 'heading' || removing
      ? { before: '', after: '' }
      : blockPadding(doc.text, range.start, range.end);
  const start = range.start + padding.before.length;
  return replaceRange(doc, range, padding.before + transformed + padding.after, {
    start,
    end: start + transformed.length,
  });
}

export function insertBlock(doc: MarkdownDocument, table: boolean): MarkdownDocument {
  const eol = newline(doc.text);
  const text = table
    ? [
        '| Header | Header |',
        '|--------|--------|',
        '| Cell | Cell |',
        '| Cell | Cell |',
        '| Cell | Cell |',
      ].join(eol)
    : '---';
  const at = doc.selection.start;
  const padding = blockPadding(doc.text, at, at);
  const inserted = padding.before + text + padding.after;
  const start = table ? at + padding.before.length + 2 : at + inserted.length;
  return replaceRange(doc, { start: at, end: at }, inserted, {
    start,
    end: table ? start + 6 : start,
  });
}

export function codeBlock(doc: MarkdownDocument): MarkdownDocument {
  const range = wordRange(doc);
  const blocks = /^(`{3,})(\r?\n)([\s\S]*?)\2\1(?=\r?\n|$)/gm;
  for (const match of doc.text.matchAll(blocks)) {
    const start = match.index;
    const end = start + match[0].length;
    const contentStart = start + match[1]!.length + match[2]!.length;
    const contentEnd = contentStart + match[3]!.length;
    if (
      (range.start === contentStart && range.end === contentEnd) ||
      (range.start === start && range.end === end)
    ) {
      return replaceRange(doc, { start, end }, match[3]!, { start, end: start + match[3]!.length });
    }
  }
  const content = doc.text.slice(range.start, range.end);
  let fenceLength = 3;
  for (const run of content.matchAll(/`+/g)) {
    fenceLength = Math.max(fenceLength, run[0].length + 1);
  }
  const fence = '`'.repeat(fenceLength);
  const eol = newline(doc.text);
  const before = range.start > 0 && doc.text[range.start - 1] !== '\n' ? eol : '';
  const after = range.end < doc.text.length && !/^\r?\n/.test(doc.text.slice(range.end)) ? eol : '';
  const prefix = before + fence + eol;
  return replaceRange(doc, range, prefix + content + eol + fence + after, {
    start: range.start + prefix.length,
    end: range.end + prefix.length,
  });
}
