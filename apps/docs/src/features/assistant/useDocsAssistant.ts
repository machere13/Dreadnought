import { useEffect, useMemo, useRef, useState } from 'react';
import type { KnowledgeEntry } from '../../data/knowledge/types.ts';
import {
  getConversationContext,
  parseAnswer,
  validQuestion,
  type ConversationTurn,
} from './context.ts';
import { createEngine, supportsWebGPU, type EngineSession } from './model/engine.ts';

type Phase = 'idle' | 'loading' | 'ready' | 'generating';
type Turn = ConversationTurn & { id: number };
export function useDocsAssistant({
  entries,
  loading = false,
  error,
}: {
  entries: KnowledgeEntry[];
  loading?: boolean;
  error?: string;
}) {
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

  function releaseModel() {
    dispose();
    setPhase('idle');
  }

  return {
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
  };
}
