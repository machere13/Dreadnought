import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, expect, it } from 'vitest';
import { UploadDemo, UploadFormDemo } from '../src/content/components/Fields/UploadDemo.tsx';

afterEach(cleanup);

it('shows accepted files and rejects unsupported types in the documentation example', () => {
  render(<UploadDemo />);
  fireEvent.drop(screen.getByTestId('docs-upload'), {
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
  await user.click(screen.getByRole('button', { name: 'Отправить форму' }));
  expect(screen.getByText('Выбрано файлов для отправки: 1')).toBeTruthy();
  await user.click(screen.getByRole('button', { name: 'Сбросить' }));
  expect(screen.queryByRole('button', { name: 'Удалить a.pdf' })).toBeNull();
});
