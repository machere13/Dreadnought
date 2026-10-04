import { createRef } from 'react';
import { Checkbox, Radio, Select } from '@dreadnought/ui/react';

const inputRef = createRef<HTMLInputElement>();
const groupRef = createRef<HTMLFieldSetElement>();
const options = [{ value: 'a', label: 'Первый' }];
const single = <Select ref={inputRef} options={options} value="a" onValueChange={value => { const result: string | null = value; void result; }} />;
const multiple = <Select multiple options={options} value={['a']} onValueChange={value => { const result: string[] = value; void result; }} />;
const checkbox = <Checkbox ref={inputRef} indeterminate name="consent">Согласие</Checkbox>;
const group = <Checkbox.Group ref={groupRef} options={options} defaultValue={['a']} />;
const radio = <Radio.Group options={options} value="a" onValueChange={value => { const result: string = value; void result; }} />;
// @ts-expect-error Single selection accepts a string, not an array.
const invalidSingle = <Select options={options} value={['a']} />;
// @ts-expect-error Multiple selection accepts an array, not a string.
const invalidMultiple = <Select multiple options={options} value="a" />;
// @ts-expect-error Public ref is the input, not its wrapper.
const invalidRef = <Select options={options} ref={createRef<HTMLDivElement>()} />;
void [single, multiple, checkbox, group, radio, invalidSingle, invalidMultiple, invalidRef];
