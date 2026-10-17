import { Button, FloatingPanel, TextArea } from '@dreadnought/ui/react';

export function FloatingPanelDraftDemo() {
  return (
    <FloatingPanel
      title="Обратная связь"
      rootStyle={{ bottom: 96 }}
      content={<TextArea aria-label="Сообщение" placeholder="Ваше сообщение" />}
      footer={({ close }) => <Button onClick={close}>Готово</Button>}
    >
      {(trigger) => <Button {...trigger}>Обратная связь</Button>}
    </FloatingPanel>
  );
}
