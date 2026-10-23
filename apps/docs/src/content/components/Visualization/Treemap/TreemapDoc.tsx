import { ComponentPage } from '../../../../shared/ComponentPage.tsx';
import { getCatalogDoc } from '../../../../data/catalog/getCatalogDoc';
import type { ComponentDoc } from '../../../../shared/types.ts';
import { TreemapBasicDemo } from './TreemapBasicDemo.tsx';
import basicCode from './TreemapBasicDemo.tsx?raw';
import { TreemapDetailsDemo } from './TreemapDetailsDemo.tsx';
import detailsCode from './TreemapDetailsDemo.tsx?raw';
import { TreemapStatesDemo } from './TreemapStatesDemo.tsx';
import statesCode from './TreemapStatesDemo.tsx?raw';
import { TreemapManyDemo } from './TreemapManyDemo.tsx';
import manyCode from './TreemapManyDemo.tsx?raw';

export const treemapDoc: ComponentDoc = {
  ...getCatalogDoc('treemap'),
  title: 'Treemap',
  description: 'Из чего складывается целое: группы и их вложенные элементы.',
  usage:
    'Покажите структуру бюджета, каталога или занятого места. Площадь блока соответствует значению, вложенные прямоугольники — составу группы. Для точного сравнения близких значений лучше BarChart, для нескольких долей без иерархии — PieChart.',
  primaryProps: ['data', 'label', 'formatValue', 'formatPercent', 'pageSize', 'onRootChange'],
  adapterDescription:
    'TreemapAdapter добавляет переходы по группам, Breadcrumb, Tooltip, таблицу и навигацию коллекций. Button используется для переходов; никаких ссылок с фиктивным адресом.',
  logicDescription:
    'buildTreemapLayout проверяет дерево, суммирует листья и возвращает прямоугольники, путь и доли. Нет React, DOM и CSS.',
  notes: [
    <>
      У листа есть value, у группы — children. Не задавайте оба: сумма группы вычисляется
      автоматически. Корень data всегда группа; ID уникальны во всём дереве. Отрицательные числа,
      NaN, Infinity, переполнение суммы и циклы отклоняются.
    </>,
    <>
      Показываются элементы текущей группы и геометрический предпросмотр следующего уровня. Нажмите
      группу, чтобы раскрыть её; Breadcrumb возвращает к любому предку. Цвет сохраняет
      принадлежность к верхней группе. Вложенность поддерживается до 64 уровней.
    </>,
    <>
      Блоки получаются двоичным разбиением по длинной стороне с сохранением порядка children. Это не
      squarify: сильно отличающиеся значения могут давать узкие полосы. Площадь до декоративных
      границ пропорциональна значению; границы и подписи не являются дополнительными данными.{' '}
      <a href="https://d3js.org/d3-hierarchy/treemap">О способах построения Treemap</a>.
    </>,
    <>
      Доля в группе считается относительно открытой группы, доля от всего — относительно исходного
      корня. При нулевой сумме доля не определена и показывается «—». Малые и нулевые значения не
      увеличиваются искусственно; точные данные и переходы всегда доступны в таблице.
    </>,
    <>
      Tab входит в блоки один раз. Стрелки и Home/End проходят их в порядке данных, не по
      геометрическому расстоянию. Enter/Space открывают группу, Escape закрывает Tooltip. После
      возврата фокус попадает на покинутую группу; в пустой группе — на её название.
    </>,
    <>
      pageSize ограничивает только таблицу: перелистывание не меняет площадь и состав диаграммы.
      Отрисовываются текущий и следующий уровень, без виртуализации их блоков. Для очень широких
      деревьев объединяйте элементы в смысловые группы.
    </>,
    <>
      data должен быть неизменяемым деревом. Замена его ссылки сбрасывает открытый уровень к корню.
      onRootChange сообщает ID после перехода пользователя; не управляет состоянием и не вызывается
      при сбросе данных.
    </>,
  ],
  examples: [
    {
      id: 'basic',
      title: 'От направления до конкретного проекта',
      description:
        'На продукт приходится 60% бюджета. Откройте «Продукт», затем «Интерфейсы»: у веб-приложения 20% всего бюджета, но 57,1% бюджета интерфейсов. Вернитесь через Breadcrumb.',
      demo: <TreemapBasicDemo />,
      code: basicCode,
    },
    {
      id: 'details',
      title: 'Малые блоки и длинные названия',
      description:
        'Иконка занимает всего 1 МБ — её площадь не увеличена ради подписи. Откройте медиафайлы и найдите иконку через таблицу или клавиатуру. Пустой архив доступен в таблице, но не занимает площадь.',
      demo: <TreemapDetailsDemo />,
      code: detailsCode,
    },
    {
      id: 'states',
      title: 'Нулевые расходы и пустой набор',
      description:
        'Нулевые проекты остаются в таблице. Проценты не подменяются нулями. Кнопка убирает весь набор и возвращает его; в пустую группу «Бета» можно перейти из таблицы.',
      demo: <TreemapStatesDemo />,
      code: statesCode,
    },
    {
      id: 'many',
      title: 'Много элементов без изменения масштаба',
      description:
        'Откройте одну из команд: на диаграмме будут все 50 проектов, а таблица покажет по 10 строк. Листайте таблицу — размеры блоков не меняются.',
      demo: <TreemapManyDemo />,
      code: manyCode,
    },
  ],
};
export function TreemapPage() {
  return <ComponentPage component="treemap" doc={treemapDoc} />;
}
