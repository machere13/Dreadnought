export interface MarkdownSelection {
  readonly start: number;
  readonly end: number;
}
export interface MarkdownDocument {
  readonly text: string;
  readonly selection: MarkdownSelection;
}
type SimpleCommand =
  | 'bold'
  | 'italic'
  | 'strikethrough'
  | 'inlineCode'
  | 'codeBlock'
  | 'comment'
  | 'quote'
  | 'horizontalRule'
  | 'table'
  | 'newLine'
  | 'duplicateLines';
export type MarkdownCommand =
  | { [Kind in SimpleCommand]: { readonly type: Kind } }[SimpleCommand]
  | { readonly type: 'heading'; readonly level: 1 | 2 | 3 | 4 | 5 | 6 }
  | { readonly type: 'link' | 'image'; readonly destination?: string }
  | { readonly type: 'list'; readonly style: 'unordered' | 'ordered' | 'task' }
  | { readonly type: 'indent' | 'outdent'; readonly size?: number }
  | { readonly type: 'moveLines'; readonly direction: 'previous' | 'next' };
