import { createRef } from 'react';
import { Textarea } from '@dreadnought/ui';

<Textarea ref={createRef<HTMLTextAreaElement>()} rows={4} />;

// @ts-expect-error Only textarea refs are accepted.
<Textarea ref={createRef<HTMLInputElement>()} />;
