import { createRef } from 'react';
import type { ComponentPropsWithRef } from 'react';
import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, expect, it } from 'vitest';
import { useForm } from '@dreadnought/react/logic';
import { Button } from '../src/adapters/react/components/Controls/Button/Button.tsx';
import { Checkbox } from '../src/adapters/react/components/Fields/Checkbox/Checkbox.tsx';
import { Form } from '../src/adapters/react/components/Fields/Form/Form.tsx';
import { FormField } from '../src/adapters/react/components/Fields/Form/FormField.tsx';
import { Input } from '../src/adapters/react/components/Fields/Input/Input.tsx';
import { Select } from '../src/adapters/react/components/Fields/Select/Select.tsx';

afterEach(cleanup);
const requiredName = (value: string) => (value.trim() ? undefined : 'Введите имя');

it('connects a custom value/onValueChange control to validation and reset', async () => {
  const sent: unknown[] = [];
  function CustomInput({
    onValueChange,
    ...props
  }: Omit<ComponentPropsWithRef<'input'>, 'onChange'> & {
    onValueChange: (value: string) => void;
  }) {
    return <input {...props} onChange={(event) => onValueChange(event.target.value)} />;
  }
  function Example() {
    const form = useForm({ initialValues: { name: '' }, validators: { name: requiredName } });
    const name = form.field('name');
    return (
      <Form
        form={form}
        onFinish={(values) => {
          sent.push(values);
        }}
      >
        <FormField label="Custom" error={name.error}>
          {(props) => (
            <CustomInput
              {...props}
              value={name.value}
              onValueChange={name.setValue}
              onBlur={name.onBlur}
            />
          )}
        </FormField>
        <Button type="submit">Send</Button>
        <Button type="reset">Reset</Button>
      </Form>
    );
  }
  render(<Example />);
  const user = userEvent.setup();
  await user.click(screen.getByRole('button', { name: 'Send' }));
  expect(await screen.findByText('Введите имя')).toBeTruthy();
  expect(sent).toEqual([]);
  await user.type(screen.getByRole('textbox', { name: 'Custom' }), 'Ada');
  await user.click(screen.getByRole('button', { name: 'Send' }));
  await waitFor(() => expect(sent).toEqual([{ name: 'Ada' }]));
  await user.click(screen.getByRole('button', { name: 'Reset' }));
  expect((screen.getByRole('textbox', { name: 'Custom' }) as HTMLInputElement).value).toBe('');
});

it('renders styled form fields, submits different controls and restores them on reset', async () => {
  const sent: unknown[] = [];
  const ref = createRef<HTMLFormElement>();
  function Example() {
    const form = useForm({
      initialValues: { name: '', role: null as string | null, accepted: false },
      validators: { name: requiredName },
    });
    const name = form.field('name');
    const role = form.field('role');
    const accepted = form.field('accepted');
    return (
      <Form
        ref={ref}
        form={form}
        onFinish={(values) => {
          sent.push(values);
        }}
        className="custom-form"
        style={{ maxWidth: 400 }}
      >
        <FormField label="Имя" error={name.error} help="Ваше имя" className="custom-field">
          {(props) => (
            <Input
              {...props}
              value={name.value}
              onBlur={name.onBlur}
              invalid={Boolean(name.error)}
              onChange={(event) => name.setValue(event.target.value)}
            />
          )}
        </FormField>
        <FormField label="Роль">
          {(props) => (
            <Select
              {...props}
              value={role.value}
              onValueChange={role.setValue}
              options={[{ value: 'editor', label: 'Редактор' }]}
            />
          )}
        </FormField>
        <FormField>
          {(props) => (
            <Checkbox
              {...props}
              checked={accepted.value}
              onChange={(event) => accepted.setValue(event.target.checked)}
            >
              Согласен
            </Checkbox>
          )}
        </FormField>
        <Button type="submit">Отправить</Button>
        <Button type="reset">Сбросить</Button>
      </Form>
    );
  }
  render(<Example />);
  const user = userEvent.setup();
  await user.click(screen.getByRole('button', { name: 'Отправить' }));
  expect(await screen.findByText('Введите имя')).toBeTruthy();
  expect(sent).toEqual([]);
  await user.type(screen.getByRole('textbox', { name: 'Имя' }), 'Ada');
  await user.click(screen.getByRole('combobox', { name: 'Роль' }));
  await user.click(await screen.findByRole('option', { name: 'Редактор' }));
  await user.click(screen.getByRole('checkbox', { name: 'Согласен' }));
  await user.click(screen.getByRole('button', { name: 'Отправить' }));
  await waitFor(() => expect(sent).toEqual([{ name: 'Ada', role: 'editor', accepted: true }]));
  expect(ref.current?.classList.contains('custom-form')).toBe(true);
  expect(ref.current?.style.maxWidth).toBe('400px');
  expect(screen.getByText('Ваше имя').parentElement?.classList.contains('custom-field')).toBe(true);
  await user.click(screen.getByRole('button', { name: 'Сбросить' }));
  expect((screen.getByRole('textbox', { name: 'Имя' }) as HTMLInputElement).value).toBe('');
  expect((screen.getByRole('checkbox', { name: 'Согласен' }) as HTMLInputElement).checked).toBe(
    false,
  );
});
