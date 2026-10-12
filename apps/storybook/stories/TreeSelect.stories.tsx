import type { Meta, StoryObj } from '@storybook/react-vite';
import { useForm } from '@dreadnought/react/logic';
import { Button, Form, FormField, Modal, TreeSelect } from '@dreadnought/ui/react';
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
];
const args = {
  records,
  getKey: (node: Node) => node.id,
  getChildren: (node: Node) => node.children,
  getLabel: (node: Node) => node.label,
  'aria-label': 'Команда',
  showSearch: true,
  defaultExpandedKeys: ['dev'],
};
const meta = {
  title: 'Fields/TreeSelect',
  component: TreeSelect<Node, string>,
  args,
  parameters: { layout: 'padded' },
  render: (props) => <TreeSelect<Node, string> {...props} />,
} satisfies Meta<typeof TreeSelect<Node, string>>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
export const Multiple: Story = {
  render: () => <TreeSelect {...args} multiple defaultValue={['front']} />,
};
export const StrictMultiple: Story = {
  render: () => <TreeSelect {...args} multiple checkStrictly defaultValue={['dev']} />,
};
export const Search: Story = {
  render: () => <TreeSelect {...args} showSearch={{ defaultSearchValue: 'front' }} />,
};
export const Disabled: Story = { args: { disabled: true, defaultValue: 'front' } };
export const ReadOnly: Story = { args: { readOnly: true, defaultValue: 'front' } };
export const FullyBlocked: Story = { args: { getDisabled: () => true } };
export const UnknownKey: Story = { args: { defaultValue: 'archived' } };
export const ControlledRejection: Story = {
  render: () => (
    <TreeSelect
      records={[
        { id: 0, label: 'Нулевой ключ' },
        { id: 1, label: 'Другой ключ' },
      ]}
      getKey={(node) => node.id}
      getChildren={() => undefined}
      getLabel={(node) => node.label}
      value={0}
      onValueChange={() => {}}
      aria-label="Принятый ключ"
      name="key"
    />
  ),
};
const formValidators = {
  team: (value: string | null) => (value === null ? 'Выберите команду' : undefined),
};
function FormExample() {
  const form = useForm<{ team: string | null }>({
    initialValues: { team: null },
    validators: formValidators,
  });
  const team = form.field('team');
  return (
    <Form form={form} onFinish={() => {}}>
      <FormField label="Команда" required error={team.error}>
        {(props) => (
          <TreeSelect
            {...props}
            {...args}
            required
            name="team"
            value={team.value}
            onValueChange={team.setValue}
            onBlur={team.onBlur}
          />
        )}
      </FormField>
      <Button type="submit">Сохранить</Button>
      <Button type="reset" variant="secondary">
        Сбросить
      </Button>
    </Form>
  );
}
export const WithinForm: Story = { render: () => <FormExample /> };
export const Overflow: Story = {
  render: () => (
    <TreeSelect
      {...args}
      multiple
      checkStrictly
      defaultValue={['long', 'item-1']}
      records={[
        {
          id: 'dev',
          label: 'Команда',
          children: [
            { id: 'long', label: 'Очень длинное название отдела разработки интерфейсов' },
            ...Array.from({ length: 30 }, (_, index) => ({
              id: `item-${index}`,
              label: `Отдел ${index + 1}`,
            })),
          ],
        },
      ]}
    />
  ),
};
export const WithinModal: Story = {
  render: () => (
    <Modal title="Выбор команды" content={<TreeSelect {...args} />}>
      {(trigger) => <Button {...trigger}>Открыть модалку</Button>}
    </Modal>
  ),
};
