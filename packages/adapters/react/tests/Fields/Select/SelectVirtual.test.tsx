import { act, cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, expect, it } from 'vitest';
import { SelectAdapter } from '../../../src/Fields/Select/SelectAdapter.tsx';

afterEach(cleanup);
const options = Array.from({ length: 1000 }, (_, index) => ({
  value: String(index),
  label: `Option ${index}`,
  disabled: index === 999,
}));
const virtual = { itemHeight: 32, height: 128, overscan: 1 };

it('mounts a bounded window and no full hidden native option list', () => {
  const { container } = render(
    <SelectAdapter options={options} defaultOpen virtual={virtual} aria-label="Choice" />,
  );
  expect(screen.getByRole('option', { name: 'Option 0' })).toBeTruthy();
  expect(container.querySelectorAll('[role="option"]').length).toBeLessThan(10);
  expect(container.querySelectorAll('option').length).toBeLessThan(10);
  const viewport = container.querySelector<HTMLElement>('[data-slot="viewport"]')!;
  fireEvent.scroll(viewport, { target: { scrollTop: 16000 } });
  expect(screen.getByRole('option', { name: 'Option 500' })).toBeTruthy();
  expect(container.querySelectorAll('[role="option"]').length).toBeLessThan(10);
});

it('mounts the keyboard target before referencing it and selects across the window', () => {
  const { container } = render(
    <form>
      <SelectAdapter options={options} defaultOpen virtual={virtual} name="choice" />
    </form>,
  );
  const input = screen.getByRole('combobox');
  fireEvent.keyDown(input, { key: 'End' });
  const target = container.querySelector(`[id="${input.getAttribute('aria-activedescendant')}"]`);
  expect(target?.textContent).toBe('Option 998');
  expect(container.querySelector<HTMLElement>('[data-slot="viewport"]')!.scrollTop).toBe(31840);
  expect(container.querySelectorAll('[role="option"]').length).toBeLessThan(10);
  fireEvent.keyDown(input, { key: 'Enter' });
  expect(new FormData(container.querySelector('form')!).get('choice')).toBe('998');
});

it('keeps the active descendant mounted when the user scrolls away', () => {
  const { container } = render(<SelectAdapter options={options} defaultOpen virtual={virtual} />);
  const input = screen.getByRole('combobox');
  const id = input.getAttribute('aria-activedescendant');
  const viewport = container.querySelector<HTMLElement>('[data-slot="viewport"]')!;
  fireEvent.scroll(viewport, { target: { scrollTop: 16000 } });
  expect(container.querySelector(`[id="${id}"]`)?.textContent).toBe('Option 0');
  expect(viewport.scrollTop).toBe(16000);
});

it('resets the window after filtering and restores selected values on form reset', async () => {
  const { container } = render(
    <form>
      <SelectAdapter
        options={options}
        defaultOpen
        defaultValue="800"
        virtual={virtual}
        showSearch
        name="choice"
      />
    </form>,
  );
  const input = screen.getByRole('combobox');
  expect(screen.getByRole('option', { name: 'Option 800' })).toBeTruthy();
  expect(container.querySelector<HTMLElement>('[data-slot="viewport"]')!.scrollTop).toBe(25504);
  fireEvent.change(input, { target: { value: 'Option 123' } });
  expect(screen.getByRole('option', { name: 'Option 123' })).toBeTruthy();
  fireEvent.click(screen.getByRole('option', { name: 'Option 123' }));
  const form = container.querySelector('form')!;
  expect(new FormData(form).get('choice')).toBe('123');
  await act(async () => {
    fireEvent.reset(form);
  });
  expect(new FormData(form).get('choice')).toBe('800');
  fireEvent.click(input);
  expect(screen.getByRole('option', { name: 'Option 800' })).toBeTruthy();
});

it('preserves group names and global optionRender indices in a partial group', () => {
  const { container } = render(
    <SelectAdapter
      options={[{ label: 'Team', options }]}
      defaultOpen
      virtual={virtual}
      optionRender={(option, state) => `${state.index}: ${option.label}`}
    />,
  );
  fireEvent.scroll(container.querySelector('[data-slot="viewport"]')!, {
    target: { scrollTop: 16032 },
  });
  const group = screen
    .getAllByRole('group', { name: 'Team' })
    .find((element) => within(element).queryByRole('option', { name: 'Option 500' }))!;
  expect(within(group).getByRole('option', { name: 'Option 500' }).textContent).toBe(
    '500: Option 500',
  );
});

it('allows opting out for variable-height options and native autofill', () => {
  const { container } = render(<SelectAdapter options={options} defaultOpen virtual={false} />);
  expect(container.querySelectorAll('[role="option"]')).toHaveLength(1000);
  expect(container.querySelectorAll('option')).toHaveLength(1001);
});

it('keeps a distant mouse selection visible in a multiple list', () => {
  const { container } = render(
    <form>
      <SelectAdapter
        options={options}
        defaultValue={['0']}
        multiple
        defaultOpen
        virtual={virtual}
        name="choice"
      />
    </form>,
  );
  const viewport = container.querySelector<HTMLElement>('[data-slot="viewport"]')!;
  fireEvent.scroll(viewport, { target: { scrollTop: 16000 } });
  fireEvent.click(screen.getByRole('option', { name: 'Option 500' }));
  expect(viewport.scrollTop).toBe(16000);
  expect(new FormData(container.querySelector('form')!).getAll('choice')).toEqual(['0', '500']);
});

it('preserves native form ordering when values are selected out of source order', () => {
  const { container } = render(
    <form>
      <SelectAdapter
        options={options}
        defaultValue={['500', '0']}
        multiple
        virtual={virtual}
        name="choice"
      />
    </form>,
  );
  expect(new FormData(container.querySelector('form')!).getAll('choice')).toEqual(['0', '500']);
});
