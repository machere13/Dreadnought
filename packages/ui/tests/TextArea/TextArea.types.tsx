import { createRef } from 'react';
import { TextArea } from '@dreadnought/ui';

<TextArea ref={createRef<HTMLTextAreaElement>()} rows={4} />;

// @ts-expect-error Only textarea refs are accepted.
<TextArea ref={createRef<HTMLInputElement>()} />;
