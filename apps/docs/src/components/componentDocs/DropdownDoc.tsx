import { useState } from 'react';
import { Button, Dropdown } from '@dreadnought/ui/react';
import { getCatalogDoc } from '../../data/catalog/getCatalogDoc';
import type { ComponentDoc } from './types';
import styles from '../DocsPage.module.css';

function DropdownExample() {
  const [chosen, setChosen] = useState('');
  const items = [{ value: 'edit', label: 'Редактировать' }, { value: 'download', label: 'Скачать' }, { value: 'delete', label: 'Удалить', disabled: true }];
  return <div className={styles.demo}><Dropdown items={items} placement="bottomLeft"
    onAction={value => setChosen(items.find(item => item.value === value)!.label)}>
    {trigger => <Button {...trigger}>Действия с файлом</Button>}
  </Dropdown><span role="status">{chosen ? `Выбрано: ${chosen}` : 'Выберите действие'}</span></div>;
}

export const dropdownDoc: ComponentDoc = {
  ...getCatalogDoc('dropdown'), title: 'Dropdown',
  description: 'Меню действий рядом с кнопкой. Menu отвечает за пункты и клавиатурную навигацию, Popover — за положение, раскрытие и фокус. После выбора меню закрывается; disabled-пункты пропускаются.',
  adapterDescription: 'DropdownAdapter связывает MenuAdapter и usePopover без оформления. Отдельные core и useDropdown не нужны: для собственной композиции используйте существующие behaviors, MenuAdapter и usePopover.',
  footnote: <>Передайте свойства триггера одной кнопке с доступным именем. Enter, Space и клик открывают меню; ArrowDown выбирает первый доступный пункт, ArrowUp — последний. Escape и выбор возвращают фокус на кнопку; Tab свободно выходит наружу. В controlled-режиме подтвердите onOpenChange через open. По умолчанию placement="bottomLeft", arrow=false. Открытие без анимации и hover. Для произвольного содержимого используйте Popover. Поверхность меняется через --dreadnought-popover-*, пункты — --dreadnought-menu-*, высота списка — --dreadnought-dropdown-max-height.</>,
  demo: <DropdownExample />,
};
