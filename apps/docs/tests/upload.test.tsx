import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { uploadDoc } from '../src/content/components/Fields/UploadDoc.tsx';
import { UploadDemo } from '../src/content/components/Fields/UploadDemo.tsx';
import { UploadFormDemo } from '../src/content/components/Fields/UploadFormDemo.tsx';
import { UploadLimitsDemo } from '../src/content/components/Fields/UploadLimitsDemo.tsx';
import { UploadLifecycleDemo } from '../src/content/components/Fields/UploadLifecycleDemo.tsx';

afterEach(cleanup);

it('pairs each upload scenario with its complete portable source', () => {
  expect(uploadDoc.examples).toHaveLength(4);
  for (const example of uploadDoc.examples!) {
    const name = (example.demo as { type: { name: string } }).type.name;
    expect(example.code).toBe(
      readFileSync(resolve('apps/docs/src/content/components/Fields', `${name}.tsx`), 'utf8'),
    );
    expect(example.code).not.toMatch(/from ['"]\./);
  }
});

it('selects files without offering upload and clears the local list', async () => {
  const user = userEvent.setup();
  render(<UploadDemo />);
  fireEvent.drop(screen.getByTestId('docs-upload'), {
    dataTransfer: { types: ['Files'], files: [new File(['x'], 'notes.txt')] },
  });
  expect(screen.getByText('В списке файлов: 1. Файлы не отправляются на сервер.')).toBeTruthy();
  expect(screen.queryByRole('button', { name: 'Загрузить notes.txt' })).toBeNull();
  await user.click(screen.getByRole('button', { name: 'Очистить список' }));
  expect(screen.queryByRole('button', { name: 'Удалить notes.txt' })).toBeNull();
});

it('rejects oversized and excess files while accepting the three allowed files', () => {
  render(<UploadLimitsDemo />);
  const tooLarge = new File([new Uint8Array(10 * 1024 * 1024 + 1)], 'large.pdf');
  fireEvent.drop(screen.getByTestId('docs-upload-limits'), {
    dataTransfer: {
      types: ['Files'],
      files: [
        tooLarge,
        ...['a.pdf', 'b.pdf', 'c.pdf', 'd.pdf'].map((name) => new File(['x'], name)),
      ],
    },
  });
  for (const name of ['a.pdf', 'b.pdf', 'c.pdf']) {
    expect(screen.getByRole('button', { name: `Удалить ${name}` })).toBeTruthy();
  }
  expect(screen.queryByRole('button', { name: 'Удалить large.pdf' })).toBeNull();
  expect(screen.queryByRole('button', { name: 'Удалить d.pdf' })).toBeNull();
  expect(screen.getByText('Принято файлов: 3 из 3. Максимум 10 МиБ на файл.')).toBeTruthy();
});

it('reports simulated progress, retries an error and completes the next attempt', async () => {
  const user = userEvent.setup();
  render(<UploadLifecycleDemo />);
  await user.click(screen.getByRole('button', { name: 'Добавить пример файла' }));
  await user.click(screen.getByRole('button', { name: 'Загрузить example.txt' }));
  await user.click(screen.getByRole('button', { name: 'Прогресс 50%' }));
  expect(
    screen.getByRole('progressbar', { name: 'Загрузка example.txt' }).getAttribute('aria-valuenow'),
  ).toBe('50');
  expect(screen.queryByText('Загружен', { exact: true })).toBeNull();
  await user.click(screen.getByRole('button', { name: 'Ошибка', exact: true }));
  expect(screen.getByText('Не удалось загрузить', { exact: true })).toBeTruthy();
  expect(screen.queryByRole('button', { name: 'Успех' })).toBeNull();
  await user.click(screen.getByRole('button', { name: 'Повторить example.txt' }));
  await user.click(screen.getByRole('button', { name: 'Успех' }));
  expect(screen.getByText('Загружен', { exact: true })).toBeTruthy();
  expect(screen.queryByRole('button', { name: 'Повторить example.txt' })).toBeNull();
});

it('cancels an active simulation and permits a fresh attempt', async () => {
  const user = userEvent.setup();
  render(<UploadLifecycleDemo />);
  await user.click(screen.getByRole('button', { name: 'Добавить пример файла' }));
  await user.click(screen.getByRole('button', { name: 'Загрузить example.txt' }));
  await user.click(screen.getByRole('button', { name: 'Отменить example.txt' }));
  expect(screen.getByText('Загрузка отменена', { exact: true })).toBeTruthy();
  expect(screen.queryByRole('button', { name: 'Успех' })).toBeNull();
  await user.click(screen.getByRole('button', { name: 'Повторить example.txt' }));
  await user.click(screen.getByRole('button', { name: 'Успех' }));
  expect(screen.getByText('Загружен', { exact: true })).toBeTruthy();
});

it('shows accepted files and rejects unsupported types in the documentation example', () => {
  render(<UploadLimitsDemo />);
  fireEvent.drop(screen.getByTestId('docs-upload-limits'), {
    dataTransfer: {
      types: ['Files'],
      files: [new File(['x'], 'a.pdf'), new File(['x'], 'bad.exe')],
    },
  });
  expect(screen.getByRole('button', { name: 'Удалить a.pdf' })).toBeTruthy();
  expect(screen.queryByRole('button', { name: 'Удалить bad.exe' })).toBeNull();
});

it('submits actual selected files with a form and clears them on reset', async () => {
  render(<UploadFormDemo />);
  fireEvent.drop(screen.getByTestId('form-upload'), {
    dataTransfer: {
      types: ['Files'],
      files: [new File(['x'], 'a.pdf')],
    },
  });
  const user = userEvent.setup();
  await user.click(screen.getByRole('button', { name: 'Сохранить список' }));
  expect(screen.getByText('Файлов в сохранённом списке: 1')).toBeTruthy();
  expect(screen.getByRole('status', { name: 'Сохранённый список файлов' }).textContent).toContain(
    'a.pdf',
  );
  await user.click(screen.getByRole('button', { name: 'Сбросить' }));
  expect(screen.queryByRole('button', { name: 'Удалить a.pdf' })).toBeNull();
  expect(screen.queryByRole('status', { name: 'Сохранённый список файлов' })).toBeNull();
});
