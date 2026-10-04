import { useState } from 'react';
import { Select } from '@dreadnought/ui/react';
import { getCatalogDoc } from '../../catalog/getCatalogDoc';
import type { ComponentDoc } from './types';
import styles from '../DocsPage.module.css';

function SelectDemo() {
  const [value, setValue] = useState<string | null>(null);
  const options = [{ value: 'anna', label: 'Анна' }, { value: 'boris', label: 'Борис', disabled: true }, { value: 'vera', label: 'Вера' }];
  return <div className={styles.demo}>
    <div className={styles.demoRow}>
    <Select aria-label="Исполнитель" name="owner" options={options} placeholder="Выберите исполнителя" searchable allowClear value={value} onValueChange={setValue} />
    <Select multiple aria-label="Участники" options={options} searchable allowClear defaultValue={['anna']} placeholder="Выберите участников" />
    <Select aria-label="Недоступный выбор" options={options} disabled defaultValue="anna" />
    </div>
    <p role="status">Исполнитель: {value ?? 'не выбран'}</p>
  </div>;
}

export const selectDoc: ComponentDoc = {
  ...getCatalogDoc('select'),
  title: 'Select',
  description: 'Выбор из списка: одиночный или множественный, с поиском и очисткой. Меню открывается поверх страницы и не расширяет её.',
  adapterDescription: 'Адаптер предоставляет разметку и поведение без оформления. Токены и CSS Modules подключает готовый компонент.',
  footnote: 'multiple требует массив строк; без него value — строка или null. name передаёт выбранные значения в форму. ref указывает на combobox. Стрелки перемещают выбор, Enter подтверждает, Escape закрывает список.',
  demo: <SelectDemo />,
};
