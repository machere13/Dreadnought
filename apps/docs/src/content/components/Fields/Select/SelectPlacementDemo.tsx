import { Select } from '@dreadnought/ui/react';

const options = [
  { value: 'anna', label: 'Анна' },
  { value: 'boris', label: 'Борис', disabled: true },
  { value: 'vera', label: 'Вера' },
];

export function SelectPlacementDemo() {
  return (
    <div>
      <p id="select-placement-label">Список над полем, по правому краю</p>
      <Select
        aria-labelledby="select-placement-label"
        options={options}
        placement="topRight"
        autoAdjustOverflow={false}
        placeholder="Откройте список"
      />
    </div>
  );
}
