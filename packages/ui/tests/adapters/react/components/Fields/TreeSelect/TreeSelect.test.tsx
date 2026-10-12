import { createRef } from 'react';
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, expect, it } from 'vitest';
import { TreeSelect } from '../../../../../../src/adapters/react/components/Fields/TreeSelect/TreeSelect.tsx';

afterEach(cleanup);
type Node = { id: number; label: string; children?: readonly Node[] };
const records: readonly Node[] = [
  {
    id: 0,
    label: 'Команда',
    children: [
      { id: 1, label: 'Frontend' },
      { id: 2, label: 'Backend' },
    ],
  },
];
const options = {
  records,
  getKey: (node: Node) => node.id,
  getChildren: (node: Node) => node.children,
  getLabel: (node: Node) => node.label,
};

it('uses real Input, Button, Icon and Checkbox components', async () => {
  const user = userEvent.setup();
  render(<TreeSelect {...options} multiple aria-label="Отдел" />);
  expect(screen.getByRole('combobox').closest('[data-ui="input"]')).not.toBeNull();
  const toggle = screen.getByRole('button', { name: 'Открыть дерево' });
  expect(toggle.getAttribute('data-ui')).toBe('button');
  expect(toggle.querySelector('svg')).not.toBeNull();
  await user.click(toggle);
  expect(screen.getByRole('tree', { name: 'Отдел' })).not.toBeNull();
  expect(screen.getByRole('checkbox').closest('[data-ui="checkbox"]')).not.toBeNull();
  expect(screen.getByRole('checkbox').closest('[data-slot="tree-checkbox"]')).not.toBeNull();
});

it('wraps selected tags and preserves native values, ref and consumer slots', () => {
  const ref = createRef<HTMLInputElement>();
  render(
    <>
      <form id="team-form" />
      <TreeSelect
        {...options}
        multiple
        defaultValue={[1]}
        ref={ref}
        name="team"
        form="team-form"
        aria-label="Отдел"
        className="consumer"
        slotClassNames={{ tag: 'consumer-tag', field: 'consumer-field' }}
      />
    </>,
  );
  expect(ref.current).toBe(screen.getByRole('combobox'));
  expect(new FormData(ref.current!.form!).getAll('team')).toEqual(['1']);
  expect(
    screen.getByText('Frontend').closest('[data-slot="tag"]')?.classList.contains('consumer-tag'),
  ).toBe(true);
  expect(ref.current?.closest('[data-ui="tree-select"]')?.classList.contains('consumer')).toBe(
    true,
  );
  expect(ref.current?.closest('[data-slot="field"]')?.classList.contains('consumer-field')).toBe(
    true,
  );
});

it('keeps readonly values while permitting tree disclosure', async () => {
  const user = userEvent.setup();
  render(<TreeSelect {...options} defaultValue={1} readOnly aria-label="Отдел" />);
  await user.click(screen.getByRole('button', { name: 'Открыть дерево' }));
  await user.click(screen.getByRole('button', { name: 'Развернуть Команда' }));
  await user.click(screen.getByRole('treeitem', { name: 'Backend', exact: true }));
  expect(screen.getByRole('combobox')).toHaveProperty('value', 'Frontend');
  expect(screen.queryByRole('button', { name: 'Очистить выбор' })).toBeNull();
});
