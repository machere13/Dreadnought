import { copy } from '@dreadnought/core';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';

type CopyStatus = 'idle' | 'pending' | 'copied' | 'error';
const feedbackDurationMs = 2000;

export function useCodeBlockCopy(
  code: string,
  onCopy?: (code: string) => void,
  onCopyError?: (error: unknown) => void,
) {
  const [result, setResult] = useState<{ generation: number; status: CopyStatus }>({ generation: 0, status: 'idle' });
  const current = useRef({ code, generation: 0, pending: false });
  const callbacks = useRef({ onCopy, onCopyError });
  useLayoutEffect(() => { callbacks.current = { onCopy, onCopyError }; }, [onCopy, onCopyError]);

  if (current.current.code !== code) {
    current.current = { code, generation: current.current.generation + 1, pending: false };
  }

  useEffect(() => () => {
    current.current.generation += 1;
    current.current.pending = false;
  }, []);

  const status = result.generation === current.current.generation ? result.status : 'idle';

  useEffect(() => {
    if (status !== 'copied' && status !== 'error') return;
    const generation = current.current.generation;
    const timer = setTimeout(() => {
      setResult((previous) => previous.generation === generation
        ? { generation, status: 'idle' }
        : previous);
    }, feedbackDurationMs);
    return () => clearTimeout(timer);
  }, [result.generation, status]);

  async function handleCopy() {
    if (current.current.pending) return;
    current.current.pending = true;
    const generation = current.current.generation;
    const copiedCode = code;
    setResult({ generation, status: 'pending' });

    try {
      await copy(copiedCode);
    } catch (error) {
      if (current.current.generation !== generation) return;
      current.current.pending = false;
      setResult({ generation, status: 'error' });
      callbacks.current.onCopyError?.(error);
      return;
    }

    if (current.current.generation !== generation) return;
    current.current.pending = false;
    setResult({ generation, status: 'copied' });
    callbacks.current.onCopy?.(copiedCode);
  }

  return { status, handleCopy };
}
