import type { MarkdownDocument } from './markdown.types.ts';

export function isContinuousMarkdownInput(
  type: string,
  previous: MarkdownDocument,
  next: MarkdownDocument,
) {
  const { start, end } = previous.selection;
  if (start !== end || next.selection.start !== next.selection.end) {
    return false;
  }
  if (type === 'insertText') {
    const count = next.text.length - previous.text.length;
    return (
      count > 0 &&
      next.selection.start === start + count &&
      next.text.slice(0, start) === previous.text.slice(0, start) &&
      next.text.slice(start + count) === previous.text.slice(start)
    );
  }
  const count = previous.text.length - next.text.length;
  if (count <= 0) {
    return false;
  }
  if (type === 'deleteContentBackward') {
    return (
      next.selection.start === start - count &&
      next.text === previous.text.slice(0, start - count) + previous.text.slice(start)
    );
  }
  if (type === 'deleteContentForward') {
    return (
      next.selection.start === start &&
      next.text === previous.text.slice(0, start) + previous.text.slice(start + count)
    );
  }
  return false;
}
