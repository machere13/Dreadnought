import { createRef, useState } from 'react';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, expect, it } from 'vitest';
import * as adapters from '../../../src/unstyled.ts';

afterEach(cleanup);

it('exposes a labelled native switch and toggles with Space', async () => {
  const ref = createRef<HTMLInputElement>();
  render(<adapters.SwitchAdapter ref={ref}>Уведомления</adapters.SwitchAdapter>);
  const input = screen.getByRole('switch', { name: 'Уведомления' }) as HTMLInputElement;
  expect(ref.current).toBe(input);
  expect(input.checked).toBe(false);
  await userEvent.tab();
  expect(document.activeElement).toBe(input);
  await userEvent.keyboard(' ');
  expect(input.checked).toBe(true);
});

it('keeps controlled state until the consumer accepts the change', async () => {
  function Demo() {
    const [checked, setChecked] = useState(false);
    return (
      <adapters.SwitchAdapter
        checked={checked}
        onChange={(event) => setChecked(event.currentTarget.checked)}
      >
        Тема
      </adapters.SwitchAdapter>
    );
  }
  const { rerender } = render(
    <adapters.SwitchAdapter checked={false} onChange={() => {}}>
      Тема
    </adapters.SwitchAdapter>,
  );
  await userEvent.click(screen.getByRole('switch'));
  expect((screen.getByRole('switch') as HTMLInputElement).checked).toBe(false);
  rerender(<Demo />);
  await userEvent.click(screen.getByRole('switch'));
  expect((screen.getByRole('switch') as HTMLInputElement).checked).toBe(true);
});

it('submits native values and resets to defaultChecked', async () => {
  render(
    <form aria-label="Настройки">
      <adapters.SwitchAdapter name="alerts" value="enabled" defaultChecked>
        Оповещения
      </adapters.SwitchAdapter>
    </form>,
  );
  const input = screen.getByRole('switch') as HTMLInputElement;
  expect(new FormData(input.form!).get('alerts')).toBe('enabled');
  await userEvent.click(input);
  expect(new FormData(input.form!).has('alerts')).toBe(false);
  input.form!.reset();
  expect(input.checked).toBe(true);
});

it('cannot activate a disabled switch or submit its value', async () => {
  render(
    <form>
      <adapters.SwitchAdapter disabled defaultChecked name="alerts">
        Оповещения
      </adapters.SwitchAdapter>
    </form>,
  );
  const input = screen.getByRole('switch') as HTMLInputElement;
  await userEvent.click(input);
  expect(input.checked).toBe(true);
  expect(new FormData(input.form!).has('alerts')).toBe(false);
  await userEvent.tab();
  expect(document.activeElement).not.toBe(input);
});

it('forwards field validation, external form and custom slots', () => {
  render(
    <>
      <form id="settings" />
      <adapters.SwitchAdapter
        aria-label="Согласие"
        form="settings"
        name="consent"
        required
        invalid
        className="custom-root"
        slotProps={{ label: { id: 'consent-label' }, indicator: { className: 'custom-track' } }}
      />
    </>,
  );
  const input = screen.getByRole('switch') as HTMLInputElement;
  expect(input.form?.id).toBe('settings');
  expect(input.checkValidity()).toBe(false);
  expect(input.getAttribute('aria-invalid')).toBe('true');
  expect(input.closest('label')?.className).toContain('custom-root');
  expect(document.getElementById('consent-label')?.querySelector('.custom-track')).not.toBeNull();
  fireEvent.click(input);
  expect(input.checkValidity()).toBe(true);
});
