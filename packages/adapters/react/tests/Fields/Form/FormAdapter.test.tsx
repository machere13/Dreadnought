import { createRef } from 'react';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, expect, it } from 'vitest';
import {
  FormAdapter,
  FormFieldAdapter,
  CheckboxAdapter,
  DatePickerAdapter,
} from '../../../src/unstyled.ts';
import { useForm } from '../../../src/logic.ts';

afterEach(cleanup);

it('clears a DatePicker invalid draft when resetting an unchanged Form value', async () => {
  function Example() {
    const form = useForm({ initialValues: { date: '2026-10-12' as string | null } });
    const date = form.field('date');
    return <FormAdapter form={form}>
      <DatePickerAdapter aria-label="Date" value={date.value} onChange={date.setValue} />
      <button type="reset">Reset</button>
    </FormAdapter>;
  }
  const user = userEvent.setup();
  render(<Example />);
  fireEvent.change(screen.getByRole('textbox'), { target: { value: 'invalid' } });
  await user.click(screen.getByText('Reset'));
  expect(screen.getByRole('textbox')).toHaveProperty('value', '2026-10-12');
});

it.each(['default', 'noValidate', 'formNoValidate', 'disabled', 'readOnly'] as const)(
  'handles DatePicker draft validity with %s validation settings',
  async (setting) => {
    const sent: unknown[] = [];
    function Example() {
      const form = useForm({ initialValues: { date: '2026-10-12' as string | null } });
      const field = form.field('date');
      return (
        <FormAdapter
          form={form}
          noValidate={setting === 'noValidate'}
          onFinish={(values) => {
            sent.push(values);
          }}
        >
          <DatePickerAdapter
            aria-label="Date"
            value={field.value}
            onChange={field.setValue}
            disabled={setting === 'disabled'}
            readOnly={setting === 'readOnly'}
          />
          <button type="submit" formNoValidate={setting === 'formNoValidate'}>
            Send
          </button>
        </FormAdapter>
      );
    }
    render(<Example />);
    const user = userEvent.setup();
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'invalid' } });
    await user.click(screen.getByRole('button', { name: 'Send' }));
    if (setting === 'default') expect(sent).toEqual([]);
    else await waitFor(() => expect(sent).toEqual([{ date: '2026-10-12' }]));
  },
);

it('connects unique labels, help and errors to controls across two forms', () => {
  render(
    <>
      {['First', 'Second'].map((label) => (
        <FormAdapter key={label}>
          <FormFieldAdapter label={label} help="Help" error="Required" required>
            {(props) => <input {...props} />}
          </FormFieldAdapter>
        </FormAdapter>
      ))}
    </>,
  );
  const first = screen.getByRole('textbox', { name: 'First' });
  const second = screen.getByRole('textbox', { name: 'Second' });
  expect(first.id).not.toBe(second.id);
  expect(first.getAttribute('aria-invalid')).toBe('true');
  expect(first.getAttribute('aria-required')).toBe('true');
  const described = first.getAttribute('aria-describedby')!.split(' ');
  expect(described.map((id) => document.getElementById(id)?.textContent)).toEqual([
    'Help',
    'Required',
  ]);
});

it('does not wrap custom checkbox labels in another label', () => {
  const { container } = render(
    <FormFieldAdapter help="Details">
      {(props) => <CheckboxAdapter {...props}>Accept</CheckboxAdapter>}
    </FormFieldAdapter>,
  );
  expect(
    screen.getByRole('checkbox', { name: 'Accept' }).getAttribute('aria-describedby'),
  ).toBeTruthy();
  expect(container.querySelector('label label')).toBeNull();
});

it('submits on Enter and resets the model using native form events', async () => {
  const sent: unknown[] = [];
  function Example() {
    const form = useForm({ initialValues: { name: '' } });
    const name = form.field('name');
    return (
      <FormAdapter
        form={form}
        onFinish={(values) => {
          sent.push(values);
        }}
      >
        <FormFieldAdapter label="Name">
          {(props) => (
            <input
              {...props}
              value={name.value}
              onChange={(event) => name.setValue(event.target.value)}
              onBlur={name.onBlur}
            />
          )}
        </FormFieldAdapter>
        <button type="submit">Send</button>
        <button type="reset">Reset</button>
      </FormAdapter>
    );
  }
  render(<Example />);
  const user = userEvent.setup();
  const input = screen.getByRole('textbox', { name: 'Name' });
  await user.type(input, 'Ada{Enter}');
  await waitFor(() => expect(sent).toEqual([{ name: 'Ada' }]));
  await user.click(screen.getByRole('button', { name: 'Reset' }));
  expect((input as HTMLInputElement).value).toBe('');
});

it('honors prevented submit and reset without swallowing DOM props or refs', async () => {
  const ref = createRef<HTMLFormElement>();
  let sent = false;
  function Example() {
    const form = useForm({ initialValues: { name: 'Ada' } });
    return (
      <FormAdapter
        ref={ref}
        form={form}
        onFinish={() => {
          sent = true;
        }}
        data-testid="form"
        onSubmit={(event) => event.preventDefault()}
        onReset={(event) => event.preventDefault()}
      >
        <input
          aria-label="Name"
          value={form.values.name}
          onChange={(event) => form.setValue('name', event.target.value)}
        />
      </FormAdapter>
    );
  }
  render(<Example />);
  const node = screen.getByTestId('form');
  expect(ref.current).toBe(node);
  expect((node as HTMLFormElement).noValidate).toBe(true);
  fireEvent.change(screen.getByRole('textbox'), { target: { value: 'Grace' } });
  fireEvent.submit(node);
  fireEvent.reset(node);
  expect(sent).toBe(false);
  expect((screen.getByRole('textbox') as HTMLInputElement).value).toBe('Grace');
});

it('preserves native form behavior without a model', () => {
  const ref = createRef<HTMLFormElement>();
  render(
    <FormAdapter ref={ref} action="/submit" noValidate={false}>
      <input defaultValue="Ada" />
    </FormAdapter>,
  );
  expect(ref.current?.noValidate).toBe(false);
  expect(ref.current?.getAttribute('action')).toBe('/submit');
  expect(fireEvent.submit(ref.current!)).toBe(true);
});
