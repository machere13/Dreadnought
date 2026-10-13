import { ComponentPage } from '../../../shared/ComponentPage.tsx';
import { getCatalogDoc } from '../../../data/catalog/getCatalogDoc.ts';
import type { ComponentDoc } from '../../../shared/types.ts';
import { RadioGroupDemo } from './RadioGroupDemo.tsx';
import example0Code from './RadioGroupDemo.tsx?raw';
import { RadioStandaloneDemo } from './RadioStandaloneDemo.tsx';
import example1Code from './RadioStandaloneDemo.tsx?raw';

export const radioDoc: ComponentDoc = {
  ...getCatalogDoc('radio'),
  title: 'Radio',
  description:
    'Выбор ровно одного варианта. Обычно используйте Radio.Group; отдельные Radio удобны, когда нужна собственная разметка.',
  adapterDescription: 'Адаптер сохраняет разметку и поведение без оформления темы.',
  footnote:
    'Стрелки переключают варианты внутри группы. name связывает радиокнопки и задаёт имя поля формы. value отдельной Radio — значение для отправки; checked управляет её выбором, defaultChecked задаёт начальный выбор.',
  examples: [
    {
      id: 'group',
      title: 'Группа тарифов',
      description:
        'Выберите один тариф: текущий выбор показан под группой. Корпоративный тариф недоступен. Radio.Group получает строковое value и сообщает изменения через onValueChange.',
      demo: <RadioGroupDemo />,
      code: example0Code,
    },
    {
      id: 'standalone',
      title: 'Отдельные радиокнопки',
      description:
        'Выберите частоту уведомлений. Одинаковый name связывает отдельные Radio в группу: одновременно выбран только один вариант. defaultChecked задаёт начальный выбор.',
      demo: <RadioStandaloneDemo />,
      code: example1Code,
    },
  ],
};

export function RadioPage() {
  return <ComponentPage component="radio" doc={radioDoc} />;
}
