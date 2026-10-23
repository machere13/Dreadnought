import { useState } from 'react';
import { Button, WaterfallChart } from '@dreadnought/ui/react';

const data = [
  { id: 'change', label: 'Без изменений', kind: 'change', value: 0 },
  { id: 'total', label: 'Итог', kind: 'total' },
] as const;
const empty = [] as const;
export function WaterfallChartStatesDemo() {
  const [cleared, setCleared] = useState(false);
  return (
    <>
      <Button onClick={() => setCleared((value) => !value)}>
        {cleared ? 'Вернуть данные' : 'Очистить данные'}
      </Button>
      <WaterfallChart label="Нет движения средств" data={cleared ? empty : data} />
    </>
  );
}
