import { useState } from 'react';
import { useToolbarItem } from '@dreadnought/react/logic';
import { Button, Input, Select, Toolbar } from '@dreadnought/ui/react';
import { getCatalogDoc } from '../../data/catalog/getCatalogDoc';
import type { ComponentDoc } from './types';
import styles from '../DocsPage.module.css';

function Command({ value, label, disabled = false, own = false, onAction }: { value: string; label: string; disabled?: boolean; own?: boolean; onAction: (value: string) => void }) {
  const { itemProps } = useToolbarItem<HTMLButtonElement>({ value, disabled });
  return own ? <button {...itemProps} type="button" onClick={() => onAction(value)}>{label}</button>
    : <Button {...itemProps} size="compact" variant="secondary" disabled={disabled} onClick={() => onAction(value)}>{label}</Button>;
}

function ToolbarDemo() {
  const [action, setAction] = useState('—');
  return <div className={styles.demo}>
    <Toolbar aria-label="Действия документа">
      <Command value="save" label="Сохранить" onAction={setAction} />
      <Command value="copy" label="Копировать" onAction={setAction} />
      <Command value="download" label="Скачать" onAction={setAction} />
    </Toolbar>
    <p>Действие: {action}</p>
    <h3>Поля со своей клавиатурой</h3>
    <Toolbar navigation="native" aria-label="Фильтры документа">
      <Input aria-label="Поиск документов" placeholder="Поиск" />
      <Select aria-label="Статус документов" placeholder="Статус" options={[{ value: 'active', label: 'Активные' }, { value: 'archived', label: 'Архив' }]} />
      <Button size="compact" onClick={() => setAction('apply')}>Применить</Button>
    </Toolbar>
    <h3>Свой контрол, вертикальная панель и отключённый loop</h3>
    <Toolbar orientation="vertical" loop={false} aria-label="Дополнительные команды">
      <Command value="custom" label="Своя команда" own onAction={setAction} />
      <Command value="unavailable" label="Недоступно" disabled onAction={setAction} />
      <Command value="reset" label="Сбросить" onAction={setAction} />
    </Toolbar>
  </div>;
}

export const toolbarDoc: ComponentDoc = {
  ...getCatalogDoc('toolbar'),
  title: 'Toolbar',
  description: 'Панель из готовых или собственных контролов. Режим roving объединяет команды одной остановкой Tab; native сохраняет обычную клавиатуру полей.',
  adapterDescription: 'ToolbarAdapter предоставляет разметку и навигацию без оформления. Каждый участник roving явно подключается через useToolbarItem; обычные children автоматически не регистрируются. В native хук не нужен, а корень использует role="group".',
  logicDescription: <>useToolbarItem вызывается в отдельном дочернем компоненте внутри панели. Передавайте itemProps на настоящий фокусируемый узел, не на его визуальную обёртку. disabled исключает участника из навигации, но disabled или loading самого контрола нужно передать отдельно. Для собственного адаптера другого фреймворка доступны getToolbarState, getNavigationDirection и getNextEnabledValue из core.</>,
  footnote: <>Панели нужно доступное название: aria-label либо aria-labelledby. Стрелки соответствуют orientation; Home/End переходят к крайним доступным командам. Tab выходит из roving без перехвата. Для Input, Select и контролов с несколькими остановками Tab используйте native. RTL-навигация в первом контракте не поддерживается. Внешний вид контролов задаётся их собственными свойствами, отступы панели — токенами Toolbar.</>,
  demo: <ToolbarDemo />,
};
