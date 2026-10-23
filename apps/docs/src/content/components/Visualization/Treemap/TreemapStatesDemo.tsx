import { useState } from 'react';
import { Button, Treemap } from '@dreadnought/ui/react';

const data = {
  id: 'projects',
  label: 'Новые проекты',
  children: [
    { id: 'alpha', label: 'Альфа', value: 0 },
    { id: 'beta', label: 'Бета', children: [] },
  ],
};
const empty = { id: 'empty', label: 'Нет проектов', children: [] };

export function TreemapStatesDemo() {
  const [cleared, setCleared] = useState(false);
  return (
    <>
      <Button variant="secondary" onClick={() => setCleared(!cleared)}>
        {cleared ? 'Вернуть проекты' : 'Очистить проекты'}
      </Button>
      <Treemap label="Пока без расходов" data={cleared ? empty : data} />
    </>
  );
}
