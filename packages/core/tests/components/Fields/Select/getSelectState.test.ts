import { expect, it } from 'vitest';
import * as core from '../../../../src/index.ts';

const options = [
  { value: 'a', label: 'Анна' },
  { value: 'b', label: 'Борис', disabled: true },
];
it.each([-1, 1.5, NaN, Infinity])('rejects invalid maxCount %s', (maxCount) => {
  expect(() => core.getSelectState({ options, multiple: true, maxCount })).toThrow(/maxCount/);
});
it('disables only new choices at the limit without mutating input or dropping values', () => {
  const entries = [{ label: 'Team', options }];
  const state = core.getSelectState({
    options: entries,
    multiple: true,
    value: ['missing'],
    maxCount: 1,
  });
  expect(state.values).toEqual(['missing']);
  expect(state.filteredGroups[0].options[0].disabled).toBe(true);
  expect(state.options[0].disabled).toBe(true);
  expect(options[0]).not.toHaveProperty('disabled');
  const selected = core.getSelectState({ options, multiple: true, value: ['a'], maxCount: 1 });
  expect(selected.options[0].disabled).not.toBe(true);
  expect(selected.options[1].disabled).toBe(true);
  expect(core.getSelectState({ options, value: 'a', maxCount: 0 }).options[0].disabled).not.toBe(
    true,
  );
});
it('filters grouped choices without losing their labels or selected values', () => {
  const grouped = [
    { label: 'Команда', options },
    { label: 'Архив', disabled: true, options: [{ value: 'c', label: 'Вера' }] },
  ];
  const state = core.getSelectState({ options: grouped, value: 'b', query: 'анн' });
  expect(state.options.map((option) => option.value)).toEqual(['a', 'b', 'c']);
  expect(state.options[2].disabled).toBe(true);
  expect(state.filteredGroups).toEqual([{ label: 'Команда', options: [options[0]] }]);
  expect(state.selectedOptions).toEqual([options[1]]);
  expect(grouped[1].options[0]).not.toHaveProperty('disabled');
});

it('rejects duplicate values across separate groups', () => {
  expect(() =>
    core.getSelectState({
      options: [
        { label: 'A', options: [options[0]] },
        { label: 'B', options: [options[0]] },
      ],
    }),
  ).toThrow(/unique/);
});
it('filters by label without dropping the selected value and validates unique options', () => {
  const state = core.getSelectState({ options, value: 'b', query: 'анН' });
  expect(state.filteredOptions.map((item) => item.value)).toEqual(['a']);
  expect(state.selectedOptions.map((item) => item.value)).toEqual(['b']);
  expect(() => core.getSelectState({ options: [...options, options[0]] })).toThrow();
});

it('can leave remote results unfiltered or use a custom search predicate', () => {
  expect(
    core.getSelectState({ options, query: 'unmatched', filterOption: false }).filteredOptions,
  ).toEqual(options);
  expect(
    core.getSelectState({
      options,
      query: 'b',
      filterOption: (query, option) => option.value === query,
    }).filteredOptions,
  ).toEqual([options[1]]);
});
