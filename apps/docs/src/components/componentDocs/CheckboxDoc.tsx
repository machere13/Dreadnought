import { useState } from 'react';
import { Checkbox } from '@dreadnought/ui/react';
import { getCatalogDoc } from '../../data/catalog/getCatalogDoc';
import type { ComponentDoc } from './types';
import styles from '../DocsPage.module.css';

function CheckboxDemo() {
  const [checked, setChecked] = useState(false);
  return <div className={styles.demo}><div className={styles.demoRow}><Checkbox checked={checked} onChange={event => setChecked(event.target.checked)}>Получать уведомления</Checkbox>
    <Checkbox indeterminate>Часть пунктов выбрана</Checkbox>
    <Checkbox disabled>Недоступный пункт</Checkbox>
    </div>
    <Checkbox.Group label="Каналы уведомлений" name="channels" defaultValue={['email']} options={[{ value: 'email', label: 'Почта' }, { value: 'push', label: 'Push' }]} />
  </div>;
}

export const checkboxDoc: ComponentDoc = {
  ...getCatalogDoc('checkbox'),
  title: 'Checkbox',
  description: 'Флажок для независимого выбора. Поддерживает неопределённое состояние и группу нескольких значений.',
  adapterDescription: 'Адаптер предоставляет разметку и поведение без оформления. Токены и CSS Modules подключает готовый компонент.',
  footnote: 'checked управляет отдельным флажком; value группы — массив строк. ref отдельного компонента указывает на input, группы — на fieldset.',
  demo: <CheckboxDemo />,
};
