import { createRef } from 'react';
import { TextAreaAdapter } from '@dreadnought/react/unstyled';

<TextAreaAdapter ref={createRef<HTMLTextAreaElement>()} rows={4} />;

// @ts-expect-error Only textarea refs are accepted.
<TextAreaAdapter ref={createRef<HTMLInputElement>()} />;
