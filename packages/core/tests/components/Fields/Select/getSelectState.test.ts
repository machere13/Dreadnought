import { expect, it } from 'vitest';
import * as core from '../../../../src/index.ts';

const options = [{ value: 'a', label: 'Анна' }, { value: 'b', label: 'Борис', disabled: true }];
it('filters by label without dropping the selected value and validates unique options', () => {
  const state = core.getSelectState({ options, value: 'b', query: 'анН' });
  expect(state.filteredOptions.map(item => item.value)).toEqual(['a']);
  expect(state.selectedOptions.map(item => item.value)).toEqual(['b']);
  expect(() => core.getSelectState({ options: [...options, options[0]] })).toThrow();
});

it('can leave remote results unfiltered or use a custom search predicate', () => {
  expect(core.getSelectState({ options, query: 'unmatched', filterOption: false }).filteredOptions).toEqual(options);
  expect(core.getSelectState({ options, query: 'b', filterOption: (query, option) => option.value === query }).filteredOptions)
    .toEqual([options[1]]);
});
