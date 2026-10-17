import { MarkdownEditor } from '@dreadnought/ui/react';

const demoImageUrl = '/markdown-upload-demo.svg';

export function MarkdownImageDemo() {
  return (
    <div style={{ display: 'grid', gap: 12 }}>
      <MarkdownEditor
        aria-label="Markdown с изображением"
        defaultValue={'Картинка:\n\n'}
        defaultPreview="live"
        rows={5}
        uploadImage={async () => demoImageUrl}
      />
      <p>
        Файл не отправляется на сервер. Тестовый SVG находится по адресу {demoImageUrl} в
        документации. В своём проекте замените этот URL или обработчик uploadImage.
      </p>
    </div>
  );
}
