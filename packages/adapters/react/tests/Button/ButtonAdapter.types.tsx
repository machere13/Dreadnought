import { createRef } from 'react';
import { ButtonAdapter } from '@dreadnought/react/unstyled';

const buttonRef = createRef<HTMLButtonElement>();
const linkRef = createRef<HTMLAnchorElement>();

<ButtonAdapter ref={buttonRef}>Action</ButtonAdapter>;
<ButtonAdapter href="/docs" ref={linkRef}>Docs</ButtonAdapter>;

// @ts-expect-error A link must not receive a button ref.
<ButtonAdapter href="/docs" ref={buttonRef}>Docs</ButtonAdapter>;

// @ts-expect-error A button must not receive a link ref.
<ButtonAdapter ref={linkRef}>Action</ButtonAdapter>;
