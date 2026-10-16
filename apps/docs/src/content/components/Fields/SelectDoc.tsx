import { ComponentPage } from '../../../shared/ComponentPage.tsx';
import { getCatalogDoc } from '../../../data/catalog/getCatalogDoc.ts';
import type { ComponentDoc } from '../../../shared/types.ts';
import { SelectBasicDemo } from './Select/SelectBasicDemo.tsx';
import basicCode from './Select/SelectBasicDemo.tsx?raw';
import { SelectMultipleDemo } from './Select/SelectMultipleDemo.tsx';
import multipleCode from './Select/SelectMultipleDemo.tsx?raw';
import { SelectLimitsDemo } from './Select/SelectLimitsDemo.tsx';
import limitsCode from './Select/SelectLimitsDemo.tsx?raw';
import { SelectSearchDemo } from './Select/SelectSearchDemo.tsx';
import searchCode from './Select/SelectSearchDemo.tsx?raw';
import { SelectAppearanceDemo } from './Select/SelectAppearanceDemo.tsx';
import appearanceCode from './Select/SelectAppearanceDemo.tsx?raw';
import { SelectStatesDemo } from './Select/SelectStatesDemo.tsx';
import statesCode from './Select/SelectStatesDemo.tsx?raw';
import { SelectTagsDemo } from './Select/SelectTagsDemo.tsx';
import tagsCode from './Select/SelectTagsDemo.tsx?raw';
import { SelectPlacementDemo } from './Select/SelectPlacementDemo.tsx';
import placementCode from './Select/SelectPlacementDemo.tsx?raw';
import { SelectLargeDemo } from './Select/SelectLargeDemo.tsx';
import largeCode from './Select/SelectLargeDemo.tsx?raw';

export const selectDoc: ComponentDoc = {
  ...getCatalogDoc('select'),
  title: 'Select',
  usage:
    'Для выбора из заранее заданного списка, в том числе с поиском и несколькими значениями. Для списка команд используйте Dropdown, для иерархии — TreeSelect.',
  primaryProps: [
    'options',
    'value',
    'onValueChange',
    'multiple',
    'showSearch',
    'allowClear',
    'disabled',
    'loading',
  ],
  description: 'Поле выбора одного или нескольких вариантов из раскрывающегося списка.',
  adapterDescription: 'Адаптер сохраняет разметку и поведение выбора без оформления.',
  notes: [
    'value управляется приложением, defaultValue задаёт только начальный выбор.',
    'При одиночном выборе очистка возвращает null, при multiple — пустой массив.',
    'Не вкладывайте кнопки или ссылки в optionRender.',
    'Для вариантов произвольной высоты отключите виртуализацию через virtual={false}.',
  ],
  examples: [
    {
      id: 'basic',
      title: 'Один исполнитель',
      description:
        'Выберите имя, найдите его через поиск или очистите поле крестиком. Под полем показан текущий выбор. Борис недоступен. Значение хранится в React через value и onValueChange.',
      demo: <SelectBasicDemo />,
      code: basicCode,
    },
    {
      id: 'multiple',
      title: 'Несколько участников',
      description:
        'Выберите несколько имён. Крестик на метке удаляет одного участника; очистка поля удаляет всех. При multiple значение — массив строк.',
      demo: <SelectMultipleDemo />,
      code: multipleCode,
    },
    {
      id: 'limits',
      title: 'Количество меток и лимит выбора',
      description:
        'maxTagCount скрывает лишние метки, но сохраняет выбор. maxCount ограничивает сам выбор: удалите одного участника во втором поле, чтобы выбрать Дашу.',
      demo: <SelectLimitsDemo />,
      code: limitsCode,
    },
    {
      id: 'search',
      title: 'Поиск, группы и содержимое вариантов',
      description:
        'В первом поле найдите Анну по имени или коду anna; варианты показывают оба значения. Во втором поле участники разделены на команды — заголовки групп не выбираются.',
      demo: <SelectSearchDemo />,
      code: searchCode,
    },
    {
      id: 'appearance',
      title: 'Размер и оформление',
      description:
        'Сравните компактное заполненное поле и вариант без рамки. Эти настройки меняют оформление, а не способ выбора.',
      demo: <SelectAppearanceDemo />,
      code: appearanceCode,
    },
    {
      id: 'states',
      title: 'Недоступность и загрузка',
      description:
        'Первое поле заблокировано. Откройте второе, чтобы увидеть сообщение загрузки. Это постоянная демонстрация состояния, а не реальный запрос.',
      demo: <SelectStatesDemo />,
      code: statesCode,
    },
    {
      id: 'tags',
      title: 'Свои метки',
      description:
        'tagRender заменяет метку выбранного участника. Здесь используются Badge и Mark; кнопка удаления сохраняет доступное имя и обработчик Select.',
      demo: <SelectTagsDemo />,
      code: tagsCode,
    },
    {
      id: 'placement',
      title: 'Положение списка',
      description:
        'Откройте список: он появится над полем по правому краю. Здесь автоперемещение отключено для демонстрации; обычно autoAdjustOverflow стоит оставить включённым.',
      demo: <SelectPlacementDemo />,
      code: placementCode,
    },
    {
      id: 'large',
      title: 'Длинный список',
      description:
        'Введите «Участник 9999» или прокрутите список. Поиск работает по всем 10 000 вариантам, а в разметке отображается только видимая часть.',
      demo: <SelectLargeDemo />,
      code: largeCode,
    },
  ],
};

export function SelectPage() {
  return <ComponentPage component="select" doc={selectDoc} />;
}
