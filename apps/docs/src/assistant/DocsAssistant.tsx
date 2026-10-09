import { useEffect, useId, useMemo, useRef, useState } from 'react';
import { Button, FloatingPanel, TextArea } from '@dreadnought/ui/react';
import type { KnowledgeEntry } from '../knowledge/types.ts';
import {
  getConversationContext,
  parseAnswer,
  safeSourceUrl,
  validQuestion,
  type ConversationTurn,
} from './context.ts';
import { createEngine, supportsWebGPU, type EngineSession } from './engine.ts';
import styles from './DocsAssistant.module.css';
import { ApiFacts } from './ApiFacts.tsx';

type Phase = 'idle' | 'loading' | 'ready' | 'generating';
type Turn = ConversationTurn & { id: number };
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
  const [question, setQuestion] = useState('');
  const [phase, setPhase] = useState<Phase>('idle');
  const [progress, setProgress] = useState(0);
  const [notice, setNotice] = useState('');
  const [turns, setTurns] = useState<Turn[]>([]);
  const [gpu, setGpu] = useState<boolean | null>(null);
  const session = useRef<EngineSession | null>(null);
  const epoch = useRef(0);
  const request = useRef(0);
  const pendingSources = useRef<KnowledgeEntry[]>([]);
  const transcript = useRef<HTMLDivElement>(null);
  const currentQuestion = question.trim() || turns.at(-1)?.question || '';
  const context = useMemo(
    () =>
      getConversationContext(
        loading || error ? [] : entries,
        currentQuestion,
        question.trim() ? turns : turns.slice(0, -1),
      ),
    [entries, currentQuestion, question, turns, loading, error],
  );
  const hits = context.sources;
  const busy = phase === 'loading' || phase === 'generating';
  const lastTurn = turns.at(-1);
  const canRetry =
    phase === 'ready' && !!lastTurn && !lastTurn.answer && lastTurn.sources.length > 0;
  const canSubmit =
    !busy &&
    !loading &&
    !error &&
    validQuestion(currentQuestion) &&
    (!!question.trim() || canRetry);

  function dispose() {
    epoch.current += 1;
    request.current += 1;
    session.current?.dispose();
    session.current = null;
  }
  useEffect(() => {
    setGpu(supportsWebGPU());
    return dispose;
  }, []);
  useEffect(() => {
    dispose();
    setPhase('idle');
    setTurns([]);
    setNotice('');
  }, [entries, loading, error]);
  useEffect(() => {
    const body = transcript.current?.closest<HTMLElement>('[data-slot="body"]');
    if (body) body.scrollTop = body.scrollHeight;
  }, [turns, phase, notice]);

  function changeQuestion(value: string) {
    request.current += 1;
    setQuestion(value);
    setNotice('');
    if (busy) {
      dispose();
      setPhase('idle');
    }
  }
  function cancel() {
    dispose();
    setPhase('idle');
    setNotice('Остановлено. Найденные источники остаются доступны.');
  }
  function loadModel() {
    if (!gpu || !context.sources.length || !validQuestion(currentQuestion)) return;
    dispose();
    const currentEpoch = epoch.current;
    setPhase('loading');
    setProgress(0);
    setNotice('');
    try {
      session.current = createEngine((event) => {
        if (epoch.current !== currentEpoch) return;
        if (event.type === 'progress')
          setProgress(Math.round(Math.max(0, Math.min(1, event.progress)) * 100));
        if (event.type === 'ready') setPhase('ready');
        if (event.type === 'error') {
          dispose();
          setPhase('idle');
          setNotice(event.message);
        }
        if (event.type === 'answer' && event.id === request.current) {
          request.current += 1;
          const result = parseAnswer(event.text, pendingSources.current);
          setTurns((previous) =>
            previous.map((turn) => (turn.id === event.id ? { ...turn, answer: result } : turn)),
          );
          setPhase('ready');
          if (!result)
            setNotice(
              'Ответ не содержит проверяемых ссылок на найденные источники. Используйте документацию ниже.',
            );
        }
      });
    } catch {
      dispose();
      setPhase('idle');
      setNotice('Не удалось запустить модель. Источники доступны без неё.');
    }
  }
  function submitQuestion() {
    if (!canSubmit) return;
    const id = ++request.current;
    const turn: Turn = { id, question: currentQuestion, sources: context.sources, answer: null };
    setTurns((previous) =>
      !question.trim() ? [...previous.slice(0, -1), turn] : [...previous, turn],
    );
    setQuestion('');
    setNotice(
      context.sources.length
        ? ''
        : 'Подходящих сведений нет. Уточните компонент или свойство — без источников помощник не отвечает.',
    );
    if (phase !== 'ready' || !session.current || !context.sources.length) return;
    pendingSources.current = context.sources;
    setPhase('generating');
    session.current.generate(
      id,
      currentQuestion,
      context.text,
      context.history,
      context.sources.map((source) => source.id),
    );
  }

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
                disabled={!gpu || !context.sources.length || !validQuestion(currentQuestion)}
              >
                Загрузить модель · ≈1 ГБ
              </Button>
            )}
            {phase === 'ready' && (
              <Button
                size="compact"
                variant="ghosted"
                onClick={() => {
                  dispose();
                  setPhase('idle');
                }}
              >
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
                  <span className={styles.muted}>Вы</span>
                  <p>{turn.question}</p>
                </div>
                <div className={styles.answer}>
                  <span className={styles.muted}>Помощник</span>
                  {turn.answer ? (
                    <>
                      <p className={styles.answerText}>{turn.answer.text}</p>
                      <p className={styles.muted}>Сверьте ответ модели с источниками.</p>
                    </>
                  ) : (
                    <p>
                      {turn.sources.length
                        ? 'Найдено в документации'
                        : 'Подходящих сведений нет. Уточните вопрос.'}
                    </p>
                  )}
                  <ApiFacts sources={turn.sources} />
                  {turn.sources.length > 0 && (
                    <ul aria-label={turn.answer ? 'Источники ответа' : 'Найденные источники'}>
                      {(turn.answer?.sources ?? turn.sources).map((source) => (
                        <li key={source.id}>
                          <a href={safeSourceUrl(source.url)}>{source.title}</a>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
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
            rows={2}
            maxLength={500}
            placeholder="Как показать пароль в Input?"
          />
          {busy ? (
            <Button type="button" size="compact" variant="secondary" onClick={cancel}>
              Отменить
            </Button>
          ) : (
            <Button type="submit" size="compact" disabled={!canSubmit}>
              {phase === 'ready' ? 'Ответить по источникам' : 'Отправить вопрос'}
            </Button>
          )}
        </form>
      }
    >
      {(triggerProps) => <Button {...triggerProps}>Спросить документацию</Button>}
    </FloatingPanel>
  );
}
