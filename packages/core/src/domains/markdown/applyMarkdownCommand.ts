import type { MarkdownCommand, MarkdownDocument } from './markdown.types.ts';
import { validateDocument } from './document.ts';
import { insertLink, wrapInline } from './inlineCommands.ts';
import { codeBlock, formatBlock, insertBlock } from './blockCommands.ts';
import { duplicateLines, indentLines, moveLines, newLine } from './lineCommands.ts';

export function applyMarkdownCommand(doc: MarkdownDocument, command: MarkdownCommand): MarkdownDocument {
  validateDocument(doc);
  if (!command || typeof command !== 'object') throw new TypeError('A Markdown command is required.');
  switch (command.type) {
    case 'bold': return wrapInline(doc, '**');
    case 'italic': return wrapInline(doc, '*');
    case 'strikethrough': return wrapInline(doc, '~~');
    case 'inlineCode': return doc.text.slice(doc.selection.start, doc.selection.end).includes('\n') ? codeBlock(doc) : wrapInline(doc, '`');
    case 'codeBlock': return codeBlock(doc);
    case 'comment': return wrapInline(doc, '<!-- ', ' -->');
    case 'link': return insertLink(doc, false, command.destination);
    case 'image': return insertLink(doc, true, command.destination);
    case 'heading':
    case 'list':
    case 'quote': return formatBlock(doc, command);
    case 'horizontalRule': return insertBlock(doc, false);
    case 'table': return insertBlock(doc, true);
    case 'indent': return indentLines(doc, false, command.size);
    case 'outdent': return indentLines(doc, true, command.size);
    case 'duplicateLines': return duplicateLines(doc);
    case 'moveLines': return moveLines(doc, command.direction);
    case 'newLine': return newLine(doc);
    default: throw new TypeError('Unknown Markdown command.');
  }
}
