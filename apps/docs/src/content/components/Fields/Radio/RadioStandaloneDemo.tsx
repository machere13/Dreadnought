import { useState } from 'react';
import { Radio } from '@dreadnought/ui/react';

export function RadioStandaloneDemo() {
  const [frequency, setFrequency] = useState('Ежедневно');
  return (
    <div>
      <fieldset>
        <legend>Частота уведомлений</legend>
        <Radio
          name="frequency"
          value="daily"
          defaultChecked
          onChange={() => setFrequency('Ежедневно')}
        >
          Ежедневно
        </Radio>
        <Radio name="frequency" value="weekly" onChange={() => setFrequency('Раз в неделю')}>
          Раз в неделю
        </Radio>
        <Radio name="frequency" value="never" onChange={() => setFrequency('Не получать')}>
          Не получать
        </Radio>
      </fieldset>
      <p role="status">Уведомления: {frequency}</p>
    </div>
  );
}
