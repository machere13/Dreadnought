import { useState } from 'react';
import { Button, Input, Drawer } from '@dreadnought/ui/react';

export function DrawerProfileDemo() {
  const [open, setOpen] = useState(false);
  const [savedName, setSavedName] = useState('');
  const [draft, setDraft] = useState('');
  return (
    <div>
      <Drawer
        open={open}
        mountPolicy="unmount"

        aria-label="Настройки профиля"
        onOpenChange={(next) => {
          if (next) setDraft(savedName);
          setOpen(next);
        }}
        content={({ close }) => (
          <form
            id="drawer-profile-form"
            onSubmit={(event) => {
              event.preventDefault();
              if (!draft.trim()) return;
              setSavedName(draft.trim());
              close();
            }}
            style={{ display: 'grid', gap: 16 }}
          >
            <h2>Профиль</h2>
            <label htmlFor="drawer-profile-name">Имя профиля</label>
            <Input
              id="drawer-profile-name"
              required
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              placeholder="Ваше имя"
            />
            <div style={{ display: 'flex', gap: 8 }}>
              <Button variant="secondary" onClick={close}>
                Отмена
              </Button>
              <Button type="submit" disabled={!draft.trim()}>
                Сохранить профиль
              </Button>
            </div>
          </form>
        )}
      >
        {(trigger) => <Button {...trigger}>Настроить профиль</Button>}
      </Drawer>
      <p role="status">Сохранённое имя: {savedName || 'не задано'}</p>
    </div>
  );
}
