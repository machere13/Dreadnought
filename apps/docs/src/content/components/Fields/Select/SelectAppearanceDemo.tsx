import { Select } from '@dreadnought/ui/react';

const options = [
  { value: 'anna', label: 'Анна' },
  { value: 'boris', label: 'Борис', disabled: true },
  { value: 'vera', label: 'Вера' },
];

export function SelectAppearanceDemo() {
  return (
    <div style={{ display: 'grid', gap: 16 }}>
      <div>
        <p id="select-compact-label">Компактное заполненное поле</p>
        <Select
          aria-labelledby="select-compact-label"
          controlSize="compact"
          variant="filled"
          options={options}
          placeholder="Выберите исполнителя"
          allowClear
        />
      </div>
      <div>
        <p id="select-borderless-label">Поле без рамки</p>
        <Select
          aria-labelledby="select-borderless-label"
          variant="borderless"
          options={options}
          placeholder="Выберите исполнителя"
        />
      </div>
    </div>
  );
}
