import type { MarkdownDocument } from './markdown.types.ts';
import { replaceRange, wordRange } from './document.ts';

export function wrapInline(doc: MarkdownDocument, prefix: string, suffix = prefix): MarkdownDocument {
  const range = wordRange(doc);
  const selected = doc.text.slice(range.start, range.end);
  const aroundStart = range.start - prefix.length;
  const canRemove = (before: string, after: string) => prefix !== '*'
    || ((before.match(/\*+$/)?.[0].length ?? 0) % 2 === 1 && (after.match(/^\*+/)?.[0].length ?? 0) % 2 === 1);
  if (aroundStart >= 0 && doc.text.slice(aroundStart, range.start) === prefix
    && doc.text.slice(range.end, range.end + suffix.length) === suffix
    && canRemove(doc.text.slice(0, range.start), doc.text.slice(range.end))) {
    return replaceRange(doc, { start: aroundStart, end: range.end + suffix.length }, selected,
      { start: aroundStart, end: aroundStart + selected.length });
  }
  if (selected.length >= prefix.length + suffix.length && selected.startsWith(prefix) && selected.endsWith(suffix) && canRemove(selected, selected)) {
    const content = selected.slice(prefix.length, -suffix.length);
    return replaceRange(doc, range, content, { start: range.start, end: range.start + content.length });
  }
  return replaceRange(doc, range, prefix + selected + suffix,
    { start: range.start + prefix.length, end: range.end + prefix.length });
}

const urlLike = /^(?:https?:\/\/|www\.)/i;
const escapeLabel = (value: string) => value.replace(/[\\[\]]/g, '\\$&');
const unescapeLabel = (value: string) => value.replace(/\\([\\[\]])/g, '$1');

export function insertLink(doc: MarkdownDocument, image: boolean, destination?: string): MarkdownDocument {
  if (destination !== undefined && (typeof destination !== 'string' || /[\u0000-\u001f\u007f<>]/.test(destination))) {
    throw new TypeError('Markdown destination must not contain controls or angle brackets.');
  }
  if (destination === undefined) {
    const template = /(!?)\[((?:\\.|[^\]\\])*)\]\((<[^>\r\n]*>|(?:\\.|[^()\\\r\n])*)\)/g;
    for (const match of doc.text.matchAll(template)) {
      const start = match.index;
      const end = start + match[0].length;
      const label = unescapeLabel(match[2]!);
      const address = match[3]!.startsWith('<') ? match[3]!.slice(1, -1) : match[3]!;
      const ownTemplate = address === 'url' || address === '' || (urlLike.test(address) && (image ? label === 'image' : label === ''));
      if (!!match[1] === image && ownTemplate && start <= doc.selection.start && end >= doc.selection.end) {
        const content = urlLike.test(address) && (image ? label === 'image' : label === '') ? address : label;
        return replaceRange(doc, { start, end }, content, { start, end: start + content.length });
      }
    }
  }
  const range = wordRange(doc);
  const selected = doc.text.slice(range.start, range.end);
  const isAddress = destination === undefined && urlLike.test(selected);
  const label = escapeLabel(isAddress ? (image ? 'image' : '') : selected || (image ? 'image' : 'title'));
  const rawAddress = destination ?? (isAddress ? selected : image && selected ? '' : 'url');
  if (/[\u0000-\u001f\u007f<>]/.test(rawAddress)) throw new TypeError('Invalid Markdown destination.');
  const escaped = rawAddress.replace(/\\/g, '\\\\');
  const address = /[\s()]/.test(escaped) ? `<${escaped}>` : escaped;
  const prefix = image ? '![' : '[';
  const text = `${prefix}${label}](${address})`;
  const selectAddress = destination === undefined && address !== '';
  const start = range.start + (selectAddress ? prefix.length + label.length + 2 : prefix.length);
  return replaceRange(doc, range, text, { start, end: start + (selectAddress ? address.length : label.length) });
}
