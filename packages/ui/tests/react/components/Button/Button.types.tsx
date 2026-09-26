import { createRef } from 'react';
import { Button } from '@dreadnought/ui/react';

const buttonRef = createRef<HTMLButtonElement>();
const linkRef = createRef<HTMLAnchorElement>();

<Button ref={buttonRef}>Action</Button>;
<Button href="/docs" ref={linkRef}>Docs</Button>;

// @ts-expect-error A link must not receive a button ref.
<Button href="/docs" ref={buttonRef}>Docs</Button>;

// @ts-expect-error A button must not receive a link ref.
<Button ref={linkRef}>Action</Button>;
