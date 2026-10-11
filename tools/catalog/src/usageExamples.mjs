// Agent-facing examples, type-checked during catalog generation. No screen logic.
export const usageExamples = {
  Upload: `import { useUpload } from '@dreadnought/react/logic';
import { Upload } from '@dreadnought/ui/react';
export function Example() {
  const upload = useUpload({ accept: '.pdf', multiple: true, maxCount: 3 });
  return <Upload upload={upload} label="Выбрать документы" dropzone />;
}`,
  Form: `import { useForm } from '@dreadnought/react/logic';
import { Form, FormField, Input, Button } from '@dreadnought/ui/react';
const requiredName = (value: string) => value.trim() ? undefined : 'Введите имя';
export function Example() {
  const form = useForm({ initialValues: { name: '' }, validators: { name: requiredName } });
  const name = form.field('name');
  return <Form form={form} onFinish={values => { console.log(values.name); }}>
    <FormField label="Имя" error={name.error} required>{props =>
      <Input {...props} value={name.value} invalid={name.error !== undefined}
        onChange={event => name.setValue(event.target.value)} onBlur={name.onBlur} />}
    </FormField>
    <Button type="submit" loading={form.submitting}>Сохранить</Button>
  </Form>;
}`,
  Input: `import { Input } from '@dreadnought/ui/react';
const example = <Input type="text" aria-label="Имя" name="name" required />;`,
  Tabs: `import { useState } from 'react';
import { Tabs } from '@dreadnought/ui/react';
export function Example() {
  const [value, setValue] = useState('first');
  return <Tabs value={value} onValueChange={setValue}>
    <Tabs.List aria-label="Разделы">
      <Tabs.Tab value="first">Первый</Tabs.Tab>
      <Tabs.Tab value="second">Второй</Tabs.Tab>
    </Tabs.List>
    <Tabs.Panel value="first">Первый раздел</Tabs.Panel>
    <Tabs.Panel value="second">Второй раздел</Tabs.Panel>
  </Tabs>;
}`,
  Table: `import { Table } from '@dreadnought/ui/react';
const example = <Table rowKey="id" pagination={false}
  locale={{ emptyText: 'Нет данных' }}
  dataSource={[{ id: 1, name: 'Анна' }]}
  columns={[{ key: 'name', title: 'Имя', dataIndex: 'name',
    render: (_value, record) => <strong>{record.name}</strong> }]} />;`,
};
