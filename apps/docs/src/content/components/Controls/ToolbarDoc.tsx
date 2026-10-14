import { ComponentPage } from '../../../shared/ComponentPage.tsx';
import { getCatalogDoc } from '../../../data/catalog/getCatalogDoc.ts';
import type { ComponentDoc } from '../../../shared/types.ts';
import { ToolbarFormatDemo } from './ToolbarFormatDemo.tsx';
import formatCode from './ToolbarFormatDemo.tsx?raw';
import { ToolbarFiltersDemo } from './ToolbarFiltersDemo.tsx';
import filtersCode from './ToolbarFiltersDemo.tsx?raw';
import { ToolbarVerticalDemo } from './ToolbarVerticalDemo.tsx';
import verticalCode from './ToolbarVerticalDemo.tsx?raw';

export const toolbarDoc: ComponentDoc = {
  ...getCatalogDoc('toolbar'),
  title: 'Toolbar',
  description:
    'Группа связанных действий: форматирование, фильтры или управление масштабом. Панель организует расположение и клавиатурную навигацию; действия выполняет ваш код.',
  adapterDescription:
    'ToolbarAdapter сохраняет группировку и навигацию без оформления. Для кнопок подключайте useToolbarItem в дочернем компоненте и передавайте itemProps на фокусируемый элемент.',
  footnote:
    'По умолчанию Tab входит в панель один раз, стрелки переключают её кнопки, Home/End переходят к первой/последней. Это navigation="roving". Для полей с собственной клавиатурой задайте navigation="native": Tab проходит по каждому полю, стрелки работают внутри него. disabled нужно передавать и в useToolbarItem, и в кнопку. aria-label или aria-labelledby задают доступное название панели. RTL-навигация пока не поддерживается.',
  examples: [
    {
      id: 'format',
      title: 'Форматирование текста',
      description:
        'Нажмите «Жирный» или «Курсив»: изменится текст под панелью, а кнопка покажет включённое состояние. Можно включить оба варианта. «Сбросить формат» возвращает обычное начертание. Попробуйте Tab, затем стрелки влево и вправо.',
      demo: <ToolbarFormatDemo />,
      code: formatCode,
    },
    {
      id: 'filters',
      title: 'Панель с поиском и выбором статуса',
      description:
        'Введите «План», выберите «Архив» и нажмите «Применить»: останется «План прошлого года». До применения список не меняется. «Сбросить фильтры» возвращает все документы. В этой панели Tab проходит по полям, а стрелки не перехватываются.',
      demo: <ToolbarFiltersDemo />,
      code: filtersCode,
    },
    {
      id: 'vertical',
      title: 'Вертикальные действия и границы переходов',
      description:
        'Кнопки меняют размер образца от 75% до 150%. На границе соответствующая кнопка недоступна и пропускается при навигации. Стрелки вверх/вниз переключают команды; loop=false не позволяет перейти с последней на первую.',
      demo: <ToolbarVerticalDemo />,
      code: verticalCode,
    },
  ],
};

export function ToolbarPage() {
  return <ComponentPage component="toolbar" doc={toolbarDoc} />;
}
