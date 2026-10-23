import { ComponentPage } from '../../../../shared/ComponentPage.tsx';
import { getCatalogDoc } from '../../../../data/catalog/getCatalogDoc';
import type { ComponentDoc } from '../../../../shared/types.ts';
import { FunnelChartBasicDemo } from './FunnelChartBasicDemo.tsx';
import basicCode from './FunnelChartBasicDemo.tsx?raw';
import { FunnelChartFormatDemo } from './FunnelChartFormatDemo.tsx';
import formatCode from './FunnelChartFormatDemo.tsx?raw';
import { FunnelChartStatesDemo } from './FunnelChartStatesDemo.tsx';
import statesCode from './FunnelChartStatesDemo.tsx?raw';
import { FunnelChartStagesDemo } from './FunnelChartStagesDemo.tsx';
import stagesCode from './FunnelChartStagesDemo.tsx?raw';

export const funnelChartDoc: ComponentDoc = {
  ...getCatalogDoc('funnelchart'),
  title: 'FunnelChart',
  description: 'На каком этапе пользователи перестают двигаться дальше.',
  usage:
    'Используйте для последовательной регистрации, покупки или обучения одной группы пользователей. Ширина показывает количество на этапе. Для независимых категорий или значений, которые растут от шага к шагу, выберите BarChart.',
  primaryProps: ['data', 'label', 'formatValue', 'formatPercent', 'pageSize'],
  adapterDescription:
    'FunnelChartAdapter связывает этапы с SVG, Tooltip, Mark, таблицей и навигацией коллекций. Работает без темы и измерения DOM.',
  logicDescription:
    'buildFunnelLayout сохраняет порядок этапов и считает ширины, конверсии и потери без React и DOM.',
  notes: [
    <>
      Передавайте готовые количества для одного периода и одной группы. Компонент не анализирует
      журнал событий и не определяет, кто действительно прошёл все этапы.
    </>,
    <>
      «От первого» = текущее / первое; «От предыдущего» = текущее / предыдущее. Потеря — разность с
      предыдущим этапом. У первого этапа нет предыдущего, а деление на ноль не определено: в этих
      случаях показывается «—».
    </>,
    <>
      Верхняя ширина каждой фигуры пропорциональна количеству, нижняя соединяется со следующим
      этапом. Последняя фигура имеет равные ширины. Сравнивайте верхние ширины и подписи, не площади
      трапеций. Это подход{' '}
      <a href="https://ant-design-charts.antgroup.com/en/components/plots/funnel">
        воронки Ant Design Charts
      </a>
      .
    </>,
    <>
      Порядок data сохраняется. Отрицательные значения, рост между этапами, повторные ID, NaN и
      Infinity отклоняются, а не сортируются или обрезаются. Ноль остаётся в подписи и таблице, но
      не рисует ненулевую фигуру.
    </>,
    <>
      Tab входит в график один раз; ↑/↓ и Home/End переключают этапы текущей страницы. Escape
      закрывает Tooltip. Для сенсорного экрана нажмите область этапа. Все значения доступны в
      таблице без наведения.
    </>,
    <>
      pageSize ограничивает одновременно график и таблицу; ширины и обе конверсии считаются по
      полному процессу. Расчёт O(n), память O(n), массив data нужно заменять, а не изменять на
      месте.
    </>,
  ],
  examples: [
    {
      id: 'basic',
      title: 'Понять, где теряются покупатели',
      description:
        'Из 1000 посетителей оплатили 100: это 10% от начала. Но из 400 пользователей с корзиной оплатили 25%. Наведите на последний этап или перейдите к нему клавишей End — Tooltip покажет обе величины.',
      demo: <FunnelChartBasicDemo />,
      code: basicCode,
    },
    {
      id: 'format',
      title: 'Подписать единицы и проценты',
      description:
        'Курс завершили 54 человека: 45% от приглашённых и 60% от начавших. formatPercent получает отношение 0–1; здесь проценты форматируются через Intl.NumberFormat.',
      demo: <FunnelChartFormatDemo />,
      code: formatCode,
    },
    {
      id: 'states',
      title: 'Нули — не отсутствие данных',
      description:
        'Никто не отправил заявку: конверсия второго этапа 0%. У третьего переход 0/0 не определён — «—». Очистка показывает отдельное пустое состояние, возврат восстанавливает этапы.',
      demo: <FunnelChartStatesDemo />,
      code: statesCode,
    },
    {
      id: 'stages',
      title: 'Длинная последовательность',
      description:
        '12 этапов по четыре на странице. На второй странице шаг 5 остаётся 66,7% от начала процесса, а не становится новыми 100%. Таблица и график перелистываются вместе.',
      demo: <FunnelChartStagesDemo />,
      code: stagesCode,
    },
  ],
};

export function FunnelChartPage() {
  return <ComponentPage component="funnelchart" doc={funnelChartDoc} />;
}
