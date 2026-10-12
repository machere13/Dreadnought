import { useState } from 'react';
import { useForm } from '@dreadnought/react/logic';
import { Button, Form, FormField, TreeSelect } from '@dreadnought/ui/react';

type Node = { id: string; label: string; children?: readonly Node[] };
const records: readonly Node[] = [
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
export const treeSelectDemoProps = {
  records,
  getKey: (node: Node) => node.id,
  getChildren: (node: Node) => node.children,
  getLabel: (node: Node) => node.label,
  defaultExpandedKeys: ['dev'],
};
const validators = {
  team: (value: string | null) => (value === null ? 'Выберите команду' : undefined),
};

export function TreeSelectDemo() {
  return (
    <TreeSelect {...treeSelectDemoProps} aria-label="Команда" placeholder="Выберите команду" />
  );
}

export function TreeSelectMultipleDemo({ checkStrictly = false }: { checkStrictly?: boolean }) {
  const [value, setValue] = useState<string[]>([]);
  return (
    <div style={{ display: 'grid', gap: '0.75rem' }}>
      <TreeSelect<Node, string>
        {...treeSelectDemoProps}
        multiple
        checkStrictly={checkStrictly}
        value={value}
        onValueChange={setValue}
        showSearch
        aria-label={checkStrictly ? 'Независимый выбор' : 'Связанный выбор'}
        placeholder="Выберите команды"
      />
      <output role="status">{JSON.stringify(value)}</output>
    </div>
  );
}

export function TreeSelectSearchDemo() {
  const [search, setSearch] = useState('');
  return (
    <TreeSelect
      {...treeSelectDemoProps}
      aria-label="Поиск команды"
      showSearch={{ searchValue: search, onSearch: setSearch }}
      placeholder="Найдите команду"
    />
  );
}

export function TreeSelectStatesDemo() {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
      <TreeSelect
        {...treeSelectDemoProps}
        disabled
        defaultValue="front"
        aria-label="Недоступный выбор"
      />
      <TreeSelect
        {...treeSelectDemoProps}
        readOnly
        defaultValue="front"
        aria-label="Только просмотр"
      />
      <TreeSelect
        {...treeSelectDemoProps}
        getDisabled={() => true}
        aria-label="Нет доступных команд"
        placeholder="Все узлы недоступны"
      />
      <TreeSelect {...treeSelectDemoProps} defaultValue="archived" aria-label="Неизвестный ключ" />
    </div>
  );
}

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
          <TreeSelect
            {...props}
            {...treeSelectDemoProps}
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
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
        <Button type="submit">Сохранить</Button>
        <Button type="reset" variant="secondary">
          Сбросить
        </Button>
      </div>
      {saved && <div role="status">{saved}</div>}
    </Form>
  );
}
