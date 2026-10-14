import { useState } from 'react';
import { Checkbox } from '@dreadnought/ui/react';

const options = [
  { value: 'email', label: 'Почта' },
  { value: 'push', label: 'Push' },
  { value: 'sms', label: 'SMS', disabled: true },
];

export function CheckboxGroupDemo() {
  const [channels, setChannels] = useState<string[]>(['email']);
  return (
    <div>
      <Checkbox.Group
        label="Каналы уведомлений"
        name="channels"
        options={options}
        value={channels}
        onValueChange={setChannels}
      />
      <p role="status">Выбраны каналы: {channels.length ? channels.join(', ') : 'нет'}</p>
    </div>
  );
}
