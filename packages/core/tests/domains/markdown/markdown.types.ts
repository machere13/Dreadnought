import { applyMarkdownCommand, type MarkdownCommand, type MarkdownDocument } from '@dreadnought/core';

const doc: MarkdownDocument = { text: 'a', selection: { start: 0, end: 1 } };
const command: MarkdownCommand = { type: 'heading', level: 4 };
const next: MarkdownDocument = applyMarkdownCommand(doc, command);
void next;
// @ts-expect-error Unsupported heading level.
applyMarkdownCommand(doc, { type: 'heading', level: 7 });
// @ts-expect-error A direction is required.
applyMarkdownCommand(doc, { type: 'moveLines' });
// @ts-expect-error Unknown command.
applyMarkdownCommand(doc, { type: 'render' });
// @ts-expect-error Documents are immutable.
doc.text = 'b';
