import { useState } from 'react';
import { Button, Input, Popover } from '@dreadnought/ui/react';

export function PopoverProfileDemo() {
  const [name, setName] = useState('Анна');
  const [draft, setDraft] = useState(name);
  return (
    <div style={{ display: 'grid', gap: 16, justifyItems: 'start' }}>
      <Popover
        aria-label="Настройки профиля"
        onOpenChange={(open) => {
          if (open) setDraft(name);
        }}
        content={({ close }) => (
          <form
            style={{ display: 'grid', gap: 12 }}
            onSubmit={(event) => {
              event.preventDefault();
              setName(draft);
              close();
            }}
          >
            <Input
              aria-label="Имя профиля"
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              required
            />
            <Button type="submit">Готово</Button>
          </form>
        )}
      >
        {(trigger) => <Button {...trigger}>Настройки профиля</Button>}
      </Popover>
      <span role="status">Имя профиля: {name}</span>
    </div>
  );
}
