import { createRef } from 'react';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, expect, it } from 'vitest';
import { FormAdapter, FormFieldAdapter, CheckboxAdapter } from '../../../src/unstyled.ts';
import { useForm } from '../../../src/logic.ts';

afterEach(cleanup);

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
