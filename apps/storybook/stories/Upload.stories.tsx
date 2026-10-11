import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { useForm, useUpload } from '@dreadnought/react/logic';
import { Button, Form, Upload } from '@dreadnought/ui/react';

function Selection({ dropzone = false }: { dropzone?: boolean }) {
  const upload = useUpload({ multiple: true, maxCount: 3, maxSize: 10485760 });
  return <Upload upload={upload} label="Выбрать файлы" dropzone={dropzone} />;
}

function Lifecycle() {
  const [pending, setPending] = useState<{
    onProgress(value: number): void;
    resolve(): void;
    reject(): void;
  } | null>(null);
  const upload = useUpload({
    upload: (_file, { signal, onProgress }) =>
      new Promise<void>((resolve, reject) => {
        setPending({
          onProgress,
          resolve() {
            setPending(null);
            resolve();
          },
          reject() {
            setPending(null);
            reject(new Error('Simulated failure'));
          },
        });
        signal.addEventListener(
          'abort',
          () => {
            setPending(null);
            resolve();
          },
          { once: true },
        );
      }),
  });
  return (
    <div style={{ display: 'grid', gap: '1rem' }}>
      <p>Симуляция без сети. Добавьте файл, затем запустите загрузку.</p>
      <Upload upload={upload} label="Выбрать файл" dropzone />
      <Button variant="outlined" onClick={() => upload.add([new File(['x'], 'example.txt')])}>
        Добавить пример
      </Button>
      {pending && (
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <Button onClick={() => pending.onProgress(50)}>50%</Button>
          <Button onClick={pending.resolve}>Успех</Button>
          <Button onClick={pending.reject}>Ошибка</Button>
        </div>
      )}
    </div>
  );
}

function WithFormExample() {
  const form = useForm({ initialValues: {} });
  const upload = useUpload({ multiple: true });
  const [count, setCount] = useState<number | null>(null);
  return (
    <Form
      form={form}
      onFinish={() => setCount(upload.items.length)}
      onReset={() => {
        upload.clear();
        setCount(null);
      }}
    >
      <Upload upload={upload} label="Файлы формы" dropzone />
      <Button type="submit">Отправить</Button>
      <Button type="reset" variant="outlined">
        Сбросить
      </Button>
      {count !== null && <p>Выбрано файлов: {count}</p>}
    </Form>
  );
}

const meta = {
  title: 'Fields/Upload',
  component: Upload,
  parameters: { controls: { disable: true }, layout: 'padded' },
} satisfies Meta<typeof Upload>;
export default meta;
type Story = StoryObj;
export const SelectionOnly: Story = { render: () => <Selection /> };
export const Dropzone: Story = { render: () => <Selection dropzone /> };
export const UploadLifecycle: Story = { render: () => <Lifecycle /> };
export const WithForm: Story = { render: () => <WithFormExample /> };
