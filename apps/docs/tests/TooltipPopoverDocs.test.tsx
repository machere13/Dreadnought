import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { act, cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import { tooltipDoc } from '../src/content/components/Overlays/TooltipDoc.tsx';
import { popoverDoc } from '../src/content/components/Overlays/PopoverDoc.tsx';

afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

it.each([
  ['Tooltip', tooltipDoc, 3],
  ['Popover', popoverDoc, 3],
] as const)('pairs each %s demo with its complete source', (_name, doc, count) => {
  expect(doc.examples).toHaveLength(count);
  for (const example of doc.examples!) {
    const name = (example.demo as { type: { name: string } }).type.name;
    expect(example.code).toBe(
      readFileSync(resolve('apps/docs/src/content/components/Overlays', `${name}.tsx`), 'utf8'),
    );
    expect(example.code).not.toMatch(/from ['"]\./);
  }
});

it('connects the basic tooltip to its named trigger and dismisses with Escape', () => {
  render(tooltipDoc.examples![0].demo);
  const trigger = screen.getByRole('button', { name: 'Настройки' });
  fireEvent.focus(trigger);
  const tooltip = screen.getByRole('tooltip');
  expect(tooltip.textContent).toBe('Открывает настройки приложения');
  expect(trigger.getAttribute('aria-describedby')).toBe(tooltip.id);
  fireEvent.keyDown(trigger, { key: 'Escape' });
  expect(screen.queryByRole('tooltip')).toBeNull();
});

it('uses independent delays and a genuinely instant alternative', () => {
  vi.useFakeTimers();
  render(tooltipDoc.examples![2].demo);
  const delayed = screen.getByRole('button', { name: 'С задержкой' });
  fireEvent.pointerEnter(delayed);
  act(() => vi.advanceTimersByTime(499));
  expect(screen.queryByRole('tooltip')).toBeNull();
  act(() => vi.advanceTimersByTime(1));
  expect(screen.getByRole('tooltip').textContent).toBe(
    'Появляется через 500 мс, скрывается через 300 мс',
  );
  fireEvent.pointerLeave(delayed);
  act(() => vi.advanceTimersByTime(299));
  expect(screen.getByRole('tooltip')).toBeTruthy();
  act(() => vi.advanceTimersByTime(1));
  expect(screen.queryByRole('tooltip')).toBeNull();
  const instant = screen.getByRole('button', { name: 'Без задержки' });
  fireEvent.pointerEnter(instant);
  expect(screen.getByRole('tooltip').textContent).toBe('Появляется и скрывается мгновенно');
  fireEvent.pointerLeave(instant);
  expect(screen.queryByRole('tooltip')).toBeNull();
});

it('opens each placement tooltip and omits the arrow in its no-arrow example', () => {
  render(tooltipDoc.examples![1].demo);
  for (const [label, content] of [
    ['Сверху', 'Подсказка сверху'],
    ['Справа', 'Подсказка справа'],
    ['Без стрелки', 'Подсказка без стрелки'],
  ]) {
    const trigger = screen.getByRole('button', { name: label });
    fireEvent.focus(trigger);
    const tooltip = screen.getByRole('tooltip');
    expect(tooltip.textContent).toBe(content);
    expect(Boolean(tooltip.querySelector('[data-ui="tooltip-arrow"]'))).toBe(
      label !== 'Без стрелки',
    );
    fireEvent.keyDown(trigger, { key: 'Escape' });
  }
});

it('saves a profile locally, restores focus and discards edits on Escape', () => {
  render(popoverDoc.examples![0].demo);
  const trigger = screen.getByRole('button', { name: 'Настройки профиля' });
  fireEvent.click(trigger);
  const field = screen.getByRole('textbox', { name: 'Имя профиля' });
  expect(document.activeElement).toBe(field);
  fireEvent.change(field, { target: { value: 'Ada' } });
  fireEvent.submit(field.closest('form')!);
  expect(screen.queryByRole('dialog')).toBeNull();
  expect(screen.getByRole('status').textContent).toBe('Имя профиля: Ada');
  expect(document.activeElement).toBe(trigger);
  fireEvent.click(trigger);
  const draft = screen.getByRole('textbox', { name: 'Имя профиля' });
  expect((draft as HTMLInputElement).value).toBe('Ada');
  fireEvent.change(draft, { target: { value: 'Не сохранено' } });
  fireEvent.keyDown(draft, { key: 'Escape' });
  fireEvent.click(trigger);
  expect((screen.getByRole('textbox', { name: 'Имя профиля' }) as HTMLInputElement).value).toBe(
    'Ada',
  );
});

it('accepts external opening and closing through the controlled panel', () => {
  render(popoverDoc.examples![1].demo);
  fireEvent.click(screen.getByRole('button', { name: 'Открыть извне' }));
  const panel = screen.getByRole('dialog', { name: 'Управляемая панель' });
  expect(panel.getAttribute('aria-modal')).toBe('false');
  expect(screen.getByRole('status').textContent).toBe('Панель открыта');
  fireEvent.click(within(panel).getByRole('button', { name: 'Закрыть панель' }));
  expect(screen.queryByRole('dialog')).toBeNull();
  expect(screen.getByRole('status').textContent).toBe('Панель закрыта');
  expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Управляемая панель' }));
});

it('opens both placement panels and keeps the no-arrow panel without an arrow', () => {
  render(popoverDoc.examples![2].demo);
  for (const label of ['Сверху справа', 'Без стрелки']) {
    const trigger = screen.getByRole('button', { name: label });
    fireEvent.click(trigger);
    const panel = screen.getByRole('dialog', { name: label });
    expect(Boolean(panel.querySelector('[data-ui="popover-arrow"]'))).toBe(label !== 'Без стрелки');
    fireEvent.keyDown(panel, { key: 'Escape' });
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(document.activeElement).toBe(trigger);
  }
});
