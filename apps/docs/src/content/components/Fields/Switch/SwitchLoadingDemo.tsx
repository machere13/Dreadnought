import { useEffect, useState } from 'react';
import { Switch } from '@dreadnought/ui/react';

export function SwitchLoadingDemo() {
  const [checked, setChecked] = useState(false);
  const [pending, setPending] = useState<boolean | null>(null);
  useEffect(() => {
    if (pending === null) return;
    const timer = setTimeout(() => {
      setChecked(pending);
      setPending(null);
    }, 1000);
    return () => clearTimeout(timer);
  }, [pending]);
  return (
    <div>
      <Switch
        checked={checked}
        loading={pending !== null}
        onChange={(event) => setPending(event.currentTarget.checked)}
      >
        Автосохранение
      </Switch>
      <p role="status">
        {pending !== null
          ? 'Сохраняем настройку…'
          : `Автосохранение ${checked ? 'включено' : 'выключено'}`}
      </p>
    </div>
  );
}
