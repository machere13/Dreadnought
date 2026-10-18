import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, expect, it } from 'vitest';
import { ComponentDocumentation } from '../src/shared/ComponentDocumentation.tsx';
import { getCatalogDoc } from '../src/data/catalog/getCatalogDoc.ts';
import data from '../src/data/catalog/generated/catalog-docs.json';
import { ApiTable } from '../src/shared/ApiTable.tsx';

afterEach(cleanup);

it('does not render empty optional explanations or notes', () => {
  const { container } = render(
    <ComponentDocumentation
      component="button"
      doc={{
        ...getCatalogDoc('button'),
        title: 'Button',
        description: 'Кнопка.',
        adapterDescription: '',
        logicDescription: undefined,
        notes: [],
        demo: <div>Пример кнопки</div>,
      }}
    />,
  );
  expect(Array.from(container.querySelectorAll('p')).filter((p) => !p.textContent?.trim())).toEqual(
    [],
  );
  expect(screen.getByRole('heading', { name: 'Основные свойства' })).toBeTruthy();
});

it('shows meaningful API descriptions without changing types and defaults', () => {
  const doc = getCatalogDoc('select');
  render(
    <ComponentDocumentation
      component="select"
      doc={{
        ...doc,
        title: 'Select',
        description: 'Выбор.',
        adapterDescription: '',
        notes: [],
        demo: <div>Пример выбора</div>,
      }}
    />,
  );
  const table = screen.getByRole('table', { name: 'Select API' });
  expect(within(table).queryAllByText('Свойство компонента')).toEqual([]);
  const disabled = within(table).getByRole('rowheader', { name: 'disabled' }).closest('tr')!;
  expect(within(disabled).getByRole('cell', { name: 'boolean', exact: true })).toBeTruthy();
  expect(within(disabled).getByRole('cell', { name: 'false', exact: true })).toBeTruthy();
});

it('places API before alternative layers in both the article and outline', () => {
  const { container } = render(
    <ComponentDocumentation
      component="button"
      doc={{
        ...getCatalogDoc('button'),
        title: 'Button',
        description: 'Кнопка.',
        adapterDescription: '',
        notes: [],
        demo: <div>Пример</div>,
      }}
    />,
  );
  expect(
    [...container.querySelectorAll('article > section')].map((section) =>
      section.getAttribute('aria-labelledby'),
    ),
  ).toEqual(['button-example', 'button-api', 'button-layers']);
  const links = within(screen.getByRole('navigation', { name: 'На этой странице' })).getAllByRole(
    'link',
    { hidden: true },
  );
  expect(links.map((link) => link.getAttribute('href'))).toEqual([
    '#button-overview',
    '#button-example',
    '#button-api',
    '#button-layers',
  ]);
});

it('preserves names, complete types and defaults for all 42 component families', () => {
  const components = Object.entries(data.components);
  expect(components).toHaveLength(42);
  for (const [component, raw] of components) {
    const doc = getCatalogDoc(component);
    const generated = raw as {
      apiRows: string[][];
      apiGroups?: { title: string; rows: string[][] }[];
    };
    expect(doc.apiRows.map((row) => row.slice(0, 3))).toEqual(
      generated.apiRows.map((row) => row.slice(0, 3)),
    );
    for (const [index, group] of (doc.apiGroups ?? []).entries()) {
      expect(group.title).toBe(generated.apiGroups![index].title);
      expect(group.rows.map((row) => row.slice(0, 3))).toEqual(
        generated.apiGroups![index].rows.map((row) => row.slice(0, 3)),
      );
    }
    for (const row of [...doc.apiRows, ...(doc.apiGroups ?? []).flatMap((group) => group.rows)]) {
      expect(row[3], `${component}.${row[0]}`).not.toBe('Свойство компонента');
      expect(row[3].trim(), `${component}.${row[0]}`).not.toBe('');
    }
  }
});

it('uses specific concise explanations for previously vague properties', () => {
  expect(
    getCatalogDoc('markdowneditor').apiRows.find((row) => row[0] === 'allowClear')![3],
  ).toContain('очистки Markdown');
  expect(getCatalogDoc('timepicker').apiRows.find((row) => row[0] === 'defaultOpen')![3]).toContain(
    'при первом',
  );
  expect(getCatalogDoc('datepicker').apiRows.find((row) => row[0] === 'ref')![3]).toContain(
    'input',
  );
  const rows = getCatalogDoc('table').apiRows;
  expect(rows.find((row) => row[0] === 'processing')![3]).toContain('manual');
  expect(rows.find((row) => row[0] === 'rowSelection')![3]).toContain('текущей страницы');
  expect(rows.find((row) => row[0] === 'onChange')![3]).toContain('extra.action');
});

it('collapses long inline types without truncating them or hiding enum values', () => {
  const value = `{ callback: (${Array.from({ length: 25 }, (_, i) => `arg${i}: string`).join(', ')}) => void }`;
  render(
    <ApiTable
      component="example"
      label="Пример API"
      rows={[
        ['slotProps', value, '—', 'Настройки частей.'],
        ['placement', 'top | bottom', 'bottom', 'Положение.'],
      ]}
    />,
  );
  const toggle = screen.getByRole('button', { name: 'Полный тип' });
  const panel = document.getElementById(toggle.getAttribute('aria-controls')!)!;
  expect(panel.hidden).toBe(true);
  expect(panel.querySelector('code')?.textContent).toBe(value);
  expect(within(screen.getByRole('table')).getByText('top | bottom')).toBeTruthy();
  fireEvent.click(toggle);
  expect(panel.hidden).toBe(false);
});

it('keeps links to documented type groups instead of collapsing them', () => {
  const type = `readonly DetailedRecord<${'LongTypeName'.repeat(20)}>[]`;
  render(
    <ApiTable
      component="table"
      label="Пример API"
      rows={[['columns', type, '—', 'Колонки.']]}
      groups={[{ title: 'DetailedRecord', rows: [] }]}
    />,
  );
  expect(screen.getByRole('link', { name: type }).getAttribute('href')).toBe(
    '#table-api-detailedrecord',
  );
  expect(screen.queryByText('Полный тип')).toBeNull();
});
