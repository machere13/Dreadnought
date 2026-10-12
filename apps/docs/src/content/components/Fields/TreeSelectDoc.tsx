import { ComponentPage } from '../../../shared/ComponentPage.tsx';
import { getCatalogDoc } from '../../../data/catalog/getCatalogDoc.ts';
import type { ComponentDoc } from '../../../shared/types.ts';
import {
  TreeSelectDemo,
  TreeSelectMultipleDemo,
  TreeSelectSearchDemo,
  TreeSelectStatesDemo,
  TreeSelectFormDemo,
} from './TreeSelectDemo.tsx';

const catalog = getCatalogDoc('treeselect');
const apiNames = new Set([
  'records',
  'getKey',
  'getChildren',
  'getLabel',
  'value',
  'defaultValue',
  'onValueChange',
  'multiple',
  'checkStrictly',
  'showSearch',
  'expandedKeys',
  'defaultExpandedKeys',
  'onExpandedKeysChange',
  'getDisabled',
  'getCheckDisabled',
  'getSelectable',
  'open',
  'defaultOpen',
  'onOpenChange',
  'disabled',
  'readOnly',
  'required',
  'invalid',
  'allowClear',
  'placement',
  'autoAdjustOverflow',
  'emptyContent',
  'renderLabel',
  'tagRender',
]);
export const treeSelectDoc: ComponentDoc = {
  ...catalog,
  title: 'TreeSelect',
  description: 'Выбор из дерева: один узел, связанные или независимые отметки, поиск по подписи.',
  adapterDescription: 'Поле, дерево, клавиатура и связь с формой без оформления.',
  logicDescription:
    'useTreeSelect хранит выбор. getTreeSearchRows строит видимую часть; getTreeCheckState считает отметки на полном дереве.',
  apiRows: catalog.apiRows
    .filter((row) => apiNames.has(row[0]))
    .map((row) => {
      if (row[0] === 'value' || row[0] === 'defaultValue')
        return [row[0], 'Key | null / readonly Key[]', row[2], 'Ключ; при multiple — массив'];
      if (row[0] === 'showSearch')
        return [row[0], 'boolean | SearchOptions', 'false', 'Поиск по подписи узла'];
      if (row[0] === 'onValueChange')
        return [row[0], '(Key | null) / (Key[]) → void', '—', 'Изменение выбора'];
      return row;
    }),
  apiGroups: [
    {
      title: 'SearchOptions',
      rows: [
        ['searchValue', 'string', '—', 'Управляемый текст поиска'],
        ['defaultSearchValue', 'string', "''", 'Начальный текст поиска'],
        ['onSearch', '(text: string) → void', '—', 'Изменение текста'],
        ['filterNode', '(text, record) → boolean', '—', 'Своя проверка совпадения'],
      ],
    },
  ],
  demo: (
    <div style={{ display: 'grid', gap: '2rem', width: '100%' }}>
      <section>
        <h3>Один узел</h3>
        <TreeSelectDemo />
      </section>
      <section>
        <h3>Связанные отметки</h3>
        <TreeSelectMultipleDemo />
      </section>
      <section>
        <h3>Независимые отметки</h3>
        <TreeSelectMultipleDemo checkStrictly />
      </section>
      <section>
        <h3>Поиск</h3>
        <TreeSelectSearchDemo />
      </section>
      <section>
        <h3>Недоступные узлы и сохранённые ключи</h3>
        <TreeSelectStatesDemo />
      </section>
      <section>
        <h3>С Form</h3>
        <TreeSelectFormDemo />
      </section>
    </div>
  ),
  footnote: (
    <>
      В связанном режиме значение содержит все отмеченные ключи, включая родителей; теги показывают
      верхние узлы. Поиск не меняет выбор: отметка родителя действует и на скрытых детей.
      Неизвестные ключи сохраняются. Native FormData передаёт ключи строками, Form сохраняет их
      типы. Required в Form задаётся валидатором модели. При передаче режима через spread укажите
      multiple явно для вывода типа нового callback. Если TypeScript расширяет тип ключа, задайте
      его явно: TreeSelect&lt;Node, string&gt;. Нет async-загрузки, виртуализации и ограничения
      числа тегов.
    </>
  ),
};

export function TreeSelectPage() {
  return <ComponentPage component="treeselect" doc={treeSelectDoc} />;
}
