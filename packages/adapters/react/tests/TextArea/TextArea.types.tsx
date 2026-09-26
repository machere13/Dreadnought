import { createRef } from 'react';
import { TextArea } from '@dreadnought/react/styled';

<TextArea ref={createRef<HTMLTextAreaElement>()} rows={4} />;
<TextArea rows={4} minRows={2} maxRows={8} autoSize />;

// @ts-expect-error Only textarea refs are accepted.
<TextArea ref={createRef<HTMLInputElement>()} />;
