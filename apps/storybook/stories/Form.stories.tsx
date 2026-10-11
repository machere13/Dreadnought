import { useMemo, useState } from 'react';
import type { ComponentPropsWithRef } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { useForm } from '@dreadnought/react/logic';
import { Button, Checkbox, Form, FormField, Input, Select } from '@dreadnought/ui/react';

function CustomInput({
  onValueChange,
  ...props
}: Omit<ComponentPropsWithRef<'input'>, 'onChange'> & { onValueChange: (value: string) => void }) {
  return <input {...props} onChange={(event) => onValueChange(event.target.value)} />;
}

function Example({
  asynchronous = false,
  custom = false,
}: {
  asynchronous?: boolean;
  custom?: boolean;
}) {
  const [saved, setSaved] = useState('');
  const validators = useMemo(
    () => ({
      name: asynchronous
        ? async (value: string) => {
            await Promise.resolve();
            return value ? undefined : 'Введите имя';
          }
        : (value: string) => (value ? undefined : 'Введите имя'),
    }),
    [asynchronous],
  );
  const form = useForm({
    initialValues: { name: '', role: null as string | null, accepted: false },
    validators,
  });
  const name = form.field('name');
  const role = form.field('role');
  const accepted = form.field('accepted');
  return (
    <Form
      form={form}
      onFinish={(values) => {
        setSaved(`Сохранено: ${values.name}`);
      }}
      onReset={() => setSaved('')}
      style={{ width: 'min(100%, 28rem)' }}
    >
      <FormField label="Имя" error={name.error} required>
        {(props) =>
          custom ? (
            <CustomInput
              {...props}
              value={name.value}
              onValueChange={name.setValue}
              onBlur={name.onBlur}
            />
          ) : (
            <Input
              {...props}
              value={name.value}
              onChange={(event) => name.setValue(event.target.value)}
              onBlur={name.onBlur}
              invalid={name.error !== undefined}
            />
          )
        }
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
      <div style={{ display: 'flex', gap: 'var(--dreadnought-spacing-x2)' }}>
        <Button type="submit" loading={form.submitting}>
          Сохранить
        </Button>
        <Button type="reset" variant="secondary">
          Сбросить
        </Button>
      </div>
      {saved && <div role="status">{saved}</div>}
    </Form>
  );
}

const meta = { title: 'Fields/Form', component: Example } satisfies Meta<typeof Example>;
export default meta;
type Story = StoryObj<typeof meta>;

export const CompleteForm: Story = {};
export const AsyncValidation: Story = { args: { asynchronous: true } };
export const CustomField: Story = { args: { custom: true } };
export const NativeForm: Story = {
  render: () => (
    <Form onSubmit={(event) => event.preventDefault()}>
      <FormField label="Имя" required>
        {(props) => <Input {...props} required name="name" />}
      </FormField>
      <Button type="submit">Отправить</Button>
    </Form>
  ),
};
