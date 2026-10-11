import { createRef } from 'react';
import { act, cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, expect, it, vi } from 'vitest';
import { useUpload } from '../../../src/logic.ts';
import { UploadAdapter } from '../../../src/Fields/Upload/UploadAdapter.tsx';
import type {
  UploadAdapterProps,
  UseUploadResult,
} from '../../../src/Fields/Upload/upload.types.ts';

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});
let model: UseUploadResult;
function Example(props: Omit<UploadAdapterProps, 'upload' | 'label'> & { disabled?: boolean }) {
  const { disabled, ...dom } = props;
  model = useUpload({ multiple: true, accept: '.txt', disabled });
  return <UploadAdapter {...dom} upload={model} label="Прикрепить файлы" />;
}
const file = (name = 'x.txt') => new File(['x'], name);
const transfer = (files: File[] = []) => ({ files, types: ['Files'] });

it('allows keyboard selection through the real picker and forwards ref/DOM properties', async () => {
  const ref = createRef<HTMLDivElement>();
  let input!: HTMLInputElement;
  vi.spyOn(HTMLInputElement.prototype, 'click').mockImplementation(function () {
    input = this;
  });
  render(<Example ref={ref} data-testid="upload" />);
  const user = userEvent.setup();
  await user.tab();
  await user.keyboard('{Enter}');
  expect(model.picking).toBe(true);
  expect(input.accept).toBe('.txt');
  Object.defineProperty(input, 'files', { value: [file()] });
  await act(async () => {
    input.dispatchEvent(new Event('change'));
  });
  expect(screen.getByText('x.txt')).toBeTruthy();
  expect(ref.current).toBe(screen.getByTestId('upload'));
  expect(screen.getByRole('button', { name: 'Удалить x.txt' }).getAttribute('type')).toBe('button');
});

it('uses shared limits for drop and ignores nonfile payloads', () => {
  render(<Example dropzone data-testid="upload" />);
  const root = screen.getByTestId('upload');
  fireEvent.drop(root, { dataTransfer: transfer([file(), file('bad.pdf')]) });
  expect(model.items.map((item) => item.file.name)).toEqual(['x.txt']);
  expect(model.rejections[0].reason).toBe('type');
  fireEvent.drop(root, { dataTransfer: { types: ['text/html'], files: [] } });
  expect(model.items).toHaveLength(1);
});

it('lets user handlers cancel drop and disabled prevents picking and adding', () => {
  const { rerender } = render(
    <Example dropzone data-testid="upload" onDrop={(e) => e.preventDefault()} />,
  );
  fireEvent.drop(screen.getByTestId('upload'), { dataTransfer: transfer([file()]) });
  expect(model.items).toHaveLength(0);
  rerender(<Example disabled dropzone data-testid="upload" />);
  fireEvent.drop(screen.getByTestId('upload'), { dataTransfer: transfer([file()]) });
  expect(model.items).toHaveLength(0);
  expect((screen.getByRole('button') as HTMLButtonElement).disabled).toBe(true);
});

it('does not flicker across nested drag targets and clears drag state when disabled', () => {
  const { rerender } = render(<Example dropzone data-testid="upload" />);
  const root = screen.getByTestId('upload');
  const button = screen.getByRole('button');
  fireEvent.dragEnter(root, { dataTransfer: transfer() });
  fireEvent.dragEnter(button, { dataTransfer: transfer() });
  fireEvent.dragLeave(button, { dataTransfer: transfer() });
  expect(root.getAttribute('data-dragging')).toBe('true');
  fireEvent.dragLeave(root, { dataTransfer: transfer() });
  expect(root.getAttribute('data-dragging')).toBeNull();
  fireEvent.dragEnter(root, { dataTransfer: transfer() });
  rerender(<Example disabled dropzone data-testid="upload" />);
  expect(root.getAttribute('data-dragging')).toBeNull();
});

it('restores focus after removing a focused item or clearing externally', async () => {
  render(<Example />);
  act(() => model.add([file('one.txt'), file('two.txt')]));
  const user = userEvent.setup();
  await user.click(screen.getByRole('button', { name: 'Удалить one.txt' }));
  expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Удалить two.txt' }));
  act(() => model.clear());
  expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Прикрепить файлы' }));
});

it('does not steal outside focus after external removal', () => {
  render(
    <>
      <Example />
      <button>Outside</button>
    </>,
  );
  act(() => model.add([file()]));
  screen.getByRole('button', { name: 'Удалить x.txt' }).focus();
  const outside = screen.getByRole('button', { name: 'Outside' });
  outside.focus();
  act(() => model.clear());
  expect(document.activeElement).toBe(outside);
});

it('shows safe errors and does not announce each progress update', async () => {
  let report!: (value: number) => void;
  let reject!: (error: unknown) => void;
  function Sending() {
    model = useUpload({
      upload: (_file, ctx) => {
        report = ctx.onProgress;
        return new Promise<void>((_yes, no) => {
          reject = no;
        });
      },
    });
    return <UploadAdapter upload={model} label="Файл" />;
  }
  render(<Sending />);
  act(() => model.add([file()]));
  let task!: Promise<void>;
  act(() => {
    task = model.start(model.items[0].id);
  });
  const announcement = screen.getByRole('status').textContent;
  act(() => report(45));
  expect((screen.getByRole('progressbar') as HTMLProgressElement).value).toBe(45);
  expect(screen.getByRole('status').textContent).toBe(announcement);
  await act(async () => {
    reject('secret-server-token');
    await task;
  });
  expect(screen.queryByText('secret-server-token')).toBeNull();
  expect(screen.getByRole('button', { name: 'Повторить x.txt' })).toBeTruthy();
});

it('skips directory entries without traversing them', () => {
  render(<Example dropzone data-testid="upload" />);
  fireEvent.drop(screen.getByTestId('upload'), {
    dataTransfer: {
      types: ['Files'],
      files: [file('folder'), file()],
      items: [
        {
          kind: 'file',
          webkitGetAsEntry: () => ({ isDirectory: true }),
          getAsFile: () => file('folder'),
        },
        { kind: 'file', webkitGetAsEntry: () => ({ isDirectory: false }), getAsFile: () => file() },
      ],
    },
  });
  expect(within(screen.getByRole('list')).getAllByRole('listitem')).toHaveLength(1);
  expect(model.items[0].file.name).toBe('x.txt');
});
