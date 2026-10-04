import { useState } from 'react';
import { Radio } from '@dreadnought/ui/react';
import { getCatalogDoc } from '../../catalog/getCatalogDoc';
import type { ComponentDoc } from './types';
import styles from '../DocsPage.module.css';

function RadioDemo() {
  const [value, setValue] = useState('basic');
  return <div className={styles.demo}><Radio.Group label="Тариф" name="plan" value={value} onValueChange={setValue}
    options={[{ value: 'basic', label: 'Базовый' }, { value: 'pro', label: 'Про' }, { value: 'enterprise', label: 'Корпоративный', disabled: true }]} />
    <p role="status">Выбран тариф: {value}</p></div>;
}

export const radioDoc: ComponentDoc = {
  ...getCatalogDoc('radio'),
  title: 'Radio',
  description: 'Выбор одного варианта. Radio.Group связывает радиокнопки общим name и поддерживает стандартную навигацию стрелками.',
  adapterDescription: 'Адаптер предоставляет разметку и поведение без оформления. Токены и CSS Modules подключает готовый компонент.',
  footnote: 'Для самостоятельных Radio задавайте одинаковый name внутри одной группы. value группы — строка. ref отдельной кнопки указывает на input.',
  demo: <RadioDemo />,
};
