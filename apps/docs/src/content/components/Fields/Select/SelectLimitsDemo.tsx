import { Select } from '@dreadnought/ui/react';

const options = [
  { value: 'anna', label: 'Анна' },
  { value: 'boris', label: 'Борис', disabled: true },
  { value: 'vera', label: 'Вера' },
];

export function SelectLimitsDemo() {
  return (
    <div style={{ display: 'grid', gap: 16 }}>
      <div>
        <p id="select-visible-tags-label">Одна видимая метка — остальные в счётчике</p>
        <Select
          multiple
          aria-labelledby="select-visible-tags-label"
          options={options}
          showSearch
          maxTagCount={1}
          defaultValue={['anna', 'vera']}
        />
      </div>
      <div>
        <p id="select-max-members-label">Можно выбрать не больше двух участников</p>
        <Select
          multiple
          aria-labelledby="select-max-members-label"
          options={[...options, { value: 'guest', label: 'Даша' }]}
          showSearch
          allowClear
          maxCount={2}
          defaultValue={['anna', 'vera']}
        />
      </div>
    </div>
  );
}
