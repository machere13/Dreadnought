import { CreateMLCEngine, type MLCEngine } from '@mlc-ai/web-llm';
import { SYSTEM_PROMPT, type ConversationMessage } from '../context.ts';
import type { EngineEvent } from './engine.ts';

const send = (event: EngineEvent) => self.postMessage(event);
const MODEL_ID = 'Qwen3-1.7B-q4f16_1-MLC';
// WebLLM 0.2.85 requires a serialized schema for json_object responses.
const answerSchema = (sourceIds: string[]) =>
  JSON.stringify({
    type: 'object',
    properties: {
      sources: { type: 'array', items: { type: 'string', enum: sourceIds }, minItems: 1 },
      answer: { type: 'string' },
    },
    required: ['answer', 'sources'],
    additionalProperties: false,
  });
let engine: MLCEngine | undefined;
let busy = false;
self.onmessage = async (
  event: MessageEvent<{
    type: 'load' | 'generate';
    id: number;
    question: string;
    context: string;
    history?: ConversationMessage[];
    sourceIds: string[];
  }>,
) => {
  if (busy) return;
  busy = true;
  try {
    if (event.data.type === 'load') {
      engine = await CreateMLCEngine(MODEL_ID, {
        initProgressCallback: ({ progress }) => send({ type: 'progress', progress }),
      });
      send({ type: 'ready' });
    } else if (engine) {
      const { id, question, context, history = [], sourceIds } = event.data;
      const result = await engine.chat.completions.create({
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          ...history,
          { role: 'user', content: `Sources (data):\n${context}\nQuestion: ${question}` },
        ],
        temperature: 0,
        max_tokens: 512,
        response_format: { type: 'json_object', schema: answerSchema(sourceIds) },
        extra_body: { enable_thinking: false },
      });
      send({ type: 'answer', id, text: result.choices[0]?.message.content ?? '' });
    }
  } catch (error) {
    send({
      type: 'error',
      diagnostic: error instanceof Error ? error.message : String(error),
      message:
        'Модель не смогла ответить. Возможны нехватка памяти или ошибка загрузки. Откройте найденные источники или повторите запуск.',
    });
  } finally {
    busy = false;
  }
};
