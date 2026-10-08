import { Tree } from '@dreadnought/ui/react';
import { getCatalogDoc } from '../../catalog/getCatalogDoc';
import type { ComponentDoc } from './types';

type Node = { id: string; label: string; children?: readonly Node[] };
const records: readonly Node[] = [{ id: 'docs', label: 'Документация', children: [
  { id: 'start', label: 'Начало' },
  { id: 'components', label: 'Компоненты', children: [{ id: 'button', label: 'Button' }] },
] }];
export const treeDoc: ComponentDoc = {
  ...getCatalogDoc('tree'), title: 'Tree',
  description: 'Вложенные пункты и раскрытие ветвей мышью или клавиатурой. Отступы, цвета и фокус настраиваются через токены.',
  adapterDescription: 'TreeAdapter создаёт вложенные treeitem/group и управляет фокусом без встроенных стилей.',
  logicDescription: <>getVisibleTreeRows вычисляет строки; getTreeKeyAction решает действие клавиши. useTree добавляет управляемое или внутреннее раскрытие.</>,
  demo: <Tree records={records} getKey={node => node.id} getChildren={node => node.children}
    getLabel={node => node.label} defaultExpandedKeys={['docs']} aria-label="Разделы документации" />,
  footnote: <>Стрелки перемещают фокус и раскрывают ветви; Home/End переходят к краям; Enter/Space переключают родителя. Tab выходит из дерева. Выбора, typeahead и интерактивных потомков renderLabel нет.</>,
};
