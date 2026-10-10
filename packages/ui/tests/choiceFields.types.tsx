import { createRef } from 'react';
import { Checkbox, Radio, Select, type SelectOptionGroup } from '@dreadnought/ui/react';

const inputRef = createRef<HTMLInputElement>();
const groupRef = createRef<HTMLFieldSetElement>();
const options = [{ value: 'a', label: 'Первый' }];
const section: SelectOptionGroup = { label: 'Команда', options, disabled: false };
const grouped = (
  <Select
    options={[section, ...options]}
    slotProps={{ group: { className: 'group' }, groupLabel: { className: 'label' } }}
  />
);
const single = (
  <Select
    ref={inputRef}
    options={options}
    value="a"
    onValueChange={(value) => {
      const result: string | null = value;
      void result;
    }}
  />
);
const multiple = (
  <Select
    multiple
    options={options}
    value={['a']}
    removeLabel={(option) => `Remove ${option.label}`}
    removeContent={<span>×</span>}
    maxTagCount={2}
    slotProps={{
      selection: { className: 'selection' },
      tag: { className: 'tag' },
      tagLabel: { className: 'label' },
      remove: { className: 'remove' },
    }}
    onValueChange={(value) => {
      const result: string[] = value;
      void result;
    }}
  />
);
const remote = (
  <Select
    options={options}
    searchable
    open
    searchValue="test"
    filterOption={false}
    loading
    onOpenChange={(open) => {
      const result: boolean = open;
      void result;
    }}
    onSearch={(search) => {
      const result: string = search;
      void result;
    }}
    optionRender={(option, state) => (
      <span>
        {option.label} {state.selected ? 'selected' : state.index}
      </span>
    )}
  />
);
const checkbox = (
  <Checkbox ref={inputRef} indeterminate name="consent">
    Согласие
  </Checkbox>
);
const group = <Checkbox.Group ref={groupRef} options={options} defaultValue={['a']} />;
const radio = (
  <Radio.Group
    options={options}
    value="a"
    onValueChange={(value) => {
      const result: string = value;
      void result;
    }}
  />
);
// @ts-expect-error Single selection accepts a string, not an array.
const invalidSingle = <Select options={options} value={['a']} />;
// @ts-expect-error Multiple selection accepts an array, not a string.
const invalidMultiple = <Select multiple options={options} value="a" />;
// @ts-expect-error Public ref is the input, not its wrapper.
const invalidRef = <Select options={options} ref={createRef<HTMLDivElement>()} />;
void [
  grouped,
  single,
  multiple,
  remote,
  checkbox,
  group,
  radio,
  invalidSingle,
  invalidMultiple,
  invalidRef,
];
