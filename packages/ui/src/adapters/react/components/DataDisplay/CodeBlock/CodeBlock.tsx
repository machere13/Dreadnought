import { CodeBlockAdapter } from '@dreadnought/react/unstyled';
import type { CodeBlockAdapterProps } from '@dreadnought/react/unstyled';
import { codeBlockPresentation } from '#presentation/DataDisplay/CodeBlock/codeBlockPresentation.ts';

export type CodeBlockProps = CodeBlockAdapterProps;

const join = (library: string, consumer?: string) => [library, consumer].filter(Boolean).join(' ');

export function CodeBlock({ className, slotClassNames, ...props }: CodeBlockProps) {
  return <CodeBlockAdapter {...props}
    className={join(codeBlockPresentation.root, className)}
    slotClassNames={{
      header: join(codeBlockPresentation.header, slotClassNames?.header),
      pre: join(codeBlockPresentation.pre, slotClassNames?.pre),
      code: join(codeBlockPresentation.code, slotClassNames?.code),
      copyButton: join(codeBlockPresentation.copyButton, slotClassNames?.copyButton),
    }} />;
}
