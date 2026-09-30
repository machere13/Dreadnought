import { act, cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { DocsAssistant } from '../src/assistant/DocsAssistant.tsx';
import { buildContext, parseAnswer, safeSourceUrl } from '../src/assistant/context.ts';
import type { EngineEvent } from '../src/assistant/engine.ts';
import type { KnowledgeEntry } from '../src/knowledge/types.ts';

const mocked = vi.hoisted(() => ({ create: vi.fn(), gpu: vi.fn(), search: vi.fn() }));
vi.mock('../src/assistant/engine.ts', () => ({ createEngine: mocked.create, supportsWebGPU: mocked.gpu }));
vi.mock('../src/knowledge/searchKnowledge.ts', () => ({ searchKnowledge: mocked.search }));
const entry: KnowledgeEntry = { id: 'catalog:input', sourceId: 'catalog:input', sourceKind: 'catalog', title: 'Input: пароль', url: '/components/input/#api', text: 'Input с type=password показывает переключатель видимости.', code: ['<Input type="password" />'] };
const entries = [entry];
let listener: (event: EngineEvent) => void;
let generate: ReturnType<typeof vi.fn>;
let dispose: ReturnType<typeof vi.fn>;
beforeEach(() => {
  mocked.gpu.mockReturnValue(true);
  mocked.search.mockImplementation((_entries, question) => question ? entries : []);
  generate = vi.fn(); dispose = vi.fn();
  mocked.create.mockImplementation((callback) => { listener = callback; return { generate, dispose }; });
});
afterEach(() => { cleanup(); vi.clearAllMocks(); });
const ask = () => fireEvent.change(screen.getByRole('textbox', { name: 'Ваш вопрос' }), { target: { value: 'Input пароль' } });
const load = () => fireEvent.click(screen.getByRole('button', { name: /Загрузить модель/ }));
const ready = () => act(() => listener({ type: 'ready' }));
const answer = (id: number, sources = ['catalog:input']) => act(() => listener({ type: 'answer', id, text: JSON.stringify({ answer: 'Используйте type=password.', sources }) }));

describe('documentation assistant', () => {
  it('shows sources before consent and generates only after explicit actions', () => {
    render(<DocsAssistant entries={entries} />); ask();
    expect(screen.getByRole('link', { name: entry.title }).getAttribute('href')).toBe(entry.url);
    expect(mocked.create).not.toHaveBeenCalled();
    load(); expect(mocked.create).toHaveBeenCalledTimes(1);
    act(() => listener({ type: 'progress', progress: 0.35 }));
    expect(screen.getByRole('progressbar').getAttribute('value')).toBe('35');
    ready(); expect(generate).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: 'Ответить по источникам' }));
    answer(generate.mock.calls[0][0]);
    expect(screen.getByText('Используйте type=password.')).toBeTruthy();
    expect(within(screen.getByRole('list', { name: 'Источники ответа' })).getAllByRole('link')).toHaveLength(1);
  });
  it('cancels model loading and ignores late ready events', () => {
    render(<DocsAssistant entries={entries} />); ask(); load();
    fireEvent.click(screen.getByRole('button', { name: 'Отменить' })); ready();
    expect(dispose).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole('button', { name: 'Ответить по источникам' })).toBeNull();
    expect(screen.getByRole('link', { name: entry.title })).toBeTruthy();
  });
  it('cancels generation and discards late answers after changing the question', () => {
    render(<DocsAssistant entries={entries} />); ask(); load(); ready();
    fireEvent.click(screen.getByRole('button', { name: 'Ответить по источникам' }));
    const id = generate.mock.calls[0][0];
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'Button' } });
    answer(id);
    expect(dispose).toHaveBeenCalledTimes(1);
    expect(screen.queryByText('Используйте type=password.')).toBeNull();
  });
  it('keeps search available without WebGPU and never constructs an engine', () => {
    mocked.gpu.mockReturnValue(false);
    render(<DocsAssistant entries={entries} />); ask(); load();
    expect(mocked.create).not.toHaveBeenCalled();
    expect(screen.getByText(/WebGPU недоступен/)).toBeTruthy();
    expect(screen.getByRole('link', { name: entry.title })).toBeTruthy();
  });
  it('does not load or answer when retrieval has no supporting evidence', () => {
    mocked.search.mockReturnValue([]);
    render(<DocsAssistant entries={entries} />); ask(); load();
    expect(mocked.create).not.toHaveBeenCalled();
    expect(screen.getByText(/Подходящих сведений нет/)).toBeTruthy();
  });
  it('rejects invented citations and retains real source links on engine failure', () => {
    render(<DocsAssistant entries={entries} />); ask(); load(); ready();
    fireEvent.click(screen.getByRole('button', { name: 'Ответить по источникам' }));
    answer(generate.mock.calls[0][0], ['catalog:invented']);
    expect(screen.queryByText('Используйте type=password.')).toBeNull();
    expect(screen.getByText(/не содержит проверяемых ссылок/)).toBeTruthy();
    act(() => listener({ type: 'error', message: 'Недостаточно памяти' }));
    expect(screen.getByText('Недостаточно памяти')).toBeTruthy();
    expect(screen.getByRole('link', { name: entry.title })).toBeTruthy();
  });
  it('cancels generation on explicit cancel and releases the worker on unmount', () => {
    const view = render(<DocsAssistant entries={entries} />); ask(); load(); ready();
    fireEvent.click(screen.getByRole('button', { name: 'Ответить по источникам' }));
    const id = generate.mock.calls[0][0];
    fireEvent.click(screen.getByRole('button', { name: 'Отменить' })); answer(id);
    expect(screen.queryByText('Используйте type=password.')).toBeNull();
    load(); view.unmount(); expect(dispose).toHaveBeenCalledTimes(2);
  });
});

describe('grounding boundaries', () => {
  it('accepts the empty Qwen thinking header but rejects nonempty reasoning or invalid citations', () => {
    const response = JSON.stringify({ answer: 'API', sources: [entry.id] });
    expect(parseAnswer(`<think>\n\n</think>\n\n${response}`, entries)?.text).toBe('API');
    expect(parseAnswer(`<think>private reasoning</think>${response}`, entries)).toBeNull();
    expect(parseAnswer('<think></think>{"answer":"API","sources":["invented"]}', entries)).toBeNull();
  });
  it('bounds context without cutting a code example', () => {
    const huge = '<Input ' + 'x'.repeat(4000) + ' />';
    const context = buildContext([{ ...entry, code: [huge, '<Input />'] }], 300);
    expect(new TextEncoder().encode(context.text).length).toBeLessThanOrEqual(300);
    expect(context.text).not.toContain('xxxx');
    expect(context.text).toContain('<Input />');
  });
  it('requires at least one known citation and rejects mixed unknown citations', () => {
    for (const sources of [[], ['catalog:unknown'], [entry.id, 'catalog:unknown']]) {
      expect(parseAnswer(JSON.stringify({ answer: 'API', sources }), entries)).toBeNull();
    }
    expect(parseAnswer('<script>alert(1)</script>', entries)).toBeNull();
    expect(parseAnswer(JSON.stringify({ answer: 'API', sources: [entry.id] }), entries)?.sources).toEqual(entries);
    expect(safeSourceUrl('javascript:alert(1)')).toBeUndefined();
    expect(safeSourceUrl('//example.com')).toBeUndefined();
  });
});
