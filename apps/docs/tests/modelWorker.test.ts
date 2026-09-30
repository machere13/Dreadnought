// @vitest-environment node
import { afterEach, expect, it, vi } from 'vitest';

const { complete } = vi.hoisted(() => ({ complete: vi.fn() }));
vi.mock('@mlc-ai/web-llm', () => ({ CreateMLCEngine: async () => ({ chat: { completions: { create: complete } } }) }));
afterEach(() => { vi.unstubAllGlobals(); vi.resetModules(); complete.mockReset(); });

it('provides a serialized JSON schema required by WebLLM 0.2.85 and delivers the answer', async () => {
  const events: unknown[] = [];
  const worker = { onmessage: undefined as undefined | ((event: { data: unknown }) => Promise<void>), postMessage: (event: unknown) => events.push(event) };
  vi.stubGlobal('self', worker);
  complete.mockImplementation(async (request) => {
    // 0.2.85 calls compileJSONSchema even for json_object without a schema.
    if (typeof request.response_format.schema !== 'string') throw new Error('Cannot pass non-string to std::string');
    const schema = JSON.parse(request.response_format.schema);
    expect(schema.required).toEqual(['answer', 'sources']);
    expect(schema.properties.sources.items.type).toBe('string');
    return { choices: [{ message: { content: '{"answer":"Use Input","sources":["catalog:input"]}' } }] };
  });
  await import('../src/assistant/model.worker.ts');
  await worker.onmessage!({ data: { type: 'load' } });
  await worker.onmessage!({ data: { type: 'generate', id: 7, question: 'Input?', context: 'Input docs' } });
  expect(events).toEqual([{ type: 'ready' }, { type: 'answer', id: 7, text: '{"answer":"Use Input","sources":["catalog:input"]}' }]);
});
