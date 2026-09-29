import { Icon } from '@dreadnought/ui/react';
import type { IconProps } from '@dreadnought/ui/react';
import type { ComponentDoc } from './types';
import styles from '../DocsPage.module.css';

const names: readonly IconProps['name'][] = [
  'eye', 'eye-off', 'search', 'copy', 'check', 'close',
  'down', 'menu', 'info-circle', 'check-circle', 'warning', 'close-circle',
];

function IconDemo() {
  return <div className={styles.demo}>
    <ul className={styles.specimenGrid} aria-label="Набор иконок">
      {names.map((name) => <li key={name} className={styles.specimen}>
        <Icon name={name} />
        <code>{name}</code>
      </li>)}
    </ul>
    <p className={styles.specimenNote}>Самостоятельная иконка с доступным именем: <Icon name="check" aria-label="Успешно" /></p>
  </div>;
}

export const iconDoc: ComponentDoc = {
  title: 'Icon',
  description: 'Иконка по стабильному имени. Набор графики можно заменить внутри библиотеки, не меняя имена в компонентах проекта.',
  readyCode: `import { Icon } from '@dreadnought/ui/react';

<Icon name="search" />
<Icon name="check" aria-label="Успешно" />`,
  adapterCode: `import { IconAdapter } from '@dreadnought/react/unstyled';

<IconAdapter className={styles.myIcon} aria-label="Поиск">
  <MySearchSvg />
</IconAdapter>`,
  adapterDescription: 'Адаптер принимает вашу графику. Без aria-label он скрывает её от скринридера; с подписью показывает как изображение.',
  apiRows: [
    ['name', 'eye | eye-off | search | copy | check | close | down | menu | info-circle | check-circle | warning | close-circle', '—', 'Имя графики из набора IconName'],
    ['aria-label', 'string', '—', 'Доступное имя самостоятельной иконки'],
    ['className', 'string', '—', 'Локальный класс для оформления'],
  ],
  footnote: <>Если иконка стоит рядом с понятным текстом, оставьте её декоративной. Для одной иконки без текста задайте <code>aria-label</code> самому элементу или доступное имя содержащей её кнопке.</>,
  demo: <IconDemo />,
};
