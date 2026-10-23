import { ComponentPage } from '../../../../shared/ComponentPage.tsx';
import { getCatalogDoc } from '../../../../data/catalog/getCatalogDoc';
import type { ComponentDoc } from '../../../../shared/types.ts';
import { SankeyBasicDemo } from './SankeyBasicDemo.tsx';
import basicCode from './SankeyBasicDemo.tsx?raw';
import { SankeyBalanceDemo } from './SankeyBalanceDemo.tsx';
import balanceCode from './SankeyBalanceDemo.tsx?raw';
import { SankeyStatesDemo } from './SankeyStatesDemo.tsx';
import statesCode from './SankeyStatesDemo.tsx?raw';
import { SankeyManyDemo } from './SankeyManyDemo.tsx';
import manyCode from './SankeyManyDemo.tsx?raw';

export const sankeyDoc: ComponentDoc = {
  ...getCatalogDoc('sankey'),
  title: 'Sankey',
  description: 'Откуда пришёл поток и куда он распределился.',
  usage:
    'Покажите переходы пользователей, распределение бюджета или энергии между категориями. Для долей без переходов используйте PieChart, для изменения одной суммы — WaterfallChart.',
  primaryProps: ['nodes', 'links', 'label', 'formatValue', 'pageSize'],
  adapterDescription:
    'SankeyAdapter соединяет расчёт с SVG, Tooltip, Mark, навигацией коллекций и таблицей. Тема не требуется.',
  logicDescription:
    'buildSankeyLayout проверяет направленный граф без циклов, определяет колонки и рассчитывает размеры узлов и толщину связей без React и DOM.',
  notes: [
    <>
      nodes задаёт категории с уникальными id и label. links содержит уникальный id связи, source и
      target — ID узлов, value — конечное положительное число. Параллельные связи разрешены.
      Самоссылки, циклы, неизвестные узлы и переполнение сумм отклоняются.
    </>,
    <>
      Высота узла равна максимуму входящего и исходящего потока. Ширина всех связей использует общий
      масштаб. При несовпадении сумм компонент не придумывает остаток: добавьте для него отдельный
      узел и связь, если нужно показать его явно. Нулевую связь не передавайте.
    </>,
    <>
      Потоки направлены слева направо. Колонки определяются графом, конечные узлы выравниваются
      справа; порядок узлов внутри колонки и связей сохраняется. Автоматической оптимизации
      пересечений нет: группируйте nodes и links в читаемом порядке.
    </>,
    <>
      Tab входит в граф один раз, ←/→ и Home/End перемещают фокус сначала по узлам, затем по связям.
      Escape закрывает Tooltip. Наведение, фокус и нажатие раскрывают точные значения; цвет связи
      соответствует её источнику. Полное название доступно в подсказке даже при сокращённой подписи.
    </>,
    <>
      На узком экране граф прокручивается внутри своего контейнера, таблица — отдельно. pageSize
      ограничивает только строки таблицы: граф остаётся целым. nodeGap задаёт вертикальный
      промежуток в пикселях, по умолчанию 24.
    </>,
    <>
      Расчёт и память O(nodes + links), без нового движка визуализации. Поддерживается до 200 узлов
      и 1000 связей, весь граф находится в DOM — это не виртуализация. Для больших данных заранее
      объедините мелкие категории. nodes и links заменяйте, не изменяйте на месте; новая ссылка
      сбрасывает Tooltip и страницу таблицы.
    </>,
  ],
  examples: [
    {
      id: 'basic',
      title: 'Объединить источники и разделить результат',
      description:
        'Два источника дают 100 посетителей сайта. Поток делится на 60 заказов и 40 выходов. Наведите на узел «Сайт» или на связь: подписи в Tooltip покажут разные сведения.',
      demo: <SankeyBasicDemo />,
      code: basicCode,
    },
    {
      id: 'balance',
      title: 'Не скрывать разницу входа и выхода',
      description:
        'У счёта вход 100, выход 75. Его высота соответствует 100, а незаполненная часть справа — не выдуманная связь. Сравните входящие и исходящие в Tooltip.',
      demo: <SankeyBalanceDemo />,
      code: balanceCode,
    },
    {
      id: 'states',
      title: 'Отличить категорию без потока от пустых данных',
      description:
        'Узел без связей остаётся доступен с нулевыми значениями. Кнопка очищает граф полностью и возвращает его обратно.',
      demo: <SankeyStatesDemo />,
      code: statesCode,
    },
    {
      id: 'many',
      title: 'Листать таблицу без разрыва графа',
      description:
        'Все 12 команд остаются на диаграмме. Перейдите на вторую страницу таблицы: изменятся строки, но не ширины и не состав потоков.',
      demo: <SankeyManyDemo />,
      code: manyCode,
    },
  ],
};
export function SankeyPage() {
  return <ComponentPage component="sankey" doc={sankeyDoc} />;
}
