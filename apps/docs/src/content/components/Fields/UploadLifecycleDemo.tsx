import { useRef, useState } from 'react';
import { useUpload } from '@dreadnought/react/logic';
import { Button, Upload } from '@dreadnought/ui/react';

type Attempt = {
  id: number;
  name: string;
  onProgress(value: number): void;
  resolve(): void;
  reject(error: unknown): void;
};

export function UploadLifecycleDemo() {
  const sequence = useRef(0);
  const [attempts, setAttempts] = useState<Attempt[]>([]);
  function forget(id: number) {
    setAttempts((current) => current.filter((attempt) => attempt.id !== id));
  }
  const upload = useUpload({
    multiple: true,
    maxCount: 3,
    upload: (file, { signal, onProgress }) =>
      new Promise<void>((resolve, reject) => {
        const id = ++sequence.current;
        setAttempts((current) => [
          ...current,
          {
            id,
            name: file.name,
            onProgress,
            resolve() {
              forget(id);
              resolve();
            },
            reject(error) {
              forget(id);
              reject(error);
            },
          },
        ]);
        signal.addEventListener(
          'abort',
          () => {
            forget(id);
            resolve();
          },
          { once: true },
        );
      }),
  });
  return (
    <div style={{ display: 'grid', gap: '1rem', width: '100%' }}>
      <p>Симуляция отправки: без сети, прогресс и результат задаются кнопками.</p>
      <Upload upload={upload} label="Выбрать для отправки" dropzone />
      <Button
        variant="outlined"
        size="compact"
        onClick={() => {
          upload.add([new File(['Demo'], 'example.txt', { type: 'text/plain' })]);
        }}
      >
        Добавить пример файла
      </Button>
      {attempts.map((attempt) => (
        <div
          key={attempt.id}
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '0.5rem',
            alignItems: 'center',
          }}
        >
          <span style={{ overflowWrap: 'anywhere' }}>{attempt.name}</span>
          <Button size="compact" variant="outlined" onClick={() => attempt.onProgress(50)}>
            Прогресс 50%
          </Button>
          <Button size="compact" variant="outlined" onClick={attempt.resolve}>
            Успех
          </Button>
          <Button
            size="compact"
            variant="ghosted"
            onClick={() => attempt.reject(new Error('Demo'))}
          >
            Ошибка
          </Button>
        </div>
      ))}
    </div>
  );
}
