import { Select } from '@dreadnought/ui/react';

const options = Array.from({ length: 10000 }, (_, index) => ({
  value: String(index),
  label: `Участник ${index + 1}`,
}));

export function SelectLargeDemo() {
  return (
    <div>
      <p id="select-large-label">Поиск среди 10 000 участников</p>
      <Select
        aria-labelledby="select-large-label"
        options={options}
        showSearch
        allowClear
        placeholder="Введите Участник 9999"
      />
    </div>
  );
}
