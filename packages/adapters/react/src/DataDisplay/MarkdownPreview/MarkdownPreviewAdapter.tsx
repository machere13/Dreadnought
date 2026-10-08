import { forwardRef } from 'react';
import type { HTMLAttributes } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { safeMarkdownUrl } from './safeMarkdownUrl.ts';

export interface MarkdownPreviewAdapterProps extends Omit<
  HTMLAttributes<HTMLDivElement>,
  'children' | 'dangerouslySetInnerHTML'
> {
  value: string;
}

export const MarkdownPreviewAdapter = forwardRef<HTMLDivElement, MarkdownPreviewAdapterProps>(
  function MarkdownPreviewAdapter(input, ref) {
    const { value, children, dangerouslySetInnerHTML, ...props } =
      input as MarkdownPreviewAdapterProps & HTMLAttributes<HTMLDivElement>;
    return (
      <div {...props} ref={ref} data-ui="markdown-preview">
        <ReactMarkdown
          skipHtml
          remarkPlugins={[remarkGfm]}
          urlTransform={safeMarkdownUrl}
          components={{
            table: ({ node, ...tableProps }) => (
              <div data-ui="markdown-preview-table">
                <table {...tableProps} />
              </div>
            ),
          }}
        >
          {value}
        </ReactMarkdown>
      </div>
    );
  },
);
