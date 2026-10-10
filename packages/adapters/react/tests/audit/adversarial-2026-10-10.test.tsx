import { StrictMode } from 'react';
import { act, cleanup, fireEvent, render, renderHook, screen } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import { useSelect } from '../../src/Fields/Select/useSelect.ts';
import { SelectAdapter } from '../../src/Fields/Select/SelectAdapter.tsx';
import { SliderAdapter } from '../../src/Fields/Slider/SliderAdapter.tsx';
import { useTree } from '../../src/Navigation/Tree/useTree.ts';
import { TreeAdapter } from '../../src/Navigation/Tree/TreeAdapter.tsx';
import { MarkdownEditorAdapter } from '../../src/Fields/MarkdownEditor/MarkdownEditorAdapter.tsx';
import { useToast } from '../../src/Feedback/Toast/useToast.ts';
import { TableAdapter } from '../../src/DataDisplay/Table/TableAdapter.tsx';
import type { MarkdownEditorControls } from '../../src/Fields/MarkdownEditor/markdownEditor.types.ts';

afterEach(() => {
  cleanup();
  vi.useRealTimers();
});
const options = [
  { value: 'a', label: 'A' },
  { value: 'b', label: 'B' },
];
type AuditTreeNode = { key: string; children?: AuditTreeNode[] };

it('N01 Select preserves two selections before commit', () => {
  const changed = vi.fn();
  const { result } = renderHook(() =>
    useSelect({ options, multiple: true, onValueChange: changed }),
  );
  act(() => {
    result.current.choose('a');
    result.current.choose('b');
  });
  expect(result.current.state.values).toEqual(['a', 'b']);
  expect(changed.mock.calls).toEqual([[['a']], [['a', 'b']]]);
});

it('N01 Select custom tags can remove two values in one action', () => {
  const remove = new Map<string, () => void>();
  render(
    <>
      <SelectAdapter
        multiple
        options={options}
        defaultValue={['a', 'b']}
        tagRender={(tag, state) => {
          remove.set(tag.value, state.onRemove);
          return <span data-testid="tag">{tag.label}</span>;
        }}
      />
      <button
        onClick={() => {
          remove.get('a')!();
          remove.get('b')!();
        }}
      >
        Remove both
      </button>
    </>,
  );
  fireEvent.click(screen.getByRole('button', { name: 'Remove both' }));
  expect(screen.queryAllByTestId('tag')).toHaveLength(0);
});

it('Select controlled refusal does not accumulate unaccepted values', () => {
  const changed = vi.fn();
  const { result } = renderHook(() =>
    useSelect({ options, multiple: true, value: [], onValueChange: changed }),
  );
  act(() => {
    result.current.choose('a');
    result.current.choose('b');
  });
  expect(result.current.state.values).toEqual([]);
  expect(changed.mock.calls).toEqual([[['a']], [['b']]]);
});

it('N06 Select consumer cannot mutate the accepted internal selection', () => {
  render(
    <SelectAdapter
      multiple
      options={options}
      onValueChange={(next) => {
        next.length = 0;
      }}
    />,
  );
  fireEvent.click(screen.getByRole('combobox'));
  fireEvent.click(screen.getByRole('option', { name: 'A' }));
  expect(screen.getByRole('option', { name: 'A' }).getAttribute('aria-selected')).toBe('true');
});

it('N06 Tree consumer cannot mutate the accepted internal selection', () => {
  const { result } = renderHook(() =>
    useTree({
      records: [{ key: 'a' }],
      getKey: (r) => r.key,
      getChildren: () => undefined,
      selectable: true,
      onSelectedKeysChange: (next) => {
        next.length = 0;
      },
    }),
  );
  act(() => result.current.select('a'));
  expect(result.current.selectedKeys).toEqual(['a']);
});

it('N06 Table consumer cannot mutate the accepted internal selection', () => {
  render(
    <TableAdapter
      rowKey="id"
      dataSource={[{ id: 1 }]}
      columns={[{ key: 'id', dataIndex: 'id', title: 'ID' }]}
      rowSelection={{
        onChange: (next) => {
          next.length = 0;
        },
      }}
    />,
  );
  const checkbox = screen.getByRole('checkbox', { name: 'Выбрать строку 1' }) as HTMLInputElement;
  fireEvent.click(checkbox);
  expect(checkbox.checked).toBe(true);
});

it('Tree callbacks cannot mutate accepted checks or expansion', () => {
  const { result } = renderHook(() =>
    useTree<AuditTreeNode>({
      records: [{ key: 'a', children: [{ key: 'b' }] }],
      getKey: (r) => r.key,
      getChildren: (r) => r.children,
      checkable: true,
      onCheckedKeysChange: (keys) => {
        keys.length = 0;
      },
      onExpandedKeysChange: (keys) => {
        keys.length = 0;
      },
    }),
  );
  act(() => {
    result.current.setChecked('a', true);
    result.current.toggle('a');
  });
  expect(result.current.checkedKeys).toEqual(['a', 'b']);
  expect(result.current.expandedKeys).toEqual(['a']);
});

it('Table expansion callback cannot mutate accepted expansion', () => {
  render(
    <TableAdapter
      rowKey="id"
      dataSource={[{ id: 1 }]}
      columns={[{ key: 'id', dataIndex: 'id', title: 'ID' }]}
      expandable={{
        expandedRowRender: () => 'Details',
        onExpandedRowsChange: (keys) => {
          keys.length = 0;
        },
      }}
    />,
  );
  fireEvent.click(screen.getByRole('button', { name: 'Раскрыть строку 1' }));
  expect(screen.getByText('Details')).toBeTruthy();
});

it('Slider range callback cannot mutate accepted endpoints', () => {
  render(
    <SliderAdapter
      range
      defaultValue={[1, 5]}
      onValueChange={(next) => {
        (next as [number, number])[0] = 99;
      }}
    />,
  );
  fireEvent.keyDown(screen.getAllByRole('slider')[0], { key: 'ArrowRight' });
  expect(screen.getAllByRole('slider').map((node) => node.getAttribute('aria-valuenow'))).toEqual([
    '2',
    '5',
  ]);
});

it('Slider range preserves reentrant steps and clamps at the other endpoint', () => {
  const changed = vi.fn();
  render(
    <SliderAdapter
      range
      defaultValue={[1, 3]}
      onValueChange={(next) => {
        changed(next);
        if (changed.mock.calls.length === 1) {
          screen.getAllByRole('slider')[0].dispatchEvent(
            new KeyboardEvent('keydown', {
              key: 'ArrowRight',
              bubbles: true,
            }),
          );
        }
      }}
    />,
  );
  fireEvent.keyDown(screen.getAllByRole('slider')[0], { key: 'ArrowRight' });
  expect(screen.getAllByRole('slider')[0].getAttribute('aria-valuenow')).toBe('3');
  expect(changed.mock.calls).toEqual([[[2, 3]], [[3, 3]]]);
});

it('Markdown fieldset blocks direct formatting and undo', () => {
  let controls!: MarkdownEditorControls;
  const editor = (
    <MarkdownEditorAdapter
      defaultValue="hello"
      renderToolbar={(next) => {
        controls = next;
        return null;
      }}
    />
  );
  const view = render(<fieldset>{editor}</fieldset>);
  act(() => controls.execute({ type: 'bold' }));
  const area = screen.getByRole('textbox') as HTMLTextAreaElement;
  expect(area.value).toBe('**hello**');
  view.rerender(<fieldset disabled>{editor}</fieldset>);
  act(() => {
    controls.undo();
    controls.execute({ type: 'italic' });
  });
  expect(area.value).toBe('**hello**');
});

it('Select old form reset after reassociation has no effect', async () => {
  function Page({ form }: { form: string }) {
    return (
      <>
        <form id="one" />
        <form id="two" />
        <SelectAdapter
          form={form}
          options={options}
          defaultOpen
          showSearch={{ defaultSearchValue: 'A' }}
        />
      </>
    );
  }
  const view = render(<Page form="one" />);
  view.rerender(<Page form="two" />);
  fireEvent.reset(document.getElementById('one')!);
  await act(async () => {
    await Promise.resolve();
  });
  expect(screen.getByRole('combobox').getAttribute('aria-expanded')).toBe('true');
});

it('N02 Slider preserves a reentrant keyboard increment', () => {
  const changed = vi.fn();
  render(
    <SliderAdapter
      defaultValue={0}
      onValueChange={(next) => {
        changed(next);
        if (changed.mock.calls.length === 1)
          screen
            .getByRole('slider')
            .dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
      }}
    />,
  );
  fireEvent.keyDown(screen.getByRole('slider'), { key: 'ArrowRight' });
  expect(screen.getByRole('slider').getAttribute('aria-valuenow')).toBe('2');
  expect(changed.mock.calls).toEqual([[1], [2]]);
});

it.each(['keyboard', 'pointer'])('N03 Tree never expands a disabled node by %s', (method) => {
  render(
    <TreeAdapter<AuditTreeNode>
      records={[{ key: 'a', children: [{ key: 'b' }] }]}
      getKey={(r) => r.key}
      getChildren={(r) => r.children}
      getLabel={(r) => r.key}
      getDisabled={(r) => r.key === 'a'}
    />,
  );
  const node = screen.getByRole('treeitem', { name: 'a' });
  expect(node.getAttribute('aria-disabled')).toBe('true');
  if (method === 'keyboard') fireEvent.keyDown(node, { key: 'ArrowRight' });
  else fireEvent.click(node.querySelector('[data-slot="tree-indicator"]')!);
  expect(node.getAttribute('aria-expanded')).toBe('false');
});

it('Tree preserves two selection requests in StrictMode', () => {
  const { result } = renderHook(
    () =>
      useTree({
        records: [{ key: 'a' }, { key: 'b' }],
        getKey: (r) => r.key,
        getChildren: () => undefined,
        selectable: true,
        multiple: true,
      }),
    { wrapper: StrictMode },
  );
  act(() => {
    result.current.select('a');
    result.current.select('b');
  });
  expect(result.current.selectedKeys).toEqual(['a', 'b']);
});

it('N04 Markdown upload cannot write into an inherited disabled field', async () => {
  let resolve!: (value: string) => void;
  const promise = new Promise<string>((yes) => {
    resolve = yes;
  });
  let start!: () => Promise<void>;
  const editor = (
    <MarkdownEditorAdapter
      defaultValue="hello"
      uploadImage={() => promise}
      renderToolbar={(controls) => {
        start = () => controls.insertImage(new File(['x'], 'x.png', { type: 'image/png' }));
        return null;
      }}
    />
  );
  const view = render(<fieldset>{editor}</fieldset>);
  let work!: Promise<void>;
  act(() => {
    work = start();
  });
  view.rerender(<fieldset disabled>{editor}</fieldset>);
  const area = screen.getByRole('textbox') as HTMLTextAreaElement;
  expect(area.matches(':disabled')).toBe(true);
  await act(async () => {
    resolve('/late.png');
    await work;
  });
  expect(area.value).toBe('hello');
});

it('N05 Select ignores a queued reset from a previous form owner', async () => {
  function Page({ form }: { form: string }) {
    return (
      <>
        <form id="one" />
        <form id="two" />
        <SelectAdapter
          form={form}
          options={options}
          defaultOpen
          showSearch={{ defaultSearchValue: 'A' }}
        />
      </>
    );
  }
  const view = render(<Page form="one" />);
  fireEvent.reset(document.getElementById('one')!);
  view.rerender(<Page form="two" />);
  await act(async () => {
    await Promise.resolve();
  });
  const control = screen.getByRole('combobox') as HTMLInputElement;
  expect(control.form?.id).toBe('two');
  expect(control.getAttribute('aria-expanded')).toBe('true');
  expect(control.value).toBe('A');
});

it('N05 Select reset cannot notify an unmounted instance', async () => {
  const changed = vi.fn();
  const view = render(
    <form>
      <SelectAdapter options={options} defaultOpen onOpenChange={changed} />
    </form>,
  );
  fireEvent.reset(view.container.querySelector('form')!);
  view.unmount();
  await act(async () => {
    await Promise.resolve();
  });
  expect(changed).not.toHaveBeenCalled();
});

it('Toast duration replacement gets the complete new deadline', () => {
  vi.useFakeTimers();
  const changed = vi.fn();
  const { result, rerender } = renderHook(
    ({ duration }) => useToast({ duration, onOpenChange: changed }),
    { initialProps: { duration: 1000 }, wrapper: StrictMode },
  );
  act(() => {
    vi.advanceTimersByTime(900);
  });
  rerender({ duration: 2000 });
  act(() => {
    vi.advanceTimersByTime(1999);
  });
  expect(result.current.open).toBe(true);
  act(() => {
    vi.advanceTimersByTime(1);
  });
  expect(changed.mock.calls).toEqual([[false]]);
});
