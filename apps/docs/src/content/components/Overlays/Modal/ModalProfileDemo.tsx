import { useState } from 'react';
import { Button, Form, FormField, Input, Modal } from '@dreadnought/ui/react';

export function ModalProfileDemo() {
  const [open, setOpen] = useState(false);
  const [savedName, setSavedName] = useState('');
  const [draft, setDraft] = useState('');
  return (
    <div>
      <Modal
        open={open}
        mountPolicy="unmount"
        title="Профиль"
        aria-label="Редактирование профиля"
        onOpenChange={(next) => {
          if (next) setDraft(savedName);
          setOpen(next);
        }}
        content={({ close }) => (
          <Form
            id="modal-profile-form"
            onSubmit={(event) => {
              event.preventDefault();
              if (!draft.trim()) return;
              setSavedName(draft.trim());
              close();
            }}
            style={{ display: 'grid', gap: 16 }}
          >
            <FormField label="Имя профиля" required>
              {(props) => (
                <Input
                  {...props}
                  required
                  value={draft}
                  onChange={(event) => setDraft(event.target.value)}
                  placeholder="Ваше имя"
                />
              )}
            </FormField>
          </Form>
        )}
        footer={({ close }) => (
          <>
            <Button variant="secondary" onClick={close}>
              Отмена
            </Button>
            <Button type="submit" form="modal-profile-form" disabled={!draft.trim()}>
              Сохранить профиль
            </Button>
          </>
        )}
      >
        {(trigger) => <Button {...trigger}>Редактировать профиль</Button>}
      </Modal>
      <p role="status">Сохранённое имя: {savedName || 'не задано'}</p>
    </div>
  );
}
