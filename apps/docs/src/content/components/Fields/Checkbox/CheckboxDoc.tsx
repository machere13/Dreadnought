import { ComponentPage } from '../../../../shared/ComponentPage.tsx';
import { getCatalogDoc } from '../../../../data/catalog/getCatalogDoc';
import type { ComponentDoc } from '../../../../shared/types.ts';
import { CheckboxBasicDemo } from './CheckboxBasicDemo.tsx';
import basicCode from './CheckboxBasicDemo.tsx?raw';
import { CheckboxGroupDemo } from './CheckboxGroupDemo.tsx';
import groupCode from './CheckboxGroupDemo.tsx?raw';
import { CheckboxSelectAllDemo } from './CheckboxSelectAllDemo.tsx';
import allCode from './CheckboxSelectAllDemo.tsx?raw';
import { CheckboxStatesDemo } from './CheckboxStatesDemo.tsx';
import statesCode from './CheckboxStatesDemo.tsx?raw';

export const checkboxDoc: ComponentDoc = {
  ...getCatalogDoc('checkbox'),
  title: 'Checkbox',
  usage:
    'Для независимых пунктов и множественного выбора, например каналов уведомлений. Для одного варианта из нескольких используйте Radio.',
  primaryProps: [
    'checked',
    'defaultChecked',
    'disabled',
    'indeterminate',
    'required',
    'Checkbox.Group.options',
    'Checkbox.Group.value',
    'Checkbox.Group.onValueChange',
  ],
  description: 'Флажок или группа для выбора независимых пунктов.',
  adapterDescription:
    'Адаптер предоставляет разметку и поведение без оформления. Токены и CSS Modules подключает готовый компонент.',
  notes: [
    'checked управляет отдельным флажком; value группы — массив строк.',
    'ref отдельного компонента указывает на input, группы — на fieldset.',
  ],
  examples: [
    {
      id: 'basic',
      title: 'Один флажок',
      description:
        'Нажмите на флажок или его подпись: строка ниже покажет состояние уведомлений. checked хранится в React, а onChange обновляет его. С клавиатуры используйте Tab и Space.',
      demo: <CheckboxBasicDemo />,
      code: basicCode,
    },
    {
      id: 'group',
      title: 'Несколько каналов уведомлений',
      description:
        'Выберите «Почта» и «Push» независимо друг от друга. Checkbox.Group возвращает массив значений email и push; пустой массив означает отсутствие выбора. SMS недоступен и не добавляется в результат.',
      demo: <CheckboxGroupDemo />,
      code: groupCode,
    },
    {
      id: 'select-all',
      title: 'Выбрать всё и промежуточное состояние',
      description:
        'Изначально выбрана только почта, поэтому «Все каналы» показывает черту. Нажмите его, чтобы выбрать оба канала; повторное нажатие снимет все отметки. При выборе части пунктов indeterminate вычисляется из массива — это не отдельное значение выбора.',
      demo: <CheckboxSelectAllDemo />,
      code: allCode,
    },
    {
      id: 'disabled',
      title: 'Недоступные пункты',
      description:
        'disabled блокирует изменение и исключает флажок из обхода Tab. Он может быть как отмеченным, так и пустым. Попробуйте нажать на подписи: значения не изменятся.',
      demo: <CheckboxStatesDemo />,
      code: statesCode,
    },
  ],
};

export function CheckboxPage() {
  return <ComponentPage component="checkbox" doc={checkboxDoc} />;
}
