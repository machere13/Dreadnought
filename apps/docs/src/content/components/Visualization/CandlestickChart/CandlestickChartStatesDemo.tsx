import { useState } from 'react';
import { Button, CandlestickChart } from '@dreadnought/ui/react';

const data = [{ id: 'flat', label: 'Без изменений', open: 0, close: 0, low: 0, high: 0 }];
export function CandlestickChartStatesDemo() {
  const [empty, setEmpty] = useState(false);
  return (
    <div style={{ display: 'grid', gap: 16 }}>
      <Button onClick={() => setEmpty((value) => !value)}>
        {empty ? 'Вернуть нулевую свечу' : 'Очистить данные'}
      </Button>
      <CandlestickChart
        label="Ноль или нет данных"
        data={empty ? [] : data}
        description="Когда все четыре цены равны нулю, свеча остаётся линией с Tooltip. Пустой массив показывает отдельное состояние."
      />
    </div>
  );
}
