import { createRef } from 'react';
import { Input } from '@dreadnought/ui/react';

<Input ref={createRef<HTMLInputElement>()} type="search" />;

// @ts-expect-error File inputs use a separate contract.
<Input type="file" />;
