import { useEffect, useId, useRef } from 'react';
import { Button, FloatingPanel, Icon, TextArea } from '@dreadnought/ui/react';
import type { KnowledgeEntry } from '../../../data/knowledge/types.ts';
import { safeSourceUrl, validQuestion } from '../context.ts';
import { useDocsAssistant } from '../useDocsAssistant.ts';
import { AssistantReply } from './AssistantReply.tsx';
import styles from './DocsAssistant.module.css';

export function DocsAssistant({
  entries,
  loading = false,
  error,
}: {
  entries: KnowledgeEntry[];
  loading?: boolean;
  error?: string;
}) {
  const inputId = useId();
  const transcript = useRef<HTMLDivElement>(null);
  const {
    question,
    phase,
    progress,
    notice,
    turns,
    gpu,
    hits,
    busy,
    currentQuestion,
    canSubmit,
    changeQuestion,
    cancel,
    loadModel,
    submitQuestion,
    releaseModel,
  } = useDocsAssistant({ entries, loading, error });
  useEffect(() => {
    const body = transcript.current?.closest<HTMLElement>('[data-slot="body"]');
    if (body) body.scrollTop = body.scrollHeight;
  }, [turns, phase, notice]);

  return (
    <FloatingPanel
      title="Помощник по документации"
      className={styles.panel}
      content={
        <>
          {question && !validQuestion(question) && (
            <p role="status">Сократите вопрос примерно до 250 символов.</p>
          )}
          {loading && <p role="status">Загружаем индекс документации…</p>}
          {error && <p role="status">{error}</p>}
          {!loading && !error && question.trim() && !hits.length && (
            <p role="status">
              Подходящих сведений нет. Уточните компонент или свойство — без источников помощник не
              отвечает.
            </p>
          )}
          {question.trim() && hits.length > 0 && (
            <div className={styles.sources}>
              <h3>Найдено в документации</h3>
              <ul>
                {hits.map((hit) => (
                  <li key={hit.id}>
                    <a href={safeSourceUrl(hit.url)}>{hit.title}</a>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {gpu === false && (
            <p role="status">WebGPU недоступен. Поиск и ссылки работают без модели.</p>
          )}
          <div className={styles.actions}>
            {phase === 'idle' && (
              <Button
                size="compact"
                variant="secondary"
                onClick={loadModel}
                disabled={!gpu || !hits.length || !validQuestion(currentQuestion)}
              >
                Загрузить модель · ≈1 ГБ
              </Button>
            )}
            {phase === 'ready' && (
              <Button size="compact" variant="ghosted" onClick={releaseModel}>
                Освободить память
              </Button>
            )}
          </div>
          <div role="status" aria-live="polite">
            {phase === 'loading' && (
              <>
                <p>Загрузка модели: {progress}%</p>
                <progress value={progress} max={100} aria-label="Загрузка модели" />
              </>
            )}
            {phase === 'ready' && !notice && (
              <p>Модель готова. Можно получить ответ по найденным источникам.</p>
            )}
            {phase === 'generating' && (
              <>
                <p>Готовим ответ… Это может занять несколько минут.</p>
                <progress aria-label="Подготовка ответа" />
              </>
            )}
            {notice && <p>{notice}</p>}
          </div>
          <div
            ref={transcript}
            className={styles.transcript}
            role="log"
            aria-label="Переписка с помощником"
            aria-live="polite"
            aria-relevant="additions text"
          >
            {turns.map((turn) => (
              <div key={turn.id} className={styles.turn}>
                <div className={styles.question}>
                  <span className={styles.inputLabel}>Вы</span>
                  <p>{turn.question}</p>
                </div>
                <AssistantReply turn={turn} />
              </div>
            ))}
          </div>
        </>
      }
      footer={
        <form
          className={styles.composer}
          onSubmit={(event) => {
            event.preventDefault();
            submitQuestion();
          }}
        >
          <label className={styles.inputLabel} htmlFor={inputId}>
            Ваш вопрос
          </label>
          <TextArea
            id={inputId}
            value={question}
            onChange={(event) => changeQuestion(event.target.value)}
            autoSize
            rows={1}
            maxRows={4}
            maxLength={500}
            placeholder="Как показать пароль в Input?"
          />
          {busy ? (
            <Button
              type="button"
              variant="secondary"
              onClick={cancel}
              aria-label="Отменить"
              icon={<Icon name="close" />}
            />
          ) : (
            <Button
              type="submit"
              disabled={!canSubmit}
              aria-label={phase === 'ready' ? 'Ответить по источникам' : 'Отправить вопрос'}
              icon={<Icon name="down" className={styles.sendIcon} />}
            />
          )}
        </form>
      }
    >
      {(triggerProps) => <Button {...triggerProps}>Спросить документацию</Button>}
    </FloatingPanel>
  );
}
