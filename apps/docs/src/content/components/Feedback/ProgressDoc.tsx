import { ComponentPage } from '../../../shared/ComponentPage.tsx';
import { getCatalogDoc } from '../../../data/catalog/getCatalogDoc';
import type { ComponentDoc } from '../../../shared/types.ts';
import { ProgressValueDemo } from './ProgressValueDemo.tsx';
import valueCode from './ProgressValueDemo.tsx?raw';
import { ProgressCountDemo } from './ProgressCountDemo.tsx';
import countCode from './ProgressCountDemo.tsx?raw';
import { ProgressStatusDemo } from './ProgressStatusDemo.tsx';
import statusCode from './ProgressStatusDemo.tsx?raw';

export const progressDoc: ComponentDoc = {
  ...getCatalogDoc('progress'),
  title: 'Progress',
  description:
    'Показывает, какая часть работы выполнена. В отличие от Loader, требует известного общего объёма.',
  adapterDescription:
    'Адаптер использует числовой core, задаёт доступную разметку и точную ширину заполнения, без темы и визуальных состояний.',
  logicDescription: (
    <>
      Core ограничивает значение диапазоном и возвращает процент и ARIA. Завершение означает
      достижение max, а не успешность операции.
    </>
  ),
  examples: [
    {
      id: 'value',
      title: 'Прогресс от 0 до 100%',
      description:
        'Кнопки меняют значение на 10, не выходя за границы. На границе соответствующая кнопка отключается. Это ручной пример: Progress сам не запускает и не отслеживает загрузку.',
      demo: <ProgressValueDemo />,
      code: valueCode,
    },
    {
      id: 'count',
      title: 'Количество вместо процентов',
      description:
        'Обработано 3 из 8 документов: value=3, max=8. Нажмите «Обработать следующий документ», чтобы увеличить счётчик. showPercent=false скрывает стандартный процент; подпись задаёт приложение.',
      demo: <ProgressCountDemo />,
      code: countCode,
    },
    {
      id: 'status',
      title: 'Завершение не равно успеху',
      description:
        '100% означает, что объём работы выполнен, но не гарантирует успешный результат. status="success" и status="error" задаются отдельно: сравните обычные 100%, успешное завершение и ошибку на 65%.',
      demo: <ProgressStatusDemo />,
      code: statusCode,
    },
  ],
  footnote:
    'value и max должны быть конечными числами, max — больше нуля. Значение ограничивается диапазоном [0, max]. Процент в подписи округляется, заполнение — нет: 3 из 8 даёт 38% и ширину 37.5%. Доступное имя операции задавайте через aria-label или aria-labelledby.',
};

export function ProgressPage() {
  return <ComponentPage component="progress" doc={progressDoc} />;
}
