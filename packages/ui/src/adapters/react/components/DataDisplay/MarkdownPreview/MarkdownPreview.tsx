import { MarkdownPreviewAdapter } from '@dreadnought/react/unstyled';
import type { MarkdownPreviewAdapterProps } from '@dreadnought/react/unstyled';
import { markdownPreviewPresentation } from '#presentation/DataDisplay/MarkdownPreview/markdownPreviewPresentation.ts';

export type MarkdownPreviewProps = MarkdownPreviewAdapterProps;

export function MarkdownPreview({ className, ...props }: MarkdownPreviewProps) {
  return <MarkdownPreviewAdapter {...props} className={[markdownPreviewPresentation.root, className].filter(Boolean).join(' ')} />;
}
