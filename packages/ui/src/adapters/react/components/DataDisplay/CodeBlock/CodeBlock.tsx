import { CodeBlockAdapter } from '@dreadnought/react/unstyled';
import type { CodeBlockAdapterProps } from '@dreadnought/react/unstyled';
import { codeBlockPresentation } from '#presentation/DataDisplay/CodeBlock/codeBlockPresentation.ts';
import { Icon } from '../Icon/Icon.tsx';

export type CodeBlockProps = CodeBlockAdapterProps;

const join = (library: string, consumer?: string) => [library, consumer].filter(Boolean).join(' ');

export function CodeBlock({ className, slotClassNames, copyIcons, ...props }: CodeBlockProps) {
  return <CodeBlockAdapter {...props}
    copyIcons={{ copy: <Icon name="copy" />, copied: <Icon name="check" />, error: <Icon name="warning" />, ...copyIcons }}
    className={join(codeBlockPresentation.root, className)}
    slotClassNames={{
      header: join(codeBlockPresentation.header, slotClassNames?.header),
      pre: join(codeBlockPresentation.pre, slotClassNames?.pre),
      code: join(codeBlockPresentation.code, slotClassNames?.code),
      copyButton: join(codeBlockPresentation.copyButton, slotClassNames?.copyButton),
    }} />;
}
