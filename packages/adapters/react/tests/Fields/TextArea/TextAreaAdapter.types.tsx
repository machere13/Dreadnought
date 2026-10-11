import { createRef } from 'react';
import { TextAreaAdapter } from '@dreadnought/react/unstyled';

<TextAreaAdapter ref={createRef<HTMLTextAreaElement>()} rows={4} />;
<TextAreaAdapter
  allowClear
  showCount
  maxLength={200}
  clearLabel="Clear notes"
  clearContent={<span>×</span>}
/>;
<TextAreaAdapter
  ref={createRef<HTMLTextAreaElement>()}
  rows={4}
  minRows={2}
  maxRows={8}
  autoSize
/>;

// @ts-expect-error Only textarea refs are accepted.
<TextAreaAdapter ref={createRef<HTMLInputElement>()} />;
