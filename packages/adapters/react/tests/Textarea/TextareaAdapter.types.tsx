import { createRef } from 'react';
import { TextareaAdapter } from '@dreadnought/react/unstyled';

<TextareaAdapter ref={createRef<HTMLTextAreaElement>()} rows={4} />;

// @ts-expect-error Only textarea refs are accepted.
<TextareaAdapter ref={createRef<HTMLInputElement>()} />;
