import { Select } from '@dreadnought/ui/react';

const options = [
  { value: 'anna', label: 'Анна' },
  { value: 'boris', label: 'Борис', disabled: true },
  { value: 'vera', label: 'Вера' },
];

export function SelectSearchDemo() {
  return (
    <div style={{ display: 'grid', gap: 16 }}>
      <div>
        <p id="select-code-search-label">Поиск по имени или коду</p>
        <Select
          aria-labelledby="select-code-search-label"
          options={options}
          placeholder="Введите Анна или anna"
          allowClear
          showSearch={{
            optionFilterProp: ['label', 'value'],
            filterSort: (a, b) => a.label.localeCompare(b.label, 'ru'),
          }}
          optionRender={(option) => (
            <span>
              {option.label} <small>— {option.value}</small>
            </span>
          )}
        />
      </div>
      <div>
        <p id="select-groups-label">Варианты, разделённые на команды</p>
        <Select
          aria-labelledby="select-groups-label"
          showSearch
          placeholder="Выберите участника"
          options={[
            { label: 'Команда', options },
            { label: 'Гости', options: [{ value: 'guest', label: 'Даша' }] },
          ]}
        />
      </div>
    </div>
  );
}
