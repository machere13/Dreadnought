import { createRef } from 'react';
import { CodeBlockAdapter } from '@dreadnought/react/unstyled';
import type { CodeBlockAdapterProps } from '@dreadnought/react/unstyled';

const ref = createRef<HTMLDivElement>();
const props: CodeBlockAdapterProps = {
  code: 'const x = 1;',
  copyable: false,
  slotClassNames: { pre: 'custom' },
};
<CodeBlockAdapter {...props} ref={ref} />;
// @ts-expect-error code is required
<CodeBlockAdapter />;
