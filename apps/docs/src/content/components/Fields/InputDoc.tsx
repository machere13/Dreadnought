import { Input } from '@dreadnought/ui/react';
import { getCatalogDoc } from '../../../data/catalog/getCatalogDoc.ts';
import type { ComponentDoc } from '../../../shared/types.ts';
import { ComponentPage } from '../../../shared/ComponentPage.tsx';
import styles from '../../../shared/Documentation.module.css';

function InputDemo() {
  return <div className={`${styles.demo} ${styles.fieldDemo}`}>
    <label htmlFor="demo-email">Электронная почта</label>
    <Input id="demo-email" type="email" name="demo-email" autoComplete="off" placeholder="name@example.com" />
    <label htmlFor="demo-password">Пароль</label>
    <Input id="demo-password" type="password" name="demo-password" autoComplete="new-password" passwordVisibilityLabels={{ show: 'Показать пароль', hide: 'Скрыть пароль' }} />
    <label htmlFor="demo-quantity">Количество</label>
    <Input id="demo-quantity" type="number" name="quantity" min={0} max={10} defaultValue="1"
      stepButtonLabels={{ decrease: 'Уменьшить значение', increase: 'Увеличить значение' }} />
  </div>;
}

const inputDoc: ComponentDoc = {
  ...getCatalogDoc('input'),
    title: 'Input',
    description: 'Однострочное поле: текст, пароль с переключателем видимости или число с кнопками уменьшения и увеличения.',
    adapterDescription: 'Адаптер создаёт поле и дополнительные кнопки без оформления. Для number шаг выполняет нативный input; готовый компонент использует Button.',
    logicDescription: 'Хук возвращает inputProps с ref, visibilityButtonProps для пароля и stepButtonProps для числа. Передайте полученные свойства своим элементам.',
    footnote: <>Поле принимает стандартные свойства <code>&lt;input&gt;</code>. Для number используйте <code>min</code>, <code>max</code>, <code>step</code>; <code>step="any"</code> отключает кнопки шага. <code>onChange</code> получает событие поля, пустое значение — пустая строка, не ноль. <code>className</code> относится к обёртке; подпись задавайте через <code>&lt;label&gt;</code> или ARIA, а не через placeholder.</>,
    demo: <InputDemo />,
  };

export function InputPage() {
  return <ComponentPage component="input" doc={inputDoc} />;
}
