import { createRef } from 'react';
import { Input } from '@dreadnought/ui/react';

<Input ref={createRef<HTMLInputElement>()} type="search" />;
<Input
  prefix={<span>₽</span>}
  suffix={<button>Apply</button>}
  allowClear
  showCount
  maxLength={20}
  clearLabel="Очистить"
/>;
<Input ref={createRef<HTMLInputElement>()} type="number" min={0} max={10} step="any" />;

// @ts-expect-error File inputs use a separate contract.
<Input type="file" />;
