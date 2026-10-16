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
  usage:
    'Для выбора одного варианта из небольшого видимого набора. Для длинного списка используйте Select, для независимых вариантов — Checkbox.',
  primaryProps: [
    'checked',
    'disabled',
    'value',
    'Radio.Group.options',
    'Radio.Group.value',
    'Radio.Group.defaultValue',
    'Radio.Group.onValueChange',
    'Radio.Group.required',
  ],
  description: 'Группа переключателей для выбора одного варианта.',
  adapterDescription: 'Адаптер сохраняет разметку и поведение без оформления темы.',
  notes: [
    'Стрелки переключают варианты внутри группы.',
    'name связывает радиокнопки и задаёт имя поля формы.',
    'value отдельной Radio — значение для отправки; checked управляет её выбором, defaultChecked задаёт начальный выбор.',
  ],
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
