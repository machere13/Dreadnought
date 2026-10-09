import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, expect, it } from 'vitest';
import { FloatingPanel } from '../src/adapters/react/components/Overlays/FloatingPanel/FloatingPanel.tsx';

afterEach(cleanup);

it('renders named header, scrolling body and optional functional footer', () => {
  render(
    <FloatingPanel
      title="Помощник"
      defaultOpen
      content="Содержание"
      footer={({ close }) => <button onClick={close}>Готово</button>}
    >
      {(trigger) => <button {...trigger}>Открыть</button>}
    </FloatingPanel>,
  );
  const panel = screen.getByRole('dialog', { name: 'Помощник' });
  expect(panel.hasAttribute('title')).toBe(false);
  expect(
    screen
      .getByRole('heading')
      .closest('[data-slot="header"]')
      ?.contains(screen.getByRole('button', { name: 'Закрыть панель' })),
  ).toBe(true);
  expect(screen.getByText('Содержание').closest('[data-slot="body"]')).not.toBeNull();
  expect(
    screen.getByRole('button', { name: 'Готово' }).closest('[data-slot="footer"]'),
  ).not.toBeNull();
  fireEvent.click(screen.getByRole('button', { name: 'Готово' }));
  expect(screen.queryByRole('dialog')).toBeNull();
});

it('preserves explicit names, root styles and panel attributes without empty sections', () => {
  render(
    <FloatingPanel
      defaultOpen
      closable={false}
      aria-label="Custom"
      content="Body"
      title={false}
      footer={null}
      rootClassName="custom-root"
      rootStyle={{ zIndex: 20 }}
      className="custom-panel"
      style={{ color: 'red' }}
      placement="top-left"
    >
      {(trigger) => <button {...trigger}>Open</button>}
    </FloatingPanel>,
  );
  const panel = screen.getByRole('dialog', { name: 'Custom' });
  expect(panel.querySelector('[data-slot="header"]')).toBeNull();
  expect(panel.querySelector('[data-slot="footer"]')).toBeNull();
  expect(panel.classList.contains('custom-panel')).toBe(true);
  expect(panel.style.color).toBe('red');
  expect(panel.parentElement?.classList.contains('custom-root')).toBe(true);
  expect(panel.parentElement?.style.zIndex).toBe('20');
});

it('does not drop zero-valued titles and footers', () => {
  render(
    <FloatingPanel defaultOpen title={0} footer={0} content="Body">
      {(trigger) => <button {...trigger}>Open</button>}
    </FloatingPanel>,
  );
  const panel = screen.getByRole('dialog', { name: '0' });
  expect(panel.querySelector('[data-slot="footer"]')?.textContent).toBe('0');
});
