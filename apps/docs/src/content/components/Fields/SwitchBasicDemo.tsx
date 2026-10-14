import { useState } from 'react';
import { Switch } from '@dreadnought/ui/react';

export function SwitchBasicDemo() {
  const [checked, setChecked] = useState(false);
  return (
    <div>
      <Switch checked={checked} onChange={(event) => setChecked(event.currentTarget.checked)}>
        Получать уведомления
      </Switch>
      <p role="status">Уведомления {checked ? 'включены' : 'выключены'}</p>
    </div>
  );
}
