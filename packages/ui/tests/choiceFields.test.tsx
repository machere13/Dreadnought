import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, expect, it } from 'vitest';
import { Checkbox, Radio, Select } from '../src/adapters/react/index.ts';
it('styles Select group labels while preserving consumer slots', () => {
  render(
    <Select
      aria-label="Выбор"
      options={[{ label: 'Команда', options: [{ value: 'a', label: 'Анна' }] }]}
      defaultOpen
      slotProps={{
        group: { className: 'custom-group' },
        groupLabel: { className: 'custom-label' },
      }}
    />,
  );
  const label = document.querySelector('[data-slot="group-label"]')!;
  expect(label.className).toContain('custom-label');
  expect(label.className).not.toBe('custom-label');
  expect(document.querySelector('[data-slot="group"]')?.className).toContain('custom-group');
});

afterEach(cleanup);
it('renders removable Select tags with library icons and preserves consumer slots', () => {
  render(
    <form>
      <Select
        multiple
        options={[{ value: 'a', label: 'Анна' }]}
        defaultValue={['a']}
        name="people"
        slotProps={{ tag: { className: 'custom-tag' }, remove: { className: 'custom-remove' } }}
      />
    </form>,
  );
  const button = screen.getByRole('button', { name: 'Удалить Анна' });
  expect(button.querySelector('svg')).not.toBeNull();
  expect(button.className).toContain('custom-remove');
  expect(button.className).not.toBe('custom-remove');
  expect(button.closest('[data-slot="tag"]')?.className).toBe('custom-tag');
  fireEvent.click(button);
  expect(new FormData(screen.getByRole('combobox').closest('form')!).getAll('people')).toEqual([]);
});
it('adds presentation to native fields and preserves user slots', () => {
  render(
    <>
      <Checkbox slotProps={{ indicator: { className: 'custom-mark', children: <span>✓</span> } }}>
        Согласие
      </Checkbox>
      <Radio.Group label="Тарифы" options={[{ value: 'a', label: 'Первый' }]} />
      <Select
        options={[]}
        aria-label="Выбор"
        slotProps={{ popup: { className: 'custom-popup' } }}
      />
    </>,
  );
  expect(screen.getByRole('checkbox').closest('label')?.className).toContain(
    'dreadnought-text-checkbox',
  );
  expect(screen.getByText('✓').parentElement?.className).toBe('custom-mark');
  expect(screen.getByRole('radio').closest('label')?.className).toContain('dreadnought-text-radio');
  expect(screen.getByRole('combobox').parentElement?.className).toContain(
    'dreadnought-text-select',
  );
  expect(document.querySelector('[data-slot="popup"]')?.className).toContain('custom-popup');
});
