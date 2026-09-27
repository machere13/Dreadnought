import { createRef } from 'react';
import { codeBlockPresentation } from '@dreadnought/ui';
import { CodeBlock } from '@dreadnought/ui/react';
import type { CodeBlockProps } from '@dreadnought/ui/react';

const ref = createRef<HTMLDivElement>();
const props: CodeBlockProps = {
  code: 'const x = 1;', language: 'ts', copyable: true,
  copyLabels: { copy: 'Copy', copied: 'Copied', error: 'Failed' },
  slotClassNames: { pre: 'custom' },
};
<CodeBlock {...props} ref={ref} />;
const rootClass: string = codeBlockPresentation.root;
void rootClass;
// @ts-expect-error code is required
<CodeBlock />;
