import { ComponentPage } from '../../../../shared/ComponentPage.tsx';
import { getCatalogDoc } from '../../../../data/catalog/getCatalogDoc';
import type { ComponentDoc } from '../../../../shared/types.ts';
import { LoaderSizesDemo } from './LoaderSizesDemo.tsx';
import sizesCode from './LoaderSizesDemo.tsx?raw';
import { LoaderOverlayDemo } from './LoaderOverlayDemo.tsx';
import overlayCode from './LoaderOverlayDemo.tsx?raw';
import { LoaderCustomDemo } from './LoaderCustomDemo.tsx';
import customCode from './LoaderCustomDemo.tsx?raw';

export const loaderDoc: ComponentDoc = {
  ...getCatalogDoc('loader'),
  title: 'Loader',
  usage:
    'Когда операция выполняется, но её прогресс неизвестен. Если известны выполненный и общий объём, используйте Progress.',
  primaryProps: ['loading', 'label', 'children', 'delay', 'size'],
  description:
    'Индикатор ожидания: отдельно или поверх содержимого, которое остаётся смонтированным.',
  adapterDescription:
    'Адаптер задаёт aria-busy, доступное имя индикатора и inert для вложенного содержимого, без темы и готового кольца.',
  examples: [
    {
      id: 'loader-sizes',
      title: 'Отдельный индикатор и размеры',
      description:
        'Без children Loader показывает только индикатор. Сравните small, default и large. loading по умолчанию включён; label задаёт доступное имя, showLabel выводит его рядом с графикой. Эти образцы постоянно активны, настоящей загрузки здесь нет.',
      demo: <LoaderSizesDemo />,
      code: sizesCode,
    },
    {
      id: 'loader-overlay',
      title: 'Загрузка поверх содержимого',
      description:
        'Измените заметку и нажмите «Начать загрузку». Поле заблокируется, через 200 мс появится индикатор. «Завершить загрузку» вернёт доступ к полю, сохранив текст. Быстрая операция не покажет индикатор. Запросы к сети не выполняются.',
      demo: <LoaderOverlayDemo />,
      code: overlayCode,
    },
    {
      id: 'loader-custom',
      title: 'Собственная графика ожидания',
      description:
        'indicator заменяет стандартное кольцо любым React-элементом. Здесь использована Icon с именем clock. Доступное имя по-прежнему задаёт label у Loader.',
      demo: <LoaderCustomDemo />,
      code: customCode,
    },
  ],
  notes: [
    <>
      <code>delay={200}</code> откладывает индикатор на 200 мс, но блокирует контент сразу.
    </>,
    <>
      Быстрые запросы не показывают индикатор; <code>delay={0}</code> показывает сразу.
    </>,
    <>
      При <code>loading=false</code> индикатор исчезает и содержимое снова доступно.
    </>,
    <>Loader не показывает процент выполнения.</>,
    <>Полноэкранный прелоадер — способ размещения Loader, не отдельный компонент.</>,
  ],
};

export function LoaderPage() {
  return <ComponentPage component="loader" doc={loaderDoc} />;
}
