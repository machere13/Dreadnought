import { useForm } from '@dreadnought/react/logic';
import { Form, FormField, Input } from '../src/adapters/react/index.ts';

export function TypedForm() {
  const form = useForm({ initialValues: { name: '', accepted: false } });
  form.setValue('accepted', true);
  // @ts-expect-error incompatible value
  form.setValue('accepted', 'yes');
  // @ts-expect-error unknown field
  form.field('missing');
  const name = form.field('name');
  // @ts-expect-error a model requires a submission handler
  const invalid = <Form form={form} />;
  return (
    <Form
      form={form}
      onFinish={(values) => {
        values.name.toUpperCase();
      }}
    >
      <FormField label="Name">
        {(props) => (
          <Input
            {...props}
            value={name.value}
            onChange={(event) => name.setValue(event.target.value)}
          />
        )}
      </FormField>
      {invalid}
    </Form>
  );
}
