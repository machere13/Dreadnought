import { Tree } from '@dreadnought/ui/react';
import { getCatalogDoc } from '../../data/catalog/getCatalogDoc';
import type { ComponentDoc } from './types';

type Node = { id: string; label: string; children?: readonly Node[] };
const records: readonly Node[] = [{ id: 'docs', label: 'Документация', children: [
  { id: 'start', label: 'Начало' },
  { id: 'components', label: 'Компоненты', children: [{ id: 'button', label: 'Button' }] },
] }];
export const treeDoc: ComponentDoc = {
  ...getCatalogDoc('tree'), title: 'Tree',
  description: 'Вложенные пункты, раскрытие, одиночный или множественный выбор и чекбоксы с частично отмеченными родителями. Оформление настраивается через токены.',
  adapterDescription: 'TreeAdapter создаёт вложенные treeitem/group и управляет фокусом без встроенных стилей.',
  logicDescription: <>getVisibleTreeRows вычисляет строки; getTreeKeyAction решает действие клавиши. getSelectionValue отвечает за выбор, getTreeCheckState — за отметки родителей и потомков. useTree подключает состояние к React.</>,
  demo: <Tree records={records} getKey={node => node.id} getChildren={node => node.children}
    getLabel={node => node.label} selectable checkable defaultCheckedKeys={['start']}
    defaultExpandedKeys={['docs']} aria-label="Разделы документации" />,
  footnote: <>Выбор включается через selectable, отметки — через checkable. Стрелки перемещают фокус и раскрывают ветви; Enter выбирает, Space отмечает (или выбирает без чекбоксов). Без этих режимов Enter/Space раскрывают ветку. checkStrictly отключает связь отметок; getDisabled и getCheckDisabled останавливают её на узле, но не блокируют независимые действия с его потомками. Tab выходит из дерева. selectedKeys/checkedKeys управляются владельцем; callbacks сообщают запрос. Загрузка, виртуализация и drag-and-drop пока не реализованы.</>,
};
