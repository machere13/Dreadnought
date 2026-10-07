import { createRef } from 'react';
import { InputAdapter } from '@dreadnought/react/unstyled';

<InputAdapter ref={createRef<HTMLInputElement>()} type="email" />;

<InputAdapter type="number" min={0} max={10} step={0.5} stepButtonLabels={{ decrease: 'Less', increase: 'More' }}
  renderStepButton={props => <button {...props} />} />;

// @ts-expect-error Checkbox uses its own semantics.
<InputAdapter type="checkbox" />;

// @ts-expect-error Only input refs are accepted.
<InputAdapter ref={createRef<HTMLTextAreaElement>()} />;
