import { createRef } from 'react';
import { act, cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { flushSync } from 'react-dom';
import { afterEach, expect, it, vi } from 'vitest';
import { ModalAdapter, TreeSelectAdapter } from '../../../src/unstyled.ts';
import { useForm } from '../../../src/logic.ts';
import { FormAdapter } from '../../../src/Fields/Form/FormAdapter.tsx';
import { OverlayVisibilityContext } from '../../../src/shared/OverlayVisibilityContext.ts';

afterEach(cleanup);
type Node = { id: string; label: string; children?: readonly Node[]; disabled?: boolean };
const records: readonly Node[] = [
  {
    id: 'dev',
    label: 'Разработка',
    children: [
      { id: 'front', label: 'Frontend' },
      { id: 'back', label: 'Backend' },
    ],
  },
];
const options = {
  records,
  getKey: (node: Node) => node.id,
  getChildren: (node: Node) => node.children,
  getLabel: (node: Node) => node.label,
};

it('keeps partial parent ARIA marks when search filters its unselected child', async () => {
  const user = userEvent.setup();
  render(
    <TreeSelectAdapter
      {...options}
      multiple
      defaultValue={['front']}
      showSearch
      aria-label="Команда"
    />,
  );
  await user.type(screen.getByRole('combobox', { name: 'Команда' }), 'front');
  expect(
    screen.getByRole('treeitem', { name: 'Разработка', exact: true }).getAttribute('aria-checked'),
  ).toBe('mixed');
  expect(screen.getByRole('checkbox', { name: 'Разработка' })).toHaveProperty(
    'indeterminate',
    true,
  );
  expect(screen.queryByRole('treeitem', { name: 'Backend' })).toBeNull();
  await user.click(screen.getByRole('checkbox', { name: 'Разработка' }));
  expect(
    screen.getByRole('treeitem', { name: 'Разработка', exact: true }).getAttribute('aria-checked'),
  ).toBe('true');
  await user.click(screen.getByRole('button', { name: 'Удалить Разработка' }));
  expect(
    screen.getByRole('treeitem', { name: 'Разработка', exact: true }).getAttribute('aria-checked'),
  ).toBe('false');
});

it('does not submit search text as a value and validates required selection', async () => {
  const user = userEvent.setup();
  const submit = vi.fn((event: React.FormEvent) => event.preventDefault());
  render(
    <form onSubmit={submit}>
      <TreeSelectAdapter {...options} name="team" required showSearch aria-label="Команда" />
      <button type="submit">Сохранить</button>
    </form>,
  );
  const field = screen.getByRole('combobox', { name: 'Команда' });
  await user.type(field, 'front');
  const form = field.closest('form')!;
  expect(new FormData(form).getAll('team')).toEqual([]);
  act(() => form.requestSubmit());
  expect(submit).not.toHaveBeenCalled();
  expect(field.ownerDocument.activeElement).toBe(field);
  await user.click(screen.getByRole('treeitem', { name: 'Frontend', exact: true }));
  act(() => form.requestSubmit());
  expect(submit).toHaveBeenCalledTimes(1);
  expect(new FormData(form).getAll('team')).toEqual(['front']);
});

it('submits accepted multiple keys rather than a rejected controlled proposal', async () => {
  const user = userEvent.setup();
  const onValueChange = vi.fn();
  render(
    <form>
      <TreeSelectAdapter
        {...options}
        multiple
        value={['front']}
        onValueChange={onValueChange}
        name="team"
        defaultExpandedKeys={['dev']}
        aria-label="Команда"
      />
    </form>,
  );
  await user.click(screen.getByRole('button', { name: 'Открыть дерево' }));
  await user.click(screen.getByRole('checkbox', { name: 'Backend' }));
  expect(onValueChange).toHaveBeenLastCalledWith(['dev', 'front', 'back']);
  expect(new FormData(screen.getByRole('combobox').closest('form')!).getAll('team')).toEqual([
    'front',
  ]);
});

it('keeps numeric zero, string zero and an empty-string key typed in callbacks', async () => {
  const user = userEvent.setup();
  const onValueChange = vi.fn();
  const data = [
    { id: 0, label: 'Number' },
    { id: '0', label: 'String' },
    { id: '', label: 'Empty' },
  ];
  render(
    <form>
      <TreeSelectAdapter
        records={data}
        getKey={(node) => node.id}
        getChildren={() => []}
        getLabel={(node) => node.label}
        multiple
        checkStrictly
        onValueChange={onValueChange}
        name="key"
        aria-label="Key"
      />
    </form>,
  );
  await user.click(screen.getByRole('button', { name: 'Открыть дерево' }));
  await user.click(screen.getByRole('checkbox', { name: 'Number' }));
  await user.click(screen.getByRole('checkbox', { name: 'String' }));
  await user.click(screen.getByRole('checkbox', { name: 'Empty' }));
  expect(onValueChange).toHaveBeenLastCalledWith([0, '0', '']);
  expect(new FormData(screen.getByRole('combobox').closest('form')!).getAll('key')).toEqual([
    '0',
    '0',
    '',
  ]);
});

it('resets value, search and disclosure and respects cancellation', async () => {
  const user = userEvent.setup();
  render(
    <form>
      <TreeSelectAdapter {...options} defaultValue="front" showSearch aria-label="Команда" />
    </form>,
  );
  const field = screen.getByRole('combobox') as HTMLInputElement;
  const form = field.form!;
  await user.type(field, 'back');
  await act(async () => form.reset());
  expect(field.value).toBe('Frontend');
  await user.type(field, 'front');
  form.addEventListener('reset', (event) => event.preventDefault(), { once: true });
  await act(async () => form.reset());
  expect(field.value).toBe('front');
});

it('tracks late and replaced external forms without stale reset association', async () => {
  function Fixture({ formId = 'late', include = false }: { formId?: string; include?: boolean }) {
    return (
      <>
        <TreeSelectAdapter
          {...options}
          form={formId}
          defaultValue="front"
          showSearch
          aria-label="Команда"
        />
        {include && <form id="late" key={formId} />}
        <form id="other" />
      </>
    );
  }
  const user = userEvent.setup();
  const view = render(<Fixture />);
  view.rerender(<Fixture include />);
  const field = screen.getByRole('combobox') as HTMLInputElement;
  await user.type(field, 'back');
  await act(async () => field.form!.reset());
  expect(field.value).toBe('Frontend');
  await user.type(field, 'front');
  await act(async () => {
    field.form!.reset();
    flushSync(() => view.rerender(<Fixture include formId="other" />));
    expect(field.form!.id).toBe('other');
  });
  expect(field.value).toBe('front');
  await act(async () => field.form!.reset());
  expect(field.value).toBe('Frontend');
});

it('uses managed Form values and resets search when the accepted value is unchanged', async () => {
  const finish = vi.fn();
  function Demo() {
    const form = useForm<{ team: string | null }>({ initialValues: { team: 'front' } });
    const field = form.field('team');
    return (
      <FormAdapter form={form} onFinish={finish}>
        <TreeSelectAdapter
          {...options}
          value={field.value}
          onValueChange={field.setValue}
          name="team"
          showSearch
          aria-label="Команда"
        />
        <button type="submit">Сохранить</button>
        <button type="reset">Сбросить</button>
      </FormAdapter>
    );
  }
  const user = userEvent.setup();
  render(<Demo />);
  await user.type(screen.getByRole('combobox'), 'back');
  await user.click(screen.getByRole('treeitem', { name: 'Backend', exact: true }));
  await user.click(screen.getByRole('button', { name: 'Сохранить' }));
  expect(finish).toHaveBeenLastCalledWith({ team: 'back' });
  await user.type(screen.getByRole('combobox'), 'bad');
  await user.click(screen.getByRole('button', { name: 'Сбросить' }));
  expect(screen.getByRole('combobox')).toHaveProperty('value', 'Frontend');
});

it('moves with the keyboard, skips disabled rows and separates expansion from selection', async () => {
  const user = userEvent.setup();
  const onValueChange = vi.fn();
  const data: readonly Node[] = [{ id: 'blocked', label: 'Blocked', disabled: true }, ...records];
  render(
    <TreeSelectAdapter
      {...options}
      records={data}
      getDisabled={(node) => Boolean(node.disabled)}
      onValueChange={onValueChange}
      aria-label="Команда"
    />,
  );
  const field = screen.getByRole('combobox');
  await user.click(screen.getByRole('button', { name: 'Открыть дерево' }));
  expect(field.ownerDocument.activeElement).toBe(field);
  await user.keyboard('{ArrowDown}');
  expect(field.ownerDocument.activeElement).toBe(
    screen.getByRole('treeitem', { name: 'Разработка', exact: true }),
  );
  await user.keyboard('{ArrowRight}{ArrowRight}');
  expect(field.ownerDocument.activeElement).toBe(
    screen.getByRole('treeitem', { name: 'Frontend', exact: true }),
  );
  expect(onValueChange).not.toHaveBeenCalled();
  await user.keyboard('{End}{Enter}');
  expect(onValueChange).toHaveBeenLastCalledWith('back');
  expect(screen.queryByRole('tree')).toBeNull();
});

it('does not consume text cursor keys, composing input or cancelled opening', () => {
  render(
    <TreeSelectAdapter
      {...options}
      showSearch
      aria-label="Команда"
      onKeyDown={(event) => {
        if (event.key === 'ArrowDown') event.preventDefault();
      }}
    />,
  );
  const field = screen.getByRole('combobox');
  fireEvent.keyDown(field, { key: 'ArrowDown' });
  expect(screen.queryByRole('tree')).toBeNull();
  fireEvent.keyDown(field, { key: 'ArrowDown', isComposing: true });
  expect(screen.queryByRole('tree')).toBeNull();
  expect(fireEvent.keyDown(field, { key: 'ArrowLeft' })).toBe(true);
});

it('restores available focus when an active row disappears during filtering', async () => {
  const user = userEvent.setup();
  const view = render(
    <TreeSelectAdapter
      {...options}
      showSearch={{ searchValue: '' }}
      defaultExpandedKeys={['dev']}
      defaultOpen
      aria-label="Команда"
    />,
  );
  const front = screen.getByRole('treeitem', { name: 'Frontend', exact: true });
  await user.click(front);
  await user.click(screen.getByRole('button', { name: 'Открыть дерево' }));
  fireEvent.focus(screen.getByRole('treeitem', { name: 'Frontend', exact: true }));
  act(() => screen.getByRole('treeitem', { name: 'Frontend', exact: true }).focus());
  view.rerender(
    <TreeSelectAdapter
      {...options}
      showSearch={{ searchValue: 'back' }}
      defaultExpandedKeys={['dev']}
      defaultOpen
      aria-label="Команда"
    />,
  );
  expect(screen.getByRole('combobox').ownerDocument.activeElement).toBe(
    screen.getByRole('treeitem', { name: 'Разработка', exact: true }),
  );
});

it('keeps a native exit with no available rows and permits readonly disclosure', async () => {
  const user = userEvent.setup();
  const view = render(
    <TreeSelectAdapter {...options} getDisabled={() => true} aria-label="Команда" />,
  );
  await user.click(screen.getByRole('button', { name: 'Открыть дерево' }));
  await user.keyboard('{ArrowDown}');
  expect(screen.getByRole('combobox').ownerDocument.activeElement).toBe(screen.getByRole('tree'));
  await user.keyboard('{Escape}');
  expect(screen.queryByRole('tree')).toBeNull();
  view.rerender(
    <TreeSelectAdapter
      key="readonly"
      {...options}
      readOnly
      defaultValue="front"
      aria-label="Команда"
    />,
  );
  await user.click(screen.getByRole('button', { name: 'Открыть дерево' }));
  await user.keyboard('{ArrowDown}{ArrowRight}{ArrowRight}{Enter}');
  expect(screen.getByRole('combobox')).toHaveProperty('value', 'Frontend');
  expect(screen.getByRole('tree')).not.toBeNull();
});

it('forwards the real input ref and disabled native value policy', () => {
  const ref = createRef<HTMLInputElement>();
  render(
    <form>
      <TreeSelectAdapter
        {...options}
        ref={ref}
        disabled
        value="front"
        name="team"
        aria-label="Команда"
        data-consumer="yes"
      />
    </form>,
  );
  expect(ref.current).toBe(screen.getByRole('combobox'));
  expect(ref.current?.getAttribute('data-consumer')).toBe('yes');
  expect(new FormData(ref.current!.form!).getAll('team')).toEqual([]);
});

it('renders public row and tag content without giving away selection handlers', async () => {
  const user = userEvent.setup();
  render(
    <TreeSelectAdapter
      {...options}
      multiple
      defaultValue={['front']}
      defaultExpandedKeys={['dev']}
      aria-label="Команда"
      renderLabel={(row) => <strong>{row.record.label}</strong>}
      tagRender={(tag, state) => (
        <button
          type="button"
          onClick={state.onRemove}
          disabled={state.disabled}
        >{`Убрать ${tag.label}`}</button>
      )}
    />,
  );
  await user.click(screen.getByRole('button', { name: 'Открыть дерево' }));
  expect(
    screen.getByRole('treeitem', { name: 'Frontend', exact: true }).querySelector('strong')
      ?.textContent,
  ).toBe('Frontend');
  await user.click(screen.getByRole('button', { name: 'Убрать Frontend' }));
  expect(screen.getByRole('checkbox', { name: 'Frontend' })).toHaveProperty('checked', false);
});

it('allows custom empty content and native validation opt-outs', async () => {
  const user = userEvent.setup();
  const submit = vi.fn((event) => event.preventDefault());
  render(
    <form noValidate onSubmit={submit}>
      <TreeSelectAdapter
        {...options}
        required
        showSearch
        emptyContent="Ничего не найдено"
        aria-label="Команда"
      />
      <button type="submit">Сохранить</button>
    </form>,
  );
  await user.type(screen.getByRole('combobox'), 'missing');
  expect(screen.getByText('Ничего не найдено')).not.toBeNull();
  await user.click(screen.getByRole('button', { name: 'Сохранить' }));
  expect(submit).toHaveBeenCalledTimes(1);
});

it('lets Tab leave without restoring input focus', async () => {
  const user = userEvent.setup();
  render(
    <>
      <TreeSelectAdapter {...options} defaultOpen aria-label="Команда" />
      <button>Следующий</button>
    </>,
  );
  const field = screen.getByRole('combobox');
  act(() => field.focus());
  await user.keyboard('{ArrowDown}');
  await user.tab();
  expect(field.ownerDocument.activeElement).toBe(screen.getByRole('button', { name: 'Следующий' }));
  expect(screen.queryByRole('tree')).toBeNull();
});

it('keeps boundary navigation keys from scrolling the page', async () => {
  const user = userEvent.setup();
  render(<TreeSelectAdapter {...options} aria-label="Команда" />);
  await user.click(screen.getByRole('button', { name: 'Открыть дерево' }));
  await user.keyboard('{ArrowDown}');
  const row = screen.getByRole('treeitem', { name: 'Разработка', exact: true });
  expect(fireEvent.keyDown(row, { key: 'ArrowUp' })).toBe(false);
  expect(fireEvent.keyDown(row, { key: 'ArrowDown' })).toBe(false);
});

it('respects a cancelled click from custom label content', async () => {
  const user = userEvent.setup();
  const changed = vi.fn();
  render(
    <TreeSelectAdapter
      {...options}
      onValueChange={changed}
      aria-label="Команда"
      renderLabel={(row) => (
        <span onClick={(event) => event.preventDefault()}>{row.record.label}</span>
      )}
    />,
  );
  await user.click(screen.getByRole('button', { name: 'Открыть дерево' }));
  await user.click(screen.getByText('Разработка'));
  expect(changed).not.toHaveBeenCalled();
});

it('marks the visible control invalid after rejected native required submission', () => {
  render(
    <form>
      <TreeSelectAdapter {...options} required aria-label="Команда" />
    </form>,
  );
  const field = screen.getByRole('combobox') as HTMLInputElement;
  act(() => field.form!.requestSubmit());
  expect(field.getAttribute('aria-invalid')).toBe('true');
});

it('binds reset and focus to its iframe document', async () => {
  const iframe = document.createElement('iframe');
  document.body.append(iframe);
  try {
    const doc = iframe.contentDocument!;
    const user = userEvent.setup({ document: doc });
    const container = doc.createElement('div');
    doc.body.append(container);
    const view = render(
      <form>
        <TreeSelectAdapter {...options} defaultValue="front" showSearch aria-label="Команда" />
      </form>,
      { container },
    );
    const query = within(doc.body);
    const field = query.getByRole('combobox') as HTMLInputElement;
    await user.type(field, 'back');
    await act(async () => field.form!.reset());
    expect(field.value).toBe('Frontend');
    await user.click(query.getByRole('button', { name: 'Открыть дерево' }));
    fireEvent.keyDown(field, { key: 'ArrowDown' });
    expect(doc.activeElement).toBe(
      query.getByRole('treeitem', { name: 'Разработка', exact: true }),
    );
    view.unmount();
  } finally {
    iframe.remove();
  }
});

it('consumes the first Escape before the parent Modal closes', async () => {
  const proto = HTMLDialogElement.prototype;
  const originalShow = Object.getOwnPropertyDescriptor(proto, 'showModal');
  const originalClose = Object.getOwnPropertyDescriptor(proto, 'close');
  Object.defineProperties(proto, {
    showModal: {
      configurable: true,
      value() {
        this.open = true;
      },
    },
    close: {
      configurable: true,
      value() {
        this.open = false;
        this.dispatchEvent(new Event('close'));
      },
    },
  });
  try {
    const user = userEvent.setup();
    const view = render(
      <ModalAdapter
        defaultOpen
        aria-label="Форма"
        content={<TreeSelectAdapter {...options} aria-label="Команда" />}
      >
        {(trigger) => <button {...trigger}>Открыть форму</button>}
      </ModalAdapter>,
    );
    await user.click(screen.getByRole('button', { name: 'Открыть дерево' }));
    await user.keyboard('{ArrowDown}{Escape}');
    expect(screen.queryByRole('tree')).toBeNull();
    expect(screen.getByRole('dialog', { name: 'Форма' })).toHaveProperty('open', true);
    expect(fireEvent.keyDown(screen.getByRole('combobox'), { key: 'Escape' })).toBe(true);
    fireEvent(screen.getByRole('dialog', { name: 'Форма' }), new Event('cancel', { cancelable: true }));
    expect(screen.queryByRole('dialog', { name: 'Форма' })).toBeNull();
    view.unmount();
  } finally {
    cleanup();
    if (originalShow) Object.defineProperty(proto, 'showModal', originalShow);
    else delete (proto as Partial<HTMLDialogElement>).showModal;
    if (originalClose) Object.defineProperty(proto, 'close', originalClose);
    else delete (proto as Partial<HTMLDialogElement>).close;
  }
});

it('disables a hidden overlay and ignores queued blur after unmount', async () => {
  const change = vi.fn();
  const view = render(
    <OverlayVisibilityContext value={false}>
      <TreeSelectAdapter
        {...options}
        open
        value="front"
        onOpenChange={change}
        aria-label="Команда"
      />
    </OverlayVisibilityContext>,
  );
  expect(screen.getByRole('combobox')).toHaveProperty('disabled', true);
  expect(screen.queryByRole('tree')).toBeNull();
  view.rerender(
    <TreeSelectAdapter {...options} defaultOpen onOpenChange={change} aria-label="Команда" />,
  );
  fireEvent.blur(screen.getByRole('combobox'), { relatedTarget: document.body });
  view.unmount();
  await act(async () => {});
  expect(change).not.toHaveBeenCalled();
});
