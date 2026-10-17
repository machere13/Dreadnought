import { useUpload } from '@dreadnought/react/logic';
import { Button, Upload } from '@dreadnought/ui/react';

export function UploadDemo() {
  const upload = useUpload({ multiple: true });
  return (
    <div style={{ display: 'grid', gap: '1rem', width: '100%' }}>
      <Upload upload={upload} label="Выбрать файлы" dropzone data-testid="docs-upload" />
      <Button variant="ghosted" size="compact" onClick={upload.clear}>
        Очистить список
      </Button>
      <p>В списке файлов: {upload.items.length}. Файлы не отправляются на сервер.</p>
    </div>
  );
}
