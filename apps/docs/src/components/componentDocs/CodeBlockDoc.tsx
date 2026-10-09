import { getCatalogDoc } from '../../data/catalog/getCatalogDoc';
import { CodeBlock } from '@dreadnought/ui/react';
import type { ComponentDoc } from './types';
import styles from '../DocsPage.module.css';

function CodeBlockDemo() {
  return <div className={`${styles.demo} ${styles.codeBlockDemo}`}>
    <CodeBlock code={'const answer = 42;\n'} language="ts" copyLabels={{ copy: 'Копировать пример', copied: 'Пример скопирован', error: 'Не удалось скопировать пример' }} />
    <CodeBlock code="npm install @dreadnought/ui" copyable={false} />
  </div>;
}

export const codeBlockDoc: ComponentDoc = {
  ...getCatalogDoc('codeblock'),
  title: 'CodeBlock',
  description: 'Блок исходного кода с необязательной кнопкой копирования. Выводит код как текст без изменения пробелов и переводов строк.',
  adapterDescription: 'Адаптер сохраняет структуру блока, действие копирования и доступные подписи, но не подключает оформление.',
  logicDescription: 'Для полностью своей разметки используйте действие copy из core и самостоятельно показывайте состояние копирования.',
  footnote: <>Подтверждение копирования исчезает автоматически. Если <code>copyable=false</code> и язык не указан, заголовок блока не создаётся. Подсветка синтаксиса пока не предусмотрена.</>,
  demo: <CodeBlockDemo />,
};
