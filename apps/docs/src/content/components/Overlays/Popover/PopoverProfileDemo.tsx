import { useState } from 'react';
import { Button, Form, FormField, Input, Popover } from '@dreadnought/ui/react';

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
          <Form
            style={{ display: 'grid', gap: 12 }}
            onSubmit={(event) => {
              event.preventDefault();
              setName(draft);
              close();
            }}
          >
            <FormField label="Имя профиля" required>
              {(props) => (
                <Input
                  {...props}
                  value={draft}
                  onChange={(event) => setDraft(event.target.value)}
                  required
                />
              )}
            </FormField>
            <Button type="submit">Готово</Button>
          </Form>
        )}
      >
        {(trigger) => <Button {...trigger}>Настройки профиля</Button>}
      </Popover>
      <span role="status">Имя профиля: {name}</span>
    </div>
  );
}
