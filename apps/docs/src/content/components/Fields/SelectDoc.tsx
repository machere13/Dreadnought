import { ComponentPage } from '../../../shared/ComponentPage.tsx';
import { useState } from 'react';
import { Select } from '@dreadnought/ui/react';
import { getCatalogDoc } from '../../../data/catalog/getCatalogDoc';
import type { ComponentDoc } from '../../../shared/types.ts';
import styles from '../../../shared/Documentation.module.css';

function SelectDemo() {
  const [value, setValue] = useState<string | null>(null);
  const options = [{ value: 'anna', label: 'Анна' }, { value: 'boris', label: 'Борис', disabled: true }, { value: 'vera', label: 'Вера' }];
  return <div className={styles.demo}>
    <div className={styles.demoRow}>
    <Select aria-label="Исполнитель" name="owner" options={options} placeholder="Выберите исполнителя" searchable allowClear value={value} onValueChange={setValue} />
    <Select multiple aria-label="Участники" options={options} searchable allowClear defaultValue={['anna', 'vera']} placeholder="Выберите участников" />
    <Select multiple aria-label="Ограничение меток" options={options} searchable maxTagCount={1} defaultValue={['anna', 'vera']} />
    <Select aria-label="Недоступный выбор" options={options} disabled defaultValue="anna" />
    <Select aria-label="Подробные варианты" options={options}
      optionRender={option => <span>{option.label} <small>— {option.value}</small></span>} />
    <Select aria-label="Загрузка вариантов" options={[]} loading loadingContent="Загружаем варианты…" placeholder="Откройте список" />
    <Select aria-label="Выбор по командам" searchable placeholder="Выберите участника" options={[
      { label: 'Команда', options }, { label: 'Гости', options: [{ value: 'guest', label: 'Даша' }] },
    ]} />
    </div>
    <p role="status">Исполнитель: {value ?? 'не выбран'}</p>
  </div>;
}

export const selectDoc: ComponentDoc = {
  ...getCatalogDoc('select'),
  title: 'Select',
  description: 'Выбор из списка: одиночный или множественный, с группами, поиском и очисткой. При multiple выбранные значения отображаются метками с кнопками удаления. Меню открывается поверх страницы и не расширяет её.',
  adapterDescription: 'Адаптер предоставляет разметку и поведение без оформления. Токены и CSS Modules подключает готовый компонент.',
  footnote: 'multiple требует массив строк; без него value — строка или null. name передаёт выбранные значения в форму. ref указывает на combobox. Для серверного поиска используйте searchable, searchValue/onSearch, filterOption={false} и loading. Запрос и защиту от устаревших ответов выполняет приложение. optionRender меняет строку списка, но label остаётся текстом для поиска, поля и доступного имени. Не вкладывайте в option интерактивные элементы. open/onOpenChange управляют открытием; defaultOpen задаёт начальное состояние. При выборе, закрытии и очистке поисковая строка сбрасывается через onSearch; в controlled-режиме новое значение должен передать владелец.',
  demo: <SelectDemo />,
};

export function SelectPage() {
  return <ComponentPage component="select" doc={selectDoc} />;
}
