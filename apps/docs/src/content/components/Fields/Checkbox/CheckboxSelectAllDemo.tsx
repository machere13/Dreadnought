import { useState } from 'react';
import { Checkbox } from '@dreadnought/ui/react';

const options = [
  { value: 'email', label: 'Почта' },
  { value: 'push', label: 'Push' },
];

export function CheckboxSelectAllDemo() {
  const [channels, setChannels] = useState<string[]>(['email']);
  const allChecked = channels.length === options.length;
  const partiallyChecked = channels.length > 0 && !allChecked;
  const labels = options
    .filter((option) => channels.includes(option.value))
    .map((option) => option.label);
  return (
    <div style={{ display: 'grid', gap: 12 }}>
      <Checkbox
        checked={allChecked}
        indeterminate={partiallyChecked}
        onChange={(event) =>
          setChannels(event.currentTarget.checked ? options.map((option) => option.value) : [])
        }
      >
        Все каналы
      </Checkbox>
      <Checkbox.Group
        label="Выбор каналов"
        options={options}
        value={channels}
        onValueChange={setChannels}
      />
      <p role="status">Выбраны каналы: {labels.length ? labels.join(', ') : 'нет'}</p>
    </div>
  );
}
