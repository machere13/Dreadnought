import { createRef } from 'react';
import { Input } from '@dreadnought/ui/react';

<Input ref={createRef<HTMLInputElement>()} type="search" />;
<Input ref={createRef<HTMLInputElement>()} type="number" min={0} max={10} step="any" />;

// @ts-expect-error File inputs use a separate contract.
<Input type="file" />;
