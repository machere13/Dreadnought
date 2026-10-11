import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, expect, it } from 'vitest';
import { useUpload } from '../../adapters/react/src/logic.ts';
import { Upload } from '../src/adapters/react/components/Fields/Upload/Upload.tsx';

afterEach(cleanup);

it('keeps a long filename out of the visible start action but preserves its accessible name', () => {
  const name = `${'a'.repeat(200)}.txt`;
  function Example() {
    const upload = useUpload({ upload: async () => {} });
    return <Upload upload={upload} label="Выбрать" dropzone data-testid="upload" />;
  }
  render(<Example />);
  fireEvent.drop(screen.getByTestId('upload'), {
    dataTransfer: { types: ['Files'], files: [new File(['x'], name)] },
  });
  const start = screen.getByRole('button', { name: `Загрузить ${name}` });
  expect(start.textContent).toBe('Загрузить');
  expect(screen.getByText(name)).toBeTruthy();
});

it('uses library buttons and icons for file actions', () => {
  function Example() {
    const upload = useUpload();
    return <Upload upload={upload} label="Выбрать" dropzone data-testid="upload" />;
  }
  render(<Example />);
  fireEvent.drop(screen.getByTestId('upload'), {
    dataTransfer: {
      types: ['Files'],
      files: [new File(['x'], 'report.txt')],
    },
  });
  const remove = screen.getByRole('button', { name: 'Удалить report.txt' });
  expect(remove.getAttribute('data-ui')).toBe('button');
  expect(remove.querySelector('[data-ui="icon"]')).toBeTruthy();
});

it('uses library progress instead of a second progress implementation', () => {
  let report!: (value: number) => void;
  let start!: () => void;
  function Example() {
    const upload = useUpload({
      upload: (_file, ctx) => {
        report = ctx.onProgress;
        return new Promise(() => {});
      },
    });
    start = () => {
      upload.add([new File(['x'], 'a.txt')]);
      void upload.start('1');
    };
    return <Upload upload={upload} label="Выбрать" />;
  }
  render(<Example />);
  act(() => {
    start();
    report(35);
  });
  expect(screen.getByRole('progressbar').getAttribute('data-ui')).toBe('progress');
  expect(screen.getByRole('progressbar').getAttribute('aria-valuenow')).toBe('35');
});
