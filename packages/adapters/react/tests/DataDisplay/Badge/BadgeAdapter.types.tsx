import { createRef } from 'react';
import { BadgeAdapter } from '@dreadnought/react/unstyled';

const root = createRef<HTMLSpanElement>();
<BadgeAdapter ref={root} data-test-id="beta" icon={<svg />}>Beta</BadgeAdapter>;
<BadgeAdapter target={<button type="button">Inbox</button>}>0</BadgeAdapter>;
