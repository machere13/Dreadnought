import { ComponentPage } from '../../../shared/ComponentPage.tsx';
import { getCatalogDoc } from '../../../data/catalog/getCatalogDoc.ts';
import type { ComponentDoc } from '../../../shared/types.ts';
import { TreeSelectDemo } from './TreeSelectDemo.tsx';
import singleCode from './TreeSelectDemo.tsx?raw';
import { TreeSelectMultipleDemo } from './TreeSelectMultipleDemo.tsx';
import multipleCode from './TreeSelectMultipleDemo.tsx?raw';
import { TreeSelectStrictDemo } from './TreeSelectStrictDemo.tsx';
import strictCode from './TreeSelectStrictDemo.tsx?raw';
import { TreeSelectSearchDemo } from './TreeSelectSearchDemo.tsx';
import searchCode from './TreeSelectSearchDemo.tsx?raw';
import { TreeSelectStatesDemo } from './TreeSelectStatesDemo.tsx';
import statesCode from './TreeSelectStatesDemo.tsx?raw';
import { TreeSelectUnknownDemo } from './TreeSelectUnknownDemo.tsx';
import unknownCode from './TreeSelectUnknownDemo.tsx?raw';
import { TreeSelectFormDemo } from './TreeSelectFormDemo.tsx';
import formCode from './TreeSelectFormDemo.tsx?raw';

const catalog = getCatalogDoc('treeselect');
export const treeSelectDoc: ComponentDoc = {
  ...catalog,
  title: 'TreeSelect',
  usage:
    'Для выбора команды, папки или другого элемента иерархии в форме. Для плоского списка используйте Select, для постоянно видимого дерева — Tree.',
  primaryProps: [
    'records',
    'getKey',
    'getLabel',
    'getChildren',
    'value',
    'onValueChange',
    'multiple',
    'showSearch',
  ],
  description: 'Поле выбора одного или нескольких элементов из дерева.',
  adapterDescription: 'Поле, дерево, клавиатура и связь с формой без оформления.',
  logicDescription:
    'useTreeSelect хранит выбор. getTreeSearchRows строит видимую часть; getTreeCheckState считает отметки на полном дереве.',
  apiRows: catalog.apiRows.map((row) => {
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
  examples: [
    {
      id: 'single',
      title: 'Одна команда из дерева',
      description:
        'Откройте дерево и выберите Frontend: поле покажет название, а результат ниже — Frontend (front). Родитель «Разработка» тоже доступен для выбора. Крестик очищает значение до null. getKey, getChildren и getLabel связывают структуру ваших данных с деревом.',
      demo: <TreeSelectDemo />,
      code: singleCode,
    },
    {
      id: 'linked',
      title: 'Связанные отметки: выбор всей ветки',
      description:
        'Отметьте «Разработка»: выберутся также Frontend и Backend. В поле останется один тег родителя, но value содержит все три ключа: dev, front, back. Введите front в поиск и повторите выбор родителя: скрытый Backend тоже входит в выбор. Удаление тега снимает отметки всей ветки.',
      demo: <TreeSelectMultipleDemo />,
      code: multipleCode,
    },
    {
      id: 'strict',
      title: 'Независимые отметки',
      description:
        'Сравните с предыдущим примером: multiple вместе с checkStrictly выбирает только нажатый узел. Отметьте «Разработка»: value будет ["dev"], а Frontend и Backend останутся неотмеченными. Их можно выбрать отдельно.',
      demo: <TreeSelectStrictDemo />,
      code: strictCode,
    },
    {
      id: 'search',
      title: 'Поиск не равен выбору',
      description:
        'Введите front: останется Frontend и его родитель «Разработка». Текст поиска отображается отдельно и сам по себе не выбирает команду. Нажмите Frontend, чтобы получить ключ front. Поиск missing покажет пустой результат, но не удалит уже выбранную команду.',
      demo: <TreeSelectSearchDemo />,
      code: searchCode,
    },
    {
      id: 'states',
      title: 'Ограничения поля и узлов',
      description:
        'disabled отключает поле, readOnly оставляет сохранённый выбор без возможности его изменить. В третьем поле само дерево открывается, но getDisabled запрещает каждый узел. Эти ограничения не очищают ранее выбранное значение.',
      demo: <TreeSelectStatesDemo />,
      code: statesCode,
    },
    {
      id: 'unknown',
      title: 'Сохранённый ключ вне текущего дерева',
      description:
        'Изначально выбран archived, которого нет в records. TreeSelect сохраняет его и показывает сам ключ вместо отсутствующего названия. Выберите другую команду, чтобы заменить значение, или очистите его крестиком. Здесь нет подгрузки данных с сервера.',
      demo: <TreeSelectUnknownDemo />,
      code: unknownCode,
    },
    {
      id: 'form',
      title: 'Обязательная команда в Form',
      description:
        'Попробуйте сохранить пустое поле или только текст поиска: появится «Выберите команду». Выберите узел и нажмите «Сохранить» — ниже появится его ключ, без запроса к серверу. «Сбросить» очистит выбор, поиск и результат. Обязательность проверяет валидатор useForm.',
      demo: <TreeSelectFormDemo />,
      code: formCode,
    },
  ],
  notes: [
    <>
      В связанном режиме значение содержит все отмеченные ключи, включая родителей; теги показывают
      верхние узлы.
    </>,
    <>Поиск не меняет выбор: отметка родителя действует и на скрытых детей.</>,
    <>Неизвестные ключи сохраняются.</>,
    <>Native FormData передаёт ключи строками, Form сохраняет их типы.</>,
    <>Required в Form задаётся валидатором модели.</>,
    <>Нет async-загрузки, виртуализации и ограничения числа тегов.</>,
  ],
};

export function TreeSelectPage() {
  return <ComponentPage component="treeselect" doc={treeSelectDoc} />;
}
