import { useState } from 'react';
import { Button, FunnelChart } from '@dreadnought/ui/react';

const data = [
  { id: 'open', label: 'Открыли регистрацию', value: 80 },
  { id: 'submit', label: 'Отправили заявку', value: 0 },
  { id: 'confirm', label: 'Подтвердили почту', value: 0 },
];

export function FunnelChartStatesDemo() {
  const [empty, setEmpty] = useState(false);
  return (
    <>
      <Button variant="secondary" onClick={() => setEmpty(!empty)}>
        {empty ? 'Вернуть данные' : 'Очистить данные'}
      </Button>
      <FunnelChart label="Регистрация" data={empty ? [] : data} />
    </>
  );
}
