import { ComponentPage } from '../../../shared/ComponentPage.tsx';
import { getCatalogDoc } from '../../../data/catalog/getCatalogDoc.ts';
import type { ComponentDoc } from '../../../shared/types.ts';
import { TreeSelectionDemo } from './TreeSelectionDemo.tsx';
import example0Code from './TreeSelectionDemo.tsx?raw';
import { TreeCheckDemo } from './TreeCheckDemo.tsx';
import example1Code from './TreeCheckDemo.tsx?raw';

export const treeDoc: ComponentDoc = {
  ...getCatalogDoc('tree'),
  title: 'Tree',
  usage:
    'Для просмотра и выбора узлов иерархии, например папок или разделов. Если выбор должен выглядеть как поле формы со списком, используйте TreeSelect.',
  primaryProps: [
    'records',
    'getKey',
    'getLabel',
    'getChildren',
    'selectedKeys',
    'onSelectedKeysChange',
    'checkable',
    'checkedKeys',
    'onCheckedKeysChange',
  ],
  description: 'Дерево с раскрытием ветвей, выбором узлов и чекбоксами.',
  adapterDescription: 'Адаптер сохраняет разметку и поведение без оформления темы.',
  notes: [
    'Стрелки перемещают фокус и раскрывают ветви; Enter выбирает узел, Space переключает отметку.',
    'Tab выходит из дерева.',
    'selectedKeys и checkedKeys управляются приложением; defaultSelectedKeys и defaultCheckedKeys задают начальное состояние.',
    'Загрузка, виртуализация и drag-and-drop пока не реализованы.',
  ],
  examples: [
    {
      id: 'selection',
      title: 'Раскрытие и выбор раздела',
      description:
        'Раскройте «Компоненты» стрелкой, затем выберите Button по названию. Под деревом показан выбранный раздел. Раскрытие ветки и выбор узла — разные действия.',
      demo: <TreeSelectionDemo />,
      code: example0Code,
    },
    {
      id: 'checks',
      title: 'Связанные и независимые отметки',
      description:
        'Отметьте «Документация»: в обычном режиме отметятся её потомки. Снимите отметку «Начало», чтобы увидеть частично отмеченного родителя. Включите «Независимые отметки»: checkStrictly отключит связь родителя с потомками.',
      demo: <TreeCheckDemo />,
      code: example1Code,
    },
  ],
};

export function TreePage() {
  return <ComponentPage component="tree" doc={treeDoc} />;
}
