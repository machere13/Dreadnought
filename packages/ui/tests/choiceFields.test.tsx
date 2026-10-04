import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, expect, it } from 'vitest';
import { Checkbox, Radio, Select } from '../src/adapters/react/index.ts';

afterEach(cleanup);
it('adds presentation to native fields and preserves user slots', () => {
  render(<><Checkbox slotProps={{ indicator: { className: 'custom-mark', children: <span>✓</span> } }}>Согласие</Checkbox>
    <Radio.Group label="Тарифы" options={[{ value: 'a', label: 'Первый' }]} />
    <Select options={[]} aria-label="Выбор" slotProps={{ popup: { className: 'custom-popup' } }} /></>);
  expect(screen.getByRole('checkbox').closest('label')?.className).toContain('dreadnought-text-checkbox');
  expect(screen.getByText('✓').parentElement?.className).toBe('custom-mark');
  expect(screen.getByRole('radio').closest('label')?.className).toContain('dreadnought-text-radio');
  expect(screen.getByRole('combobox').parentElement?.className).toContain('dreadnought-text-select');
  expect(document.querySelector('[data-slot="popup"]')?.className).toContain('custom-popup');
});
