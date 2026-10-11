import { useState } from 'react';
import { useForm } from '@dreadnought/react/logic';
import { Button, Checkbox, Form, FormField, Input, Select } from '@dreadnought/ui/react';
import type { FormValidators } from '@dreadnought/core';

type Values = {
  name: string;
  password: string;
  confirmation: string;
  role: string | null;
  accepted: boolean;
};

const validators: FormValidators<Values> = {
  name: async (value, _values, { signal }) => {
    if (!value.trim()) return 'Введите имя';
    await Promise.resolve();
    if (signal.aborted) return;
    return value.toLowerCase() === 'admin' ? 'Это имя занято' : undefined;
  },
  password: (value) => (value.length >= 6 ? undefined : 'Минимум 6 символов'),
  confirmation: (value, values) => (value === values.password ? undefined : 'Пароли не совпадают'),
  role: (value) => (value ? undefined : 'Выберите роль'),
  accepted: (value) => (value ? undefined : 'Нужно согласие'),
};

export function FormDemo() {
  const [saved, setSaved] = useState('');
  const form = useForm<Values>({
    initialValues: { name: '', password: '', confirmation: '', role: null, accepted: false },
    validators,
  });
  const role = form.field('role');
  const accepted = form.field('accepted');
  return (
    <Form
      form={form}
      onFinish={(values) => {
        setSaved(`Сохранено: ${values.name}`);
      }}
      onReset={() => setSaved('')}
      style={{ maxWidth: '32rem', width: '100%' }}
    >
      {(['name', 'password', 'confirmation'] as const).map((key) => {
        const field = form.field(key);
        const label = { name: 'Имя', password: 'Пароль', confirmation: 'Подтверждение пароля' }[
          key
        ];
        return (
          <FormField
            key={key}
            label={label}
            error={field.error}
            required
            help={key === 'name' ? 'Имя admin занято; проверка асинхронная.' : undefined}
          >
            {(props) => (
              <Input
                {...props}
                type={key === 'name' ? 'text' : 'password'}
                autoComplete={key === 'name' ? 'off' : 'new-password'}
                value={field.value}
                onChange={(event) => field.setValue(event.target.value)}
                onBlur={field.onBlur}
                invalid={field.error !== undefined}
                required
              />
            )}
          </FormField>
        );
      })}
      <FormField label="Роль" error={role.error} required>
        {(props) => (
          <Select
            {...props}
            value={role.value}
            onValueChange={role.setValue}
            onBlur={role.onBlur}
            invalid={role.error !== undefined}
            options={[
              { value: 'reader', label: 'Читатель' },
              { value: 'editor', label: 'Редактор' },
            ]}
          />
        )}
      </FormField>
      <FormField error={accepted.error}>
        {(props) => (
          <Checkbox
            {...props}
            checked={accepted.value}
            invalid={accepted.error !== undefined}
            onChange={(event) => accepted.setValue(event.target.checked)}
            onBlur={accepted.onBlur}
            required
          >
            Принимаю условия
          </Checkbox>
        )}
      </FormField>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--dreadnought-spacing-x2)' }}>
        <Button type="submit" loading={form.submitting}>
          Сохранить
        </Button>
        <Button type="reset" variant="secondary">
          Сбросить
        </Button>
      </div>
      {saved && <div role="status">{saved}</div>}
      {form.submitError !== undefined && (
        <div role="alert">Не удалось сохранить. Попробуйте снова.</div>
      )}
      {Object.keys(form.validationFailures).length > 0 && (
        <div role="alert">Ошибка проверки. Попробуйте снова.</div>
      )}
    </Form>
  );
}
