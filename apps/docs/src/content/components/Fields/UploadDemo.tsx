import { useState } from 'react';
import { useForm, useUpload } from '@dreadnought/react/logic';
import { Button, Form, Upload } from '@dreadnought/ui/react';

export function UploadDemo() {
  const upload = useUpload({
    accept: '.pdf,image/*',
    multiple: true,
    maxCount: 3,
    maxSize: 10485760,
  });
  return (
    <div style={{ display: 'grid', gap: '1rem', width: '100%' }}>
      <Upload upload={upload} label="Выбрать файлы" dropzone data-testid="docs-upload" />
      <Button variant="ghosted" size="compact" onClick={upload.clear}>
        Очистить список
      </Button>
    </div>
  );
}

export function UploadFormDemo() {
  const form = useForm({ initialValues: {} });
  const upload = useUpload({ multiple: true, maxCount: 3 });
  const [saved, setSaved] = useState('');
  return (
    <Form
      form={form}
      onFinish={() => {
        const files = upload.items.map((item) => item.file);
        setSaved(`Выбрано файлов для отправки: ${files.length}`);
      }}
      onReset={() => {
        upload.clear();
        setSaved('');
      }}
    >
      <Upload upload={upload} label="Прикрепить документы" dropzone data-testid="form-upload" />
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
        <Button type="submit">Отправить форму</Button>
        <Button type="reset" variant="outlined">
          Сбросить
        </Button>
      </div>
      {saved && <p role="status">{saved}</p>}
    </Form>
  );
}
