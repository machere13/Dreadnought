import type { Meta, StoryObj } from '@storybook/react-vite';
import { useEffect, useState } from 'react';
import { Select } from '@dreadnought/ui/react';
const options = [
  { value: 'anna', label: 'Анна' },
  { value: 'boris', label: 'Борис', disabled: true },
  { value: 'vera', label: 'Вера' },
  { value: 'long', label: 'Очень длинное название варианта, которое не должно расширять страницу' },
];
const meta = {
  title: 'Fields/Select',
  component: Select,
  args: { options, 'aria-label': 'Исполнитель', placeholder: 'Выберите исполнителя' },
  argTypes: {
    disabled: { control: 'boolean' },
    invalid: { control: 'boolean' },
    searchable: { control: 'boolean' },
    allowClear: { control: 'boolean' },
    options: { control: 'object' },
    slotProps: { table: { disable: true } },
  },
} satisfies Meta<typeof Select>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
export const Search: Story = { args: { searchable: true, allowClear: true } };
export const Groups: Story = {
  args: {
    searchable: true,
    defaultOpen: true,
    options: [
      { value: 'none', label: 'Без команды' },
      { label: 'Команда', options: options.slice(0, 3) },
      { label: 'Гости', options: [{ value: 'guest', label: 'Даша' }] },
      { label: 'Архив', disabled: true, options: [{ value: 'former', label: 'Бывший участник' }] },
    ],
  },
};
export const Multiple: Story = {
  args: { multiple: true, searchable: true, allowClear: true, defaultValue: ['anna', 'vera'] },
};
export const MultipleLongLabels: Story = {
  args: { multiple: true, searchable: true, defaultValue: ['anna', 'long'] },
};
export const LimitedTags: Story = {
  args: {
    multiple: true,
    searchable: true,
    allowClear: true,
    maxTagCount: 1,
    defaultValue: ['anna', 'vera', 'long'],
  },
};
export const LimitedSelection: Story = {
  args: {
    multiple: true,
    searchable: true,
    allowClear: true,
    maxCount: 2,
    defaultValue: ['anna', 'vera'],
  },
};
export const Disabled: Story = { args: { disabled: true, defaultValue: 'anna' } };
export const Invalid: Story = { args: { invalid: true } };
export const Empty: Story = { args: { options: [], searchable: true } };
export const Loading: Story = { args: { options: [], defaultOpen: true, loading: true } };
export const RichOptions: Story = {
  args: {
    optionRender: (option, state) => (
      <span>
        {option.label} <small>({state.selected ? 'выбран' : option.value})</small>
      </span>
    ),
  },
};

function RemoteSearchDemo() {
  const [search, setSearch] = useState('');
  const [results, setResults] = useState(options);
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => {
      setResults(
        options.filter((option) =>
          option.label.toLocaleLowerCase().includes(search.toLocaleLowerCase()),
        ),
      );
      setLoading(false);
    }, 400);
    return () => clearTimeout(timer);
  }, [search]);
  return (
    <Select
      aria-label="Поиск исполнителя"
      placeholder="Поиск с задержкой ответа"
      searchable
      allowClear
      options={results}
      filterOption={false}
      searchValue={search}
      onSearch={setSearch}
      loading={loading}
    />
  );
}
export const RemoteSearch: Story = { render: () => <RemoteSearchDemo /> };
