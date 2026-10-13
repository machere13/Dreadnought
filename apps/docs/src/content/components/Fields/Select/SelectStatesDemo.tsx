import { Select } from '@dreadnought/ui/react';

const options = [
  { value: 'anna', label: 'Анна' },
  { value: 'boris', label: 'Борис', disabled: true },
  { value: 'vera', label: 'Вера' },
];

export function SelectStatesDemo() {
  return (
    <div style={{ display: 'grid', gap: 16 }}>
      <div>
        <p id="select-disabled-label">Выбор недоступен</p>
        <Select
          aria-labelledby="select-disabled-label"
          options={options}
          disabled
          defaultValue="anna"
        />
      </div>
      <div>
        <p id="select-loading-label">Варианты ещё загружаются</p>
        <Select
          aria-labelledby="select-loading-label"
          options={[]}
          loading
          loadingContent="Загружаем варианты…"
          placeholder="Откройте список"
        />
      </div>
    </div>
  );
}
