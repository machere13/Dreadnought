import { ComponentPage } from '../../../shared/ComponentPage.tsx';
import { getCatalogDoc } from '../../../data/catalog/getCatalogDoc';
import type { ComponentDoc } from '../../../shared/types.ts';
import { CodeBlockCopyDemo } from './CodeBlockCopyDemo.tsx';
import copyCode from './CodeBlockCopyDemo.tsx?raw';
import { CodeBlockDisplayDemo } from './CodeBlockDisplayDemo.tsx';
import displayCode from './CodeBlockDisplayDemo.tsx?raw';

export const codeBlockDoc: ComponentDoc = {
  ...getCatalogDoc('codeblock'),
  title: 'CodeBlock',
  usage:
    'Для исходного кода, команды или конфигурации, которую нужно прочитать и скопировать. Для редактирования текста используйте TextArea или MarkdownEditor.',
  primaryProps: ['code', 'language', 'copyable', 'onCopy', 'onCopyError'],
  description: 'Исходный код с сохранением форматирования и кнопкой копирования.',
  adapterDescription:
    'Адаптер сохраняет структуру блока, действие копирования и доступные подписи, но не подключает оформление.',
  logicDescription:
    'Для полностью своей разметки используйте действие copy из core и самостоятельно показывайте состояние копирования.',
  notes: [
    <>Подтверждение копирования исчезает автоматически.</>,
    <>
      Если <code>copyable=false</code> и язык не указан, заголовок блока не создаётся.
    </>,
    <>Подсветка синтаксиса пока не предусмотрена.</>,
  ],
  examples: [
    {
      id: 'codeblock-copy',
      title: 'Копирование и обработка ошибки',
      description:
        'Нажмите значок копирования — в буфер попадёт код с переводами строк. Подтверждение исчезнет автоматически. При ошибке доступа к буферу пример покажет сообщение; успешная повторная попытка его уберёт.',
      demo: <CodeBlockCopyDemo />,
      code: copyCode,
    },
    {
      id: 'codeblock-display',
      title: 'Текст без кнопки копирования',
      description:
        'copyable={false} скрывает кнопку. language="python" оставляет подпись языка; без language исчезает и шапка. Отступы и переводы строк сохраняются, но код не выполняется и не подсвечивается.',
      demo: <CodeBlockDisplayDemo />,
      code: displayCode,
    },
  ],
};

export function CodeBlockPage() {
  return <ComponentPage component="codeblock" doc={codeBlockDoc} />;
}
