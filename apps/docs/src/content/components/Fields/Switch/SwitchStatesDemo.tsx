import { Switch } from '@dreadnought/ui/react';

export function SwitchStatesDemo() {
  return (
    <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
      <Switch disabled>Недоступная настройка</Switch>
      <Switch disabled defaultChecked>
        Включённая недоступная настройка
      </Switch>
    </div>
  );
}
