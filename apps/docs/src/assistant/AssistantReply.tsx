import { CodeBlock } from '@dreadnought/ui/react';
import { ApiFacts } from './ApiFacts.tsx';
import { safeSourceUrl, type ConversationTurn } from './context.ts';
import styles from './DocsAssistant.module.css';

export function AssistantReply({ turn }: { turn: ConversationTurn }) {
  const example = turn.sources.find(source =>
    source.id.includes(':react-ui:example:') && source.code.length,
  ) ?? turn.sources.find(source => source.code.length);
  return (
    <div className={styles.answer}>
      <span className={styles.muted}>Помощник</span>
      <p className={styles.answerText}>
        {turn.answer?.text ?? (turn.sources.length
          ? 'Нашёл пример в документации.'
          : 'Подходящих сведений нет. Уточните вопрос.')}
      </p>
      {example && (
        <CodeBlock
          code={example.code.join('\n\n')}
          copyLabels={{
            copy: 'Копировать пример',
            copied: 'Пример скопирован',
            error: 'Не удалось скопировать пример',
          }}
        />
      )}
      <ApiFacts sources={turn.sources} />
      {turn.answer && <p className={styles.muted}>Ответ модели — сверьте с источниками.</p>}
      {turn.sources.length > 0 && (
        <ul
          className={styles.sourceLinks}
          aria-label={turn.answer ? 'Источники ответа' : 'Найденные источники'}
        >
          {(turn.answer?.sources ?? turn.sources).map((source, index) => (
            <li key={source.id}>
              <a href={safeSourceUrl(source.url)} aria-label={source.title} title={source.title}>
                Источник {index + 1}
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
