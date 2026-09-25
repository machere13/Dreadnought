import { createRef } from 'react';
import { InputAdapter } from '@dreadnought/react/unstyled';

<InputAdapter ref={createRef<HTMLInputElement>()} type="email" />;

// @ts-expect-error Number inputs use a separate contract.
<InputAdapter type="number" />;

// @ts-expect-error Only input refs are accepted.
<InputAdapter ref={createRef<HTMLTextAreaElement>()} />;
