import { useUpload } from '@dreadnought/react/logic';
import { Button, Upload } from '@dreadnought/ui/react';

export function UploadLimitsDemo() {
  const upload = useUpload({
    accept: '.pdf,image/*',
    multiple: true,
    maxCount: 3,
    maxSize: 10 * 1024 * 1024,
  });
  return (
    <div style={{ display: 'grid', gap: 16 }}>
      <Upload
        upload={upload}
        label="Выбрать PDF или изображения"
        dropzone
        data-testid="docs-upload-limits"
      />
      <p>Принято файлов: {upload.items.length} из 3. Максимум 10 МиБ на файл.</p>
      <Button variant="ghosted" size="compact" onClick={upload.clear}>
        Очистить список
      </Button>
    </div>
  );
}
