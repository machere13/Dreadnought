import { useState } from 'react';
import { Button, Sankey } from '@dreadnought/ui/react';

const nodes = [{ id: 'new', label: 'Новый раздел' }];
const links = [] as const;
export function SankeyStatesDemo() {
  const [empty, setEmpty] = useState(false);
  return (
    <div style={{ display: 'grid', gap: 16 }}>
      <Button onClick={() => setEmpty((value) => !value)}>
        {empty ? 'Показать раздел' : 'Очистить данные'}
      </Button>
      <Sankey label="Раздел без переходов" nodes={empty ? [] : nodes} links={links} />
    </div>
  );
}
