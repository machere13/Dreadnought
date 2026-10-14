import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, expect, it } from 'vitest';
import { sliderDoc } from '../src/content/components/Fields/SliderDoc.tsx';
import { formDoc } from '../src/content/components/Fields/FormDoc.tsx';

afterEach(cleanup);

it.each([
  ['Slider', sliderDoc, 6],
  ['Form', formDoc, 2],
] as const)('pairs each %s scenario with its complete runnable source', (_name, doc, count) => {
  expect(doc.examples).toHaveLength(count);
  for (const example of doc.examples!) {
    const name = (example.demo as { type: { name: string } }).type.name;
    expect(example.code).toBe(
      readFileSync(resolve('apps/docs/src/content/components/Fields', `${name}.tsx`), 'utf8'),
    );
    expect(example.code).not.toMatch(/from ['"]\./);
  }
});

it('updates the decimal value with the configured step and clamps at its bounds', async () => {
  const user = userEvent.setup();
  render(sliderDoc.examples![2].demo);
  const thumb = screen.getByRole('slider', { name: 'Дробное значение' });
  thumb.focus();
  await user.keyboard('{ArrowRight}');
  expect(screen.getByRole('status').textContent).toBe('Коэффициент: 0.5');
  await user.keyboard('{End}{ArrowRight}');
  expect(screen.getByRole('status').textContent).toBe('Коэффициент: 1.0');
  await user.keyboard('{Home}{ArrowLeft}');
  expect(screen.getByRole('status').textContent).toBe('Коэффициент: 0.0');
});

it('updates the volume and each price bound through their documented controls', async () => {
  const user = userEvent.setup();
  const view = render(sliderDoc.examples![0].demo);
  screen.getByRole('slider', { name: 'Громкость' }).focus();
  await user.keyboard('{ArrowRight}');
  expect(screen.getByRole('status').textContent).toBe('Громкость: 26%');
  view.rerender(sliderDoc.examples![1].demo);
  screen.getByRole('slider', { name: 'Цена от' }).focus();
  await user.keyboard('{ArrowRight}');
  expect(screen.getByRole('status').textContent).toBe('Цена: 25–80 ₽');
  screen.getByRole('slider', { name: 'Цена до' }).focus();
  await user.keyboard('{ArrowLeft}');
  expect(screen.getByRole('status').textContent).toBe('Цена: 25–75 ₽');
});

it('selects only named marks with keyboard or mark activation', async () => {
  const user = userEvent.setup();
  render(sliderDoc.examples![3].demo);
  const thumb = screen.getByRole('slider', { name: 'Уровень' });
  thumb.focus();
  await user.keyboard('{ArrowRight}');
  expect(screen.getByRole('status').textContent).toBe('Уровень: Много (100)');
  await user.click(screen.getByRole('button', { name: 'Мало' }));
  expect(screen.getByRole('status').textContent).toBe('Уровень: Мало (0)');
});

it('keeps the vertical range ordered when navigating between discrete marks', async () => {
  const user = userEvent.setup();
  render(sliderDoc.examples![4].demo);
  const lower = screen.getByRole('slider', { name: 'Вертикальный минимум' });
  lower.focus();
  await user.keyboard('{ArrowUp}');
  expect(screen.getByRole('status').textContent).toBe('Вертикальный диапазон: 70–70');
  await user.keyboard('{ArrowUp}{ArrowRight}');
  expect(screen.getByRole('status').textContent).toBe('Вертикальный диапазон: 70–70');
  await user.keyboard('{ArrowDown}');
  expect(screen.getByRole('status').textContent).toBe('Вертикальный диапазон: 30–70');
});

it('validates a basic form, saves its value and resets the field and result', async () => {
  const user = userEvent.setup();
  render(formDoc.examples![0].demo);
  await user.click(screen.getByRole('button', { name: 'Сохранить имя' }));
  expect(await screen.findByText('Введите имя')).toBeTruthy();
  const field = screen.getByRole('textbox', { name: 'Имя для сохранения' });
  await user.type(field, 'Анна');
  await user.click(screen.getByRole('button', { name: 'Сохранить имя' }));
  expect(screen.getByRole('status').textContent).toBe('Сохранено имя: Анна');
  await user.click(screen.getByRole('button', { name: 'Очистить форму' }));
  expect(field).toHaveProperty('value', '');
  expect(screen.queryByRole('status')).toBeNull();
  expect(screen.queryByText('Введите имя')).toBeNull();
});
