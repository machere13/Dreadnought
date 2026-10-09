import type { ConversationMessage } from './context.ts';

export type EngineEvent =
  | { type: 'progress'; progress: number }
  | { type: 'ready' }
  | { type: 'answer'; id: number; text: string }
  | { type: 'error'; message: string; diagnostic?: string };
export type EngineSession = {
  generate(
    id: number,
    question: string,
    context: string,
    history: ConversationMessage[],
    sourceIds: string[],
  ): void;
  dispose(): void;
};

export function supportsWebGPU() {
  return typeof navigator !== 'undefined' && 'gpu' in navigator;
}

/** Constructed only after the visitor explicitly consents to the model download. */
export function createEngine(onEvent: (event: EngineEvent) => void): EngineSession {
  const worker = new Worker(new URL('./model.worker.ts', import.meta.url), { type: 'module' });
  let disposed = false;
  worker.onmessage = (event: MessageEvent<EngineEvent>) => {
    if (disposed) return;
    if (event.data.type === 'error' && event.data.diagnostic)
      console.error('Documentation model:', event.data.diagnostic);
    onEvent(event.data);
  };
  worker.onerror = () => {
    if (!disposed)
      onEvent({
        type: 'error',
        message: 'Не удалось запустить модель. Проверьте WebGPU, доступную память и соединение.',
      });
  };
  worker.postMessage({ type: 'load' });
  return {
    generate(id, question, context, history, sourceIds) {
      if (!disposed)
        worker.postMessage({ type: 'generate', id, question, context, history, sourceIds });
    },
    // Termination also cancels fetches during loading and releases the GPU engine.
    dispose() {
      disposed = true;
      worker.terminate();
    },
  };
}
