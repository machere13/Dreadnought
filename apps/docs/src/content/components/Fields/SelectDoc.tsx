import { ComponentPage } from '../../../shared/ComponentPage.tsx';
import { useState } from 'react';
import { Badge, Button, Icon, Mark, Select } from '@dreadnought/ui/react';
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
    <Select multiple aria-label="Не больше двух участников" maxCount={2} searchable allowClear defaultValue={['anna', 'vera']} options={[...options, { value: 'guest', label: 'Даша' }]} />
    <Select multiple aria-label="Свои метки" options={options} searchable defaultValue={['anna', 'vera']}
      tagRender={(option, { disabled, removeLabel, onRemove }) => (
        <Badge appearance="outline" icon={<Mark color={option.value === 'anna' ? '#73c991' : '#86a9ff'} />}>
          {option.label}
          <Button type="button" variant="ghosted" size="compact" disabled={disabled}
            aria-label={removeLabel} icon={<Icon name="close" />} onClick={onRemove} />
        </Badge>
      )} />
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
  description: 'Выбор из списка: одиночный или множественный, с группами, поиском и очисткой. При multiple выбранные значения отображаются метками. Backspace в пустом поле удаляет последнее значение; при наличии текста редактирует поиск. Меню открывается поверх страницы и не расширяет её.',
  adapterDescription: 'Адаптер предоставляет разметку и поведение без оформления. Токены и CSS Modules подключает готовый компонент.',
  footnote: 'В controlled-режиме обновляйте value, open и searchValue по событиям. Поиск сбрасывается при выборе, закрытии и очистке. Для серверного поиска задайте filterOption={false}; запросы и их отмену выполняет приложение. optionRender меняет содержимое, но поиск и доступное имя берутся из label. Не вкладывайте в варианты кнопки или ссылки.',
  demo: <SelectDemo />,
};

export function SelectPage() {
  return <ComponentPage component="select" doc={selectDoc} />;
}
