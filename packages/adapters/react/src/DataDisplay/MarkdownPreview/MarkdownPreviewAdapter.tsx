import { forwardRef } from 'react';
import type { HTMLAttributes } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export interface MarkdownPreviewAdapterProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children' | 'dangerouslySetInnerHTML'> {
  value: string;
}

function safeMarkdownUrl(url: string, key: string) {
  if (/[\u0000-\u001f\u007f-\u009f]/.test(url)) return undefined;
  const value = url.trim();
  const protocol = /^([^/?#]*):/.exec(value)?.[1]?.toLowerCase();
  return protocol && protocol !== 'http' && protocol !== 'https' && !(key === 'href' && protocol === 'mailto') ? undefined : value;
}

export const MarkdownPreviewAdapter = forwardRef<HTMLDivElement, MarkdownPreviewAdapterProps>(
  function MarkdownPreviewAdapter(input, ref) {
    const { value, children, dangerouslySetInnerHTML, ...props } = input as MarkdownPreviewAdapterProps & HTMLAttributes<HTMLDivElement>;
    return <div {...props} ref={ref} data-ui="markdown-preview">
      <ReactMarkdown skipHtml remarkPlugins={[remarkGfm]} urlTransform={safeMarkdownUrl}
        components={{ table: ({ node, ...tableProps }) => <div data-ui="markdown-preview-table"><table {...tableProps} /></div> }}>
        {value}
      </ReactMarkdown>
    </div>;
  },
);
