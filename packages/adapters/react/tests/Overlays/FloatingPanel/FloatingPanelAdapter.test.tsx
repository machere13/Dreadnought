import { StrictMode } from 'react';
import { createPortal } from 'react-dom';
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, expect, it, vi } from 'vitest';
import { FloatingPanelAdapter, PopoverAdapter } from '../../../src/unstyled.ts';
import type { FloatingPanelAdapterProps } from '../../../src/unstyled.ts';

afterEach(cleanup);

function example(props: Partial<FloatingPanelAdapterProps> = {}) {
  return render(
    <>
      <FloatingPanelAdapter
        aria-label="Помощник"
        content={<input aria-label="Вопрос" />}
        {...props}
      >
        {(trigger) => <button {...trigger}>Открыть</button>}
      </FloatingPanelAdapter>
      <button>Снаружи</button>
    </>,
  );
}

it('opens a nonmodal panel without focusing the editor', () => {
  example();
  const trigger = screen.getByRole('button', { name: 'Открыть' });
  fireEvent.click(trigger);
  const panel = screen.getByRole('dialog', { name: 'Помощник' });
  expect(panel.getAttribute('aria-modal')).toBe('false');
  expect(document.activeElement).toBe(panel);
  expect(trigger.getAttribute('aria-controls')).toBe(panel.id);
  expect(document.documentElement.style.overflow).not.toBe('hidden');
});

it('retains input after closing and reopening', () => {
  example();
  const trigger = screen.getByRole('button', { name: 'Открыть' });
  fireEvent.click(trigger);
  const input = screen.getByRole('textbox') as HTMLInputElement;
  fireEvent.change(input, { target: { value: 'Сохранить ввод' } });
  input.focus();
  fireEvent.keyDown(input, { key: 'Escape' });
  expect(screen.queryByRole('dialog')).toBeNull();
  expect(document.activeElement).toBe(trigger);
  fireEvent.click(trigger);
  expect(screen.getByRole('textbox')).toBe(input);
  expect(input.value).toBe('Сохранить ввод');
});

it('keeps the panel open on outside click, focus and Tab', async () => {
  example();
  fireEvent.click(screen.getByRole('button', { name: 'Открыть' }));
  const outside = screen.getByRole('button', { name: 'Снаружи' });
  await userEvent.click(outside);
  fireEvent.keyDown(outside, { key: 'Escape' });
  expect(screen.getByRole('dialog')).toBeTruthy();
  screen.getByRole('textbox').focus();
  await userEvent.tab();
  expect(screen.getByRole('dialog')).toBeTruthy();
});

it('does not restore focus after closing from outside', () => {
  const view = example({ open: true });
  const outside = screen.getByRole('button', { name: 'Снаружи' });
  outside.focus();
  view.rerender(
    <>
      <FloatingPanelAdapter open={false} content="Содержимое">
        {(p) => <button {...p}>Открыть</button>}
      </FloatingPanelAdapter>
      <button>Снаружи</button>
    </>,
  );
  expect(document.activeElement).toBe(outside);
});

it('requests controlled closing without hiding or moving focus until confirmation', () => {
  const onOpenChange = vi.fn();
  const view = example({ open: true, onOpenChange });
  const input = screen.getByRole('textbox');
  input.focus();
  fireEvent.keyDown(input, { key: 'Escape' });
  expect(onOpenChange).toHaveBeenCalledWith(false);
  expect(screen.getByRole('dialog')).toBeTruthy();
  expect(document.activeElement).toBe(input);
  view.rerender(
    <FloatingPanelAdapter open={false} content={<input aria-label="Вопрос" />}>
      {(p) => <button {...p}>Открыть</button>}
    </FloatingPanelAdapter>,
  );
  expect(screen.queryByRole('dialog')).toBeNull();
  expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Открыть' }));
});

it('hides an open panel when disabled without requesting a state change', () => {
  const onOpenChange = vi.fn();
  const view = example({ open: true, onOpenChange });
  view.rerender(
    <FloatingPanelAdapter open disabled onOpenChange={onOpenChange} content="Содержимое">
      {(p) => <button {...p}>Открыть</button>}
    </FloatingPanelAdapter>,
  );
  expect(screen.queryByRole('dialog')).toBeNull();
  expect((screen.getByRole('button') as HTMLButtonElement).disabled).toBe(true);
  fireEvent.click(screen.getByRole('button'));
  expect(onOpenChange).not.toHaveBeenCalled();
});

it('respects handled Escape and IME composition', () => {
  example({
    onKeyDown: (event) => {
      if (event.altKey) event.preventDefault();
    },
  });
  fireEvent.click(screen.getByRole('button', { name: 'Открыть' }));
  const input = screen.getByRole('textbox');
  fireEvent.keyDown(input, { key: 'Escape', altKey: true });
  fireEvent.keyDown(input, { key: 'Escape', isComposing: true });
  expect(screen.getByRole('dialog')).toBeTruthy();
  fireEvent.keyDown(input, { key: 'Escape' });
  expect(screen.queryByRole('dialog')).toBeNull();
});

it('lets nested Popover handle Escape before its parent', () => {
  example({
    content: (
      <PopoverAdapter content={<input aria-label="Вложенное поле" />}>
        {(p) => <button {...p}>Вложенная панель</button>}
      </PopoverAdapter>
    ),
  });
  fireEvent.click(screen.getByRole('button', { name: 'Открыть' }));
  fireEvent.click(screen.getByRole('button', { name: 'Вложенная панель' }));
  fireEvent.keyDown(screen.getByRole('textbox'), { key: 'Escape' });
  expect(screen.queryByRole('dialog', { name: 'Вложенная панель' })).toBeNull();
  expect(screen.getByRole('dialog', { name: 'Помощник' })).toBeTruthy();
  fireEvent.keyDown(screen.getByRole('button', { name: 'Вложенная панель' }), { key: 'Escape' });
  expect(screen.queryByRole('dialog')).toBeNull();
});

it('uses the trigger owner document for the portal and focus', () => {
  const frame = document.createElement('iframe');
  document.body.append(frame);
  const doc = frame.contentDocument!;
  const view = render(
    <FloatingPanelAdapter content={<input aria-label="Вопрос" />}>
      {(p) => createPortal(<button {...p}>Открыть</button>, doc.body)}
    </FloatingPanelAdapter>,
  );
  const query = within(doc.body);
  const trigger = query.getByRole('button');
  fireEvent.click(trigger);
  const panel = query.getByRole('dialog');
  expect(panel.ownerDocument).toBe(doc);
  expect(doc.activeElement).toBe(panel);
  fireEvent.keyDown(panel, { key: 'Escape' });
  expect(doc.activeElement).toBe(trigger);
  view.unmount();
  expect(doc.querySelector('[data-ui="floating-panel-root"]')).toBeNull();
  frame.remove();
});

it('removes its portal under StrictMode unmount', () => {
  const view = render(
    <StrictMode>
      <FloatingPanelAdapter defaultOpen content="Текст">
        {(p) => <button {...p}>Открыть</button>}
      </FloatingPanelAdapter>
    </StrictMode>,
  );
  expect(screen.getByRole('dialog')).toBeTruthy();
  view.unmount();
  expect(document.querySelector('[data-ui="floating-panel-root"]')).toBeNull();
});
