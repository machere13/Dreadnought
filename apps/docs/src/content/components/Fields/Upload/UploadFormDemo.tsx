import { useState } from 'react';
import { useForm, useUpload } from '@dreadnought/react/logic';
import { Button, Form, Upload } from '@dreadnought/ui/react';

export function UploadFormDemo() {
  const form = useForm({ initialValues: {} });
  const upload = useUpload({ multiple: true, maxCount: 3 });
  const [saved, setSaved] = useState<string[] | null>(null);
  return (
    <Form
      form={form}
      onFinish={() => setSaved(upload.items.map((item) => item.file.name))}
      onReset={() => {
        upload.clear();
        setSaved(null);
      }}
    >
      <Upload upload={upload} label="Прикрепить документы" dropzone data-testid="form-upload" />
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <Button type="submit">Сохранить список</Button>
        <Button type="reset" variant="outlined">
          Сбросить
        </Button>
      </div>
      {saved !== null && (
        <div role="status" aria-label="Сохранённый список файлов">
          <p>Файлов в сохранённом списке: {saved.length}</p>
          <p>{saved.length ? saved.join(', ') : 'Список пуст'}</p>
        </div>
      )}
    </Form>
  );
}
