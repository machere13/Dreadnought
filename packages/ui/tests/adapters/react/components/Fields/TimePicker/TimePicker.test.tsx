import { createRef } from 'react';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, expect, it } from 'vitest';
import { TimePicker } from '../../../../../../src/adapters/react/components/Fields/TimePicker/TimePicker.tsx';

afterEach(cleanup);

it('uses themed Input, icon actions and named time columns', async () => {
  const user = userEvent.setup();
  render(<TimePicker aria-label="Time" showSeconds defaultValue="09:07:03" />);
  const field = screen.getByRole('textbox', { name: 'Time' });
  expect(field).toHaveProperty('value', '09:07:03');
  expect(field.closest('[data-ui="input"]')).not.toBeNull();
  const clock = screen.getByRole('button', { name: 'Open time picker' });
  expect(clock.getAttribute('data-ui')).toBe('button');
  expect(clock.querySelector('svg')).not.toBeNull();
  await user.click(clock);
  expect(screen.getByRole('listbox', { name: 'Seconds' })).not.toBeNull();
  expect(screen.getByRole('option', { name: 'Hours 09' }).getAttribute('aria-selected')).toBe(
    'true',
  );
});

it('preserves public ref, native association and user slot classes', () => {
  const ref = createRef<HTMLInputElement>();
  render(
    <>
      <form id="booking" />
      <TimePicker
        ref={ref}
        form="booking"
        name="time"
        aria-label="Time"
        className="local-root"
        slotClassNames={{ field: 'local-field' }}
        defaultValue="09:00:00"
      />
    </>,
  );
  expect(ref.current).toBe(screen.getByRole('textbox'));
  expect(ref.current?.form?.id).toBe('booking');
  expect(ref.current?.closest('[data-ui="time-picker"]')?.classList.contains('local-root')).toBe(
    true,
  );
  expect(ref.current?.closest('[data-slot="field"]')?.classList.contains('local-field')).toBe(true);
  expect(new FormData(ref.current!.form!).getAll('time')).toEqual(['09:00:00']);
});

it('clears invalid text through the icon without allowing readonly edits', async () => {
  const user = userEvent.setup();
  const { rerender } = render(<TimePicker aria-label="Time" />);
  fireEvent.change(screen.getByRole('textbox'), { target: { value: '25:00' } });
  await user.click(screen.getByRole('button', { name: 'Clear time' }));
  expect(screen.getByRole('textbox')).toHaveProperty('value', '');
  rerender(<TimePicker aria-label="Time" readOnly value="09:00:00" />);
  expect(screen.queryByRole('button', { name: 'Clear time' })).toBeNull();
});
