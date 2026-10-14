import { useState } from 'react';
import { useForm } from '@dreadnought/react/logic';
import { Button, Form, FormField, TreeSelect } from '@dreadnought/ui/react';

type Team = { id: string; label: string; children?: readonly Team[] };
const records: readonly Team[] = [
  {
    id: 'dev',
    label: 'Разработка',
    children: [
      { id: 'front', label: 'Frontend' },
      { id: 'back', label: 'Backend' },
    ],
  },
  { id: 'design', label: 'Дизайн' },
];

const validators = {
  team: (value: string | null) => (value === null ? 'Выберите команду' : undefined),
};

export function TreeSelectFormDemo() {
  const [saved, setSaved] = useState('');
  const form = useForm<{ team: string | null }>({ initialValues: { team: null }, validators });
  const team = form.field('team');
  return (
    <Form
      form={form}
      onFinish={(values) => setSaved(values.team ?? '')}
      onReset={() => setSaved('')}
    >
      <FormField label="Команда" required error={team.error}>
        {(props) => (
          <TreeSelect<Team, string>
            {...props}
            records={records}
            getKey={(team) => team.id}
            getChildren={(team) => team.children}
            getLabel={(team) => team.label}
            defaultExpandedKeys={['dev']}
            name="team"
            required
            showSearch
            value={team.value}
            onValueChange={team.setValue}
            onBlur={team.onBlur}
            placeholder="Выберите команду"
          />
        )}
      </FormField>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <Button type="submit">Сохранить</Button>
        <Button type="reset" variant="secondary">
          Сбросить
        </Button>
      </div>
      {saved && <p role="status">Сохранённый ключ команды: {saved}</p>}
    </Form>
  );
}
