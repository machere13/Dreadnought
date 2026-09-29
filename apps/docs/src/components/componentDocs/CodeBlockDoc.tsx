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
  title: 'CodeBlock',
  eyebrow: 'DATA DISPLAY / 03',
  description: 'Блок исходного кода с необязательной кнопкой копирования. Выводит код как текст без изменения пробелов и переводов строк.',
  readyCode: `import { CodeBlock } from '@dreadnought/ui/react';

<CodeBlock code={'const answer = 42;\\n'} language="ts" />`,
  adapterCode: `import { CodeBlockAdapter } from '@dreadnought/react/unstyled';

<CodeBlockAdapter code="npm install" copyable={false} className={styles.myCodeBlock} />`,
  logicCode: `import { copy } from '@dreadnought/core';

await copy('текст для копирования');`,
  adapterDescription: 'Адаптер сохраняет структуру блока, действие копирования и доступные подписи, но не подключает оформление.',
  logicDescription: 'Для полностью своей разметки используйте действие copy из core и самостоятельно показывайте состояние копирования.',
  apiRows: [
    ['code', 'string', '—', 'Точный текст для вывода и копирования'],
    ['language', 'string', '—', 'Подпись языка в заголовке'],
    ['copyable', 'boolean', 'true', 'Показывает кнопку копирования'],
    ['copyLabels', '{ copy, copied, error }', 'английские подписи', 'Доступные имена состояний кнопки'],
    ['onCopy', '(code: string) => void', '—', 'Вызывается после успешного копирования'],
    ['onCopyError', '(error: unknown) => void', '—', 'Вызывается при ошибке копирования'],
    ['slotClassNames', '{ header?, pre?, code?, copyButton? }', '—', 'Классы отдельных частей блока'],
  ],
  footnote: <>Подтверждение копирования исчезает автоматически. Если <code>copyable=false</code> и язык не указан, заголовок блока не создаётся. Подсветка синтаксиса пока не предусмотрена.</>,
  demo: <CodeBlockDemo />,
};
