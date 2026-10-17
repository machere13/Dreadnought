import { useState } from 'react';
import { Checkbox } from '@dreadnought/ui/react';

export function CheckboxBasicDemo() {
  const [checked, setChecked] = useState(false);
  return (
    <div>
      <Checkbox checked={checked} onChange={(event) => setChecked(event.currentTarget.checked)}>
        Получать уведомления
      </Checkbox>
      <p role="status">Уведомления {checked ? 'включены' : 'выключены'}</p>
    </div>
  );
}
