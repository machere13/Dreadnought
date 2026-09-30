import { useEffect, useId, useMemo, useRef, useState } from 'react';
import { Button, TextArea } from '@dreadnought/ui/react';
import type { KnowledgeEntry } from '../knowledge/types.ts';
import { searchKnowledge } from '../knowledge/searchKnowledge.ts';
import { buildContext, parseAnswer, safeSourceUrl, validQuestion } from './context.ts';
import { createEngine, supportsWebGPU, type EngineSession } from './engine.ts';
import styles from './DocsAssistant.module.css';

type Phase = 'idle' | 'loading' | 'ready' | 'generating';
export function DocsAssistant({ entries, loading = false, error }: { entries: KnowledgeEntry[]; loading?: boolean; error?: string }) {
  const inputId = useId();
  const [question, setQuestion] = useState('');
  const [phase, setPhase] = useState<Phase>('idle');
  const [progress, setProgress] = useState(0);
  const [notice, setNotice] = useState('');
  const [answer, setAnswer] = useState<ReturnType<typeof parseAnswer>>(null);
  const [gpu, setGpu] = useState<boolean | null>(null);
  const session = useRef<EngineSession | null>(null);
  const epoch = useRef(0);
  const request = useRef(0);
  const pendingSources = useRef<KnowledgeEntry[]>([]);
  const hits = useMemo(() => loading || error ? [] : searchKnowledge(entries, question, 4), [entries, question, loading, error]);
  const context = useMemo(() => buildContext(hits), [hits]);
  const busy = phase === 'loading' || phase === 'generating';

  function dispose() {
    epoch.current += 1;
    request.current += 1;
    session.current?.dispose();
    session.current = null;
  }
  useEffect(() => { setGpu(supportsWebGPU()); return dispose; }, []);
  useEffect(() => {
    dispose(); setPhase('idle'); setAnswer(null); setNotice('');
  }, [entries, loading, error]);

  function changeQuestion(value: string) {
    request.current += 1;
    setQuestion(value); setAnswer(null); setNotice('');
    if (busy) { dispose(); setPhase('idle'); }
  }
  function cancel() {
    dispose(); setPhase('idle'); setAnswer(null);
    setNotice('Остановлено. Найденные источники остаются доступны.');
  }
  function loadModel() {
    if (!gpu || !context.sources.length || !validQuestion(question)) return;
    dispose();
    const currentEpoch = epoch.current;
    setPhase('loading'); setProgress(0); setNotice(''); setAnswer(null);
    try {
      session.current = createEngine((event) => {
        if (epoch.current !== currentEpoch) return;
        if (event.type === 'progress') setProgress(Math.round(Math.max(0, Math.min(1, event.progress)) * 100));
        if (event.type === 'ready') setPhase('ready');
        if (event.type === 'error') { dispose(); setPhase('idle'); setNotice(event.message); }
        if (event.type === 'answer' && event.id === request.current) {
          const result = parseAnswer(event.text, pendingSources.current);
          setAnswer(result); setPhase('ready');
          if (!result) setNotice('Ответ не содержит проверяемых ссылок на найденные источники. Используйте документацию ниже.');
        }
      });
    } catch { dispose(); setPhase('idle'); setNotice('Не удалось запустить модель. Источники доступны без неё.'); }
  }
  function generate() {
    if (phase !== 'ready' || !session.current || !context.sources.length || !validQuestion(question)) return;
    pendingSources.current = context.sources;
    setPhase('generating'); setAnswer(null); setNotice('');
    session.current.generate(++request.current, question.trim(), context.text);
  }

  return <section className={styles.panel} aria-label="Помощник документации">
    <div className={styles.heading}><h2>Спросить документацию</h2><span>Локальный AI · эксперимент</span></div>
    <p className={styles.muted}>Найдите пример или задайте вопрос об API. Источники доступны сразу.</p>
    <label htmlFor={inputId}>Ваш вопрос</label>
    <TextArea id={inputId} value={question} onChange={(event) => changeQuestion(event.target.value)} rows={2} maxLength={500} placeholder="Как показать пароль в Input?" />
    {question && !validQuestion(question) && <p role="status">Сократите вопрос примерно до 250 символов.</p>}
    {loading && <p role="status">Загружаем индекс документации…</p>}
    {error && <p role="status">{error}</p>}
    {!loading && !error && question.trim() && !hits.length && <p role="status">Подходящих сведений нет. Уточните компонент или свойство — без источников помощник не отвечает.</p>}
    {hits.length > 0 && <div className={styles.sources}><h3>Найдено в документации</h3><ul>{hits.map((hit) => <li key={hit.id}><a href={safeSourceUrl(hit.url)}>{hit.title}</a></li>)}</ul></div>}
    <p className={styles.muted}>Qwen3 1.7B: около 1 ГБ загрузки с Hugging Face и GitHub. Нужны WebGPU и примерно 2 ГБ свободной памяти GPU; запуск зависит от устройства. Вопрос обрабатывается в этой вкладке. Браузер может сохранить веса в кэше и позже удалить их.</p>
    {gpu === false && <p role="status">WebGPU недоступен. Поиск и ссылки работают без модели.</p>}
    <div className={styles.actions}>
      {phase === 'idle' && <Button size="compact" variant="secondary" onClick={loadModel} disabled={!gpu || !context.sources.length || !validQuestion(question)}>Загрузить модель · ≈1 ГБ</Button>}
      {phase === 'ready' && <><Button size="compact" onClick={generate} disabled={!context.sources.length || !validQuestion(question)}>Ответить по источникам</Button><Button size="compact" variant="ghosted" onClick={() => { dispose(); setPhase('idle'); }}>Освободить память</Button></>}
      {busy && <Button size="compact" variant="secondary" onClick={cancel}>Отменить</Button>}
    </div>
    <div role="status" aria-live="polite">
      {phase === 'loading' && <><p>Загрузка модели: {progress}%</p><progress value={progress} max={100} aria-label="Загрузка модели" /></>}
      {phase === 'ready' && !answer && !notice && <p>Модель готова. Можно получить ответ по найденным источникам.</p>}
      {phase === 'generating' && <><p>Готовим ответ… Это может занять несколько минут.</p><progress aria-label="Подготовка ответа" /></>}
      {notice && <p>{notice}</p>}
    </div>
    {answer && <div className={styles.answer}><h3>Ответ помощника</h3><p className={styles.answerText}>{answer.text}</p><p className={styles.muted}>Модель может ошибаться. Сверьте API и пример с источниками.</p><ul aria-label="Источники ответа">{answer.sources.map((source) => <li key={source.id}><a href={safeSourceUrl(source.url)}>{source.title}</a></li>)}</ul></div>}
  </section>;
}
