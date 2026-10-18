import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, expect, it } from 'vitest';
import { accordionDoc } from '../src/content/components/Navigation/Accordion/AccordionDoc.tsx';
import { alertDoc } from '../src/content/components/Feedback/Alert/AlertDoc.tsx';
import { progressDoc } from '../src/content/components/Feedback/Progress/ProgressDoc.tsx';
import { markdownPreviewDoc } from '../src/content/components/DataDisplay/MarkdownPreview/MarkdownPreviewDoc.tsx';
import { floatingPanelDoc } from '../src/content/components/Overlays/FloatingPanel/FloatingPanelDoc.tsx';

afterEach(cleanup);

it.each([
  ['Navigation', accordionDoc, 3],
  ['Feedback', alertDoc, 3],
  ['Feedback', progressDoc, 3],
  ['DataDisplay', markdownPreviewDoc, 2],
  ['Overlays', floatingPanelDoc, 2],
] as const)('provides complete matching example sources for %s / $title', (family, doc, count) => {
  expect(doc.examples).toHaveLength(count);
  for (const example of doc.examples!) {
    const name = (example.demo as { type: { name: string } }).type.name;
    expect(example.code).toBe(
      readFileSync(resolve('apps/docs/src/content/components', family, doc.title, `${name}.tsx`), 'utf8'),
    );
    expect(example.code).not.toMatch(/from ['"]\./);
  }
});

it('keeps multiple Accordion sections open and resets them from the parent', () => {
  render(accordionDoc.examples![1].demo);
  const delivery = screen.getByRole('button', { name: 'Доставка' });
  const payment = screen.getByRole('button', { name: 'Оплата' });
  fireEvent.click(delivery);
  fireEvent.click(payment);
  expect(delivery.getAttribute('aria-expanded')).toBe('true');
  expect(payment.getAttribute('aria-expanded')).toBe('true');
  fireEvent.click(screen.getByRole('button', { name: 'Закрыть все разделы' }));
  expect(delivery.getAttribute('aria-expanded')).toBe('false');
  expect(payment.getAttribute('aria-expanded')).toBe('false');
});

it('preserves lazy input and resets unmounted input after reopening', () => {
  render(accordionDoc.examples![2].demo);
  fireEvent.click(screen.getByRole('button', { name: 'lazy', exact: true }));
  fireEvent.change(screen.getByLabelText('Текст lazy'), { target: { value: 'Черновик' } });
  fireEvent.click(screen.getByRole('button', { name: 'unmount', exact: true }));
  fireEvent.change(screen.getByLabelText('Текст unmount'), { target: { value: 'Сбросить' } });
  fireEvent.click(screen.getByRole('button', { name: 'lazy', exact: true }));
  expect((screen.getByLabelText('Текст lazy') as HTMLInputElement).value).toBe('Черновик');
  fireEvent.click(screen.getByRole('button', { name: 'unmount', exact: true }));
  expect((screen.getByLabelText('Текст unmount') as HTMLInputElement).value).toBe('');
});

it('remounts a dismissed Alert only when the user requests it', () => {
  render(alertDoc.examples![1].demo);
  fireEvent.click(screen.getByRole('button', { name: 'Закрыть подсказку' }));
  expect(screen.queryByRole('status')).toBeNull();
  fireEvent.click(screen.getByRole('button', { name: 'Показать подсказку снова' }));
  expect(screen.getByRole('status').textContent).toContain('Полезная подсказка');
});

it('shows a successful local retry instead of pretending to send a request', () => {
  render(alertDoc.examples![2].demo);
  expect(screen.getByRole('alert')).toBeTruthy();
  fireEvent.click(screen.getByRole('button', { name: 'Повторить' }));
  expect(screen.queryByRole('alert')).toBeNull();
  expect(screen.getByRole('status').textContent).toContain('Данные получены');
  fireEvent.click(screen.getByRole('button', { name: 'Вернуть ошибку' }));
  expect(screen.getByRole('alert')).toBeTruthy();
});

it('updates Progress and clamps repeated increments and decrements at its boundaries', () => {
  render(progressDoc.examples![0].demo);
  const progress = screen.getByRole('progressbar', { name: 'Загрузка файла' });
  const increase = screen.getByRole('button', { name: 'Увеличить' });
  const decrease = screen.getByRole('button', { name: 'Уменьшить' });
  fireEvent.click(increase);
  expect(progress.getAttribute('aria-valuenow')).toBe('45');
  for (let i = 0; i < 10; i++) fireEvent.click(increase);
  expect(progress.getAttribute('aria-valuenow')).toBe('100');
  for (let i = 0; i < 12; i++) fireEvent.click(decrease);
  expect(progress.getAttribute('aria-valuenow')).toBe('0');
});

it('uses a custom maximum without rounding the actual progress value', () => {
  render(progressDoc.examples![1].demo);
  const progress = screen.getByRole('progressbar', { name: 'Обработка документов' });
  expect(progress.getAttribute('aria-valuenow')).toBe('3');
  expect(progress.getAttribute('aria-valuemax')).toBe('8');
  fireEvent.click(screen.getByRole('button', { name: 'Обработать следующий документ' }));
  expect(progress.getAttribute('aria-valuenow')).toBe('4');
  expect(screen.getByText('4 из 8 документов')).toBeTruthy();
});

it('renders Markdown headings, tasks and a real table from the shown source', () => {
  render(markdownPreviewDoc.examples![0].demo);
  expect(screen.getByRole('heading', { name: 'План выпуска', level: 2 })).toBeTruthy();
  expect(screen.getByRole('table').textContent).toContain('Документация');
  expect(screen.getAllByRole('checkbox')).toHaveLength(2);
  expect(screen.getAllByRole('checkbox')[0].hasAttribute('disabled')).toBe(true);
});

it('updates Markdown preview from the editor without executing raw HTML', () => {
  render(markdownPreviewDoc.examples![1].demo);
  fireEvent.change(screen.getByRole('textbox', { name: 'Исходный Markdown' }), {
    target: {
      value: '## Обновлено\n\n<script>alert(1)</script>\n\n[Опасная ссылка](javascript:alert(1))',
    },
  });
  const preview = screen.getByRole('region', { name: 'Результат Markdown' });
  expect(within(preview).getByRole('heading', { name: 'Обновлено' })).toBeTruthy();
  expect(preview.querySelector('script')).toBeNull();
  expect(preview.querySelector('a')?.getAttribute('href') ?? '').not.toMatch(/^javascript:/);
});

it('keeps a FloatingPanel draft when closed and reopened', () => {
  render(floatingPanelDoc.examples![0].demo);
  const trigger = screen.getByRole('button', { name: 'Обратная связь' });
  fireEvent.click(trigger);
  fireEvent.change(screen.getByRole('textbox', { name: 'Сообщение' }), {
    target: { value: 'Черновик' },
  });
  fireEvent.click(screen.getByRole('button', { name: 'Готово' }));
  expect(screen.queryByRole('dialog')).toBeNull();
  fireEvent.click(trigger);
  expect((screen.getByRole('textbox', { name: 'Сообщение' }) as HTMLTextAreaElement).value).toBe(
    'Черновик',
  );
  fireEvent.keyDown(screen.getByRole('textbox', { name: 'Сообщение' }), { key: 'Escape' });
  expect(screen.queryByRole('dialog')).toBeNull();
});

it('accepts parent opening and closing while page controls remain available', () => {
  render(floatingPanelDoc.examples![1].demo);
  fireEvent.click(screen.getByRole('button', { name: 'Открыть извне' }));
  const dialog = screen.getByRole('dialog', { name: 'Вспомогательная панель' });
  expect(dialog.getAttribute('aria-modal')).toBe('false');
  const root = dialog.parentElement!;
  const originalPlacement = root.className;
  expect(root.style.top).toBe('80px');
  fireEvent.click(screen.getByRole('combobox', { name: 'Положение панели' }));
  fireEvent.click(screen.getByRole('option', { name: 'Снизу справа' }));
  expect(screen.getByRole('dialog')).toBe(dialog);
  expect(root.className).not.toBe(originalPlacement);
  expect(root.style.bottom).toBe('160px');
  expect(root.style.top).toBe('');
  fireEvent.click(screen.getByRole('button', { name: 'Закрыть извне' }));
  expect(screen.queryByRole('dialog')).toBeNull();
});
