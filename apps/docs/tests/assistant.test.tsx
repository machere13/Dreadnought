import { act, cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { DocsAssistant } from '../src/assistant/DocsAssistant.tsx';
import {
  buildContext,
  getConversationContext,
  parseAnswer,
  safeSourceUrl,
} from '../src/assistant/context.ts';
import type { EngineEvent } from '../src/assistant/engine.ts';
import type { KnowledgeEntry } from '../src/data/knowledge/types.ts';
const { searchKnowledge: searchEntries } = await vi.importActual<typeof import('../src/data/knowledge/search.ts')>('../src/data/knowledge/search.ts');

const mocked = vi.hoisted(() => ({ create: vi.fn(), gpu: vi.fn(), search: vi.fn() }));
vi.mock('../src/assistant/engine.ts', () => ({
  createEngine: mocked.create,
  supportsWebGPU: mocked.gpu,
}));
vi.mock('../src/data/knowledge/search.ts', () => ({ searchKnowledge: mocked.search }));
const entry: KnowledgeEntry = {
  id: 'catalog:input',
  sourceId: 'catalog:input',
  sourceKind: 'catalog',
  title: 'Input: пароль',
  url: '/components/input/#api',
  text: 'Input с type=password показывает переключатель видимости.',
  code: ['<Input type="password" />'],
};
const entries = [entry];
let listener: (event: EngineEvent) => void;
let generate: ReturnType<typeof vi.fn>;
let dispose: ReturnType<typeof vi.fn>;
beforeEach(() => {
  mocked.gpu.mockReturnValue(true);
  mocked.search.mockImplementation((_entries, question) => (question ? entries : []));
  generate = vi.fn();
  dispose = vi.fn();
  mocked.create.mockImplementation((callback) => {
    listener = callback;
    return { generate, dispose };
  });
});
afterEach(() => {
  cleanup();
  vi.clearAllMocks();
  vi.unstubAllGlobals();
});
const ask = () => {
  if (!screen.queryByRole('textbox', { name: 'Ваш вопрос' })) {
    fireEvent.click(screen.getByRole('button', { name: 'Спросить документацию' }));
  }
  fireEvent.change(screen.getByRole('textbox', { name: 'Ваш вопрос' }), {
    target: { value: 'Input пароль' },
  });
};
const load = () => fireEvent.click(screen.getByRole('button', { name: /Загрузить модель/ }));
const ready = () => act(() => listener({ type: 'ready' }));
const answer = (id: number, sources = ['catalog:input']) =>
  act(() =>
    listener({
      type: 'answer',
      id,
      text: JSON.stringify({ answer: 'Используйте type=password.', sources }),
    }),
  );

describe('documentation assistant', () => {
  it('lets a reader copy the complete catalog example from the assistant reply without loading a model', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    vi.stubGlobal('navigator', { clipboard: { writeText } });
    const example = {
      ...entry, id: 'catalog:component:input:react-ui:example:basic', title: 'Input · пример пароля',
      code: ['import { Input } from \'@dreadnought/ui/react\';\n<Input type="password" />'],
    };
    mocked.search.mockReturnValue([entry, example]);
    render(<DocsAssistant entries={[entry, example]} />);
    ask();
    fireEvent.click(screen.getByRole('button', { name: 'Отправить вопрос' }));
    const log = screen.getByRole('log');
    await act(async () => {
      fireEvent.click(within(log).getByRole('button', { name: 'Копировать пример' }));
    });
    expect(writeText).toHaveBeenCalledWith(
      'import { Input } from \'@dreadnought/ui/react\';\n<Input type="password" />',
    );
    expect(within(log).getByRole('button', { name: 'Пример скопирован' })).toBeTruthy();
    expect(within(log).getByRole('link', { name: example.title }).getAttribute('href')).toBe(entry.url);
  });
  it('shows catalog facts once without a model and preserves them beside an incorrect model answer', () => {
    const facts = {
      ...entry,
      apiSummary: 'Обязательные пропсы: нет.\nПо умолчанию: не указано в каталоге.',
    };
    const duplicate = { ...facts, id: 'catalog:input:example:second' };
    mocked.search.mockReturnValue([facts, duplicate]);
    render(<DocsAssistant entries={[facts, duplicate]} />);
    ask();
    fireEvent.click(screen.getByRole('button', { name: 'Отправить вопрос' }));
    const log = screen.getByRole('log');
    expect(within(log).getAllByText(/Обязательные пропсы: нет/)).toHaveLength(1);
    expect(mocked.create).not.toHaveBeenCalled();
    load();
    ready();
    fireEvent.click(screen.getByRole('button', { name: 'Ответить по источникам' }));
    act(() => listener({
      type: 'answer', id: generate.mock.calls[0][0],
      text: JSON.stringify({ answer: 'Все пропсы обязательны.', sources: ['catalog:input'] }),
    }));
    expect(within(log).getByText('Все пропсы обязательны.')).toBeTruthy();
    expect(within(log).getAllByText(/Обязательные пропсы: нет/)).toHaveLength(1);
    expect(within(log).getByRole('link', { name: 'Проверить API' }).getAttribute('href')).toBe(entry.url);
  });
  it('passes grounded history to the model and cites newly retrieved follow-up evidence', () => {
    mocked.search.mockImplementation(searchEntries);
    const disabled = {
      ...entry,
      id: 'catalog:input:disabled',
      title: 'Input disabled',
      text: 'Input disabled: boolean',
      code: ['<Input disabled />'],
    };
    render(<DocsAssistant entries={[entry, disabled]} />);
    ask();
    load();
    ready();
    fireEvent.click(screen.getByRole('button', { name: 'Ответить по источникам' }));
    answer(generate.mock.calls[0][0]);
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'а как отключить его?' } });
    fireEvent.click(screen.getByRole('button', { name: 'Ответить по источникам' }));
    const [id, question, context, history] = generate.mock.calls[1];
    expect(question).toBe('а как отключить его?');
    expect(context).toContain('<Input disabled />');
    expect(history).toEqual([
      { role: 'user', content: 'Input пароль' },
      { role: 'assistant', content: 'Используйте type=password.' },
    ]);
    act(() =>
      listener({
        type: 'answer',
        id,
        text: JSON.stringify({ answer: 'Задайте disabled.', sources: [disabled.id] }),
      }),
    );
    expect(screen.getByText('Задайте disabled.')).toBeTruthy();
    expect(
      within(screen.getAllByRole('list', { name: 'Источники ответа' }).at(-1)!)
        .getByRole('link', { name: disabled.title })
        .getAttribute('href'),
    ).toBe(disabled.url);
  });
  it('keeps the conversation and draft when the floating chat is closed', () => {
    mocked.gpu.mockReturnValue(false);
    render(<DocsAssistant entries={entries} />);
    expect(screen.queryByRole('textbox')).toBeNull();
    ask();
    fireEvent.click(screen.getByRole('button', { name: 'Отправить вопрос' }));
    expect(screen.getByRole('log').textContent).toContain('Input пароль');
    expect((screen.getByRole('textbox') as HTMLTextAreaElement).value).toBe('');
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'Черновик' } });
    fireEvent.click(screen.getByRole('button', { name: 'Закрыть панель' }));
    expect(screen.queryByRole('log')).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: 'Спросить документацию' }));
    expect((screen.getByRole('textbox') as HTMLTextAreaElement).value).toBe('Черновик');
    expect(screen.getByRole('log').textContent).toContain('Input пароль');
    expect(mocked.create).not.toHaveBeenCalled();
  });
  it('retains previous answers and ignores an old answer during the next request', () => {
    render(<DocsAssistant entries={entries} />);
    ask();
    load();
    ready();
    fireEvent.click(screen.getByRole('button', { name: 'Ответить по источникам' }));
    const first = generate.mock.calls[0][0];
    answer(first);
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'Input disabled' } });
    fireEvent.click(screen.getByRole('button', { name: 'Ответить по источникам' }));
    const second = generate.mock.calls[1][0];
    act(() =>
      listener({
        type: 'answer',
        id: first,
        text: JSON.stringify({ answer: 'Устаревший ответ', sources: [entry.id] }),
      }),
    );
    act(() =>
      listener({
        type: 'answer',
        id: second,
        text: JSON.stringify({ answer: 'Используйте disabled.', sources: [entry.id] }),
      }),
    );
    const log = screen.getByRole('log');
    expect(log.textContent).toContain('Input пароль');
    expect(log.textContent).toContain('Input disabled');
    expect(log.textContent).toContain('Используйте type=password.');
    expect(log.textContent).toContain('Используйте disabled.');
    expect(log.textContent).not.toContain('Устаревший ответ');
  });
  it('shows sources before consent and generates only after explicit actions', () => {
    render(<DocsAssistant entries={entries} />);
    ask();
    expect(screen.getByRole('link', { name: entry.title }).getAttribute('href')).toBe(entry.url);
    expect(mocked.create).not.toHaveBeenCalled();
    load();
    expect(mocked.create).toHaveBeenCalledTimes(1);
    act(() => listener({ type: 'progress', progress: 0.35 }));
    expect(screen.getByRole('progressbar').getAttribute('value')).toBe('35');
    ready();
    expect(generate).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: 'Ответить по источникам' }));
    answer(generate.mock.calls[0][0]);
    expect(screen.getByText('Используйте type=password.')).toBeTruthy();
    expect(
      within(screen.getByRole('list', { name: 'Источники ответа' })).getAllByRole('link'),
    ).toHaveLength(1);
  });
  it('cancels model loading and ignores late ready events', () => {
    render(<DocsAssistant entries={entries} />);
    ask();
    load();
    const footer = screen.getByRole('dialog').querySelector('[data-slot="footer"]')!;
    fireEvent.click(within(footer as HTMLElement).getByRole('button', { name: 'Отменить' }));
    ready();
    expect(dispose).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole('button', { name: 'Ответить по источникам' })).toBeNull();
    expect(screen.getByRole('link', { name: entry.title })).toBeTruthy();
  });
  it('cancels generation and discards late answers after changing the question', () => {
    render(<DocsAssistant entries={entries} />);
    ask();
    load();
    ready();
    fireEvent.click(screen.getByRole('button', { name: 'Ответить по источникам' }));
    const id = generate.mock.calls[0][0];
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'Button' } });
    answer(id);
    expect(dispose).toHaveBeenCalledTimes(1);
    expect(screen.queryByText('Используйте type=password.')).toBeNull();
  });
  it('keeps search available without WebGPU and never constructs an engine', () => {
    mocked.gpu.mockReturnValue(false);
    render(<DocsAssistant entries={entries} />);
    ask();
    load();
    expect(mocked.create).not.toHaveBeenCalled();
    expect(screen.getByText(/WebGPU недоступен/)).toBeTruthy();
    expect(screen.getByRole('link', { name: entry.title })).toBeTruthy();
  });
  it('does not load or answer when retrieval has no supporting evidence', () => {
    mocked.search.mockReturnValue([]);
    render(<DocsAssistant entries={entries} />);
    ask();
    load();
    expect(mocked.create).not.toHaveBeenCalled();
    expect(screen.getByText(/Подходящих сведений нет/)).toBeTruthy();
  });
  it('rejects invented citations and retains real source links on engine failure', () => {
    render(<DocsAssistant entries={entries} />);
    ask();
    load();
    ready();
    fireEvent.click(screen.getByRole('button', { name: 'Ответить по источникам' }));
    answer(generate.mock.calls[0][0], ['catalog:invented']);
    expect(screen.queryByText('Используйте type=password.')).toBeNull();
    expect(screen.getByText(/не содержит проверяемых ссылок/)).toBeTruthy();
    act(() => listener({ type: 'error', message: 'Недостаточно памяти' }));
    expect(screen.getByText('Недостаточно памяти')).toBeTruthy();
    expect(screen.getByRole('link', { name: entry.title })).toBeTruthy();
  });
  it('cancels generation on explicit cancel and releases the worker on unmount', () => {
    const view = render(<DocsAssistant entries={entries} />);
    ask();
    load();
    ready();
    fireEvent.click(screen.getByRole('button', { name: 'Ответить по источникам' }));
    const id = generate.mock.calls[0][0];
    fireEvent.click(screen.getByRole('button', { name: 'Отменить' }));
    answer(id);
    expect(screen.queryByText('Используйте type=password.')).toBeNull();
    load();
    view.unmount();
    expect(dispose).toHaveBeenCalledTimes(2);
  });
});

describe('grounding boundaries', () => {
  it('resolves a guide follow-up against the component API, not an incidental guide', () => {
    mocked.search.mockImplementation(searchEntries);
    const overview: KnowledgeEntry = {
      ...entry,
      id: 'guide:input:overview',
      sourceId: 'guide:input',
      sourceKind: 'guide',
    };
    const disabled = {
      ...entry,
      id: 'catalog:input:disabled',
      title: 'Input disabled',
      text: 'disabled: boolean',
      code: ['<Input disabled />'],
    };
    const unrelated: KnowledgeEntry = {
      ...disabled,
      id: 'guide:custom:disabled',
      sourceId: 'guide:custom',
      sourceKind: 'guide',
      url: '/custom-components/',
      title: 'disabled',
    };
    const result = getConversationContext(
      [overview, disabled, unrelated],
      'а как отключить его?',
      [{ question: 'Input пароль', sources: [overview, unrelated], answer: null }],
    );
    expect(result.sources.map((source) => source.id)).toEqual([disabled.id]);
    expect(result.history).toEqual([{ role: 'user', content: 'Input пароль' }]);
  });
  it('finds fresh evidence for a follow-up in the previous component, not an unrelated one', () => {
    mocked.search.mockImplementation(searchEntries);
    const disabled = {
      ...entry,
      id: 'catalog:input:disabled',
      title: 'Input disabled',
      text: 'Input disabled: boolean',
      code: ['<Input disabled />'],
    };
    const button = {
      ...disabled,
      id: 'catalog:button:disabled',
      sourceId: 'catalog:button',
      title: 'Button disabled',
      url: '/components/button/#api',
      code: ['<Button disabled />'],
    };
    const history = [
      {
        question: 'Input пароль',
        sources: entries,
        answer: { text: 'Используйте type=password.', sources: entries },
      },
    ];
    const result = getConversationContext(
      [entry, disabled, button],
      'а как отключить его?',
      history,
    );
    expect(result.sources.map((source) => source.id)).toEqual(['catalog:input:disabled']);
    expect(result.history).toEqual([
      { role: 'user', content: 'Input пароль' },
      { role: 'assistant', content: 'Используйте type=password.' },
    ]);
    expect(result.text).toContain('<Input disabled />');
    expect(
      parseAnswer(JSON.stringify({ answer: 'disabled', sources: [entry.id] }), result.sources),
    ).toBeNull();
    expect(
      getConversationContext([entry, disabled, button], 'а как отключить его?', []).sources,
    ).toEqual([]);
    expect(
      getConversationContext([entry, disabled, button], 'а как включить биометрию в нём?', history)
        .sources,
    ).toEqual([]);
  });
  it('drops the old topic and bounds history independently of source examples', () => {
    mocked.search.mockImplementation(searchEntries);
    const button = {
      ...entry,
      id: 'catalog:button:disabled',
      sourceId: 'catalog:button',
      title: 'Button disabled',
      url: '/components/button/#api',
      text: 'Button disabled: boolean',
      code: ['<Button disabled />'],
    };
    const old = {
      question: 'Input пароль',
      sources: entries,
      answer: { text: 'Пароль', sources: entries },
    };
    expect(getConversationContext([entry, button], 'Button disabled', [old]).history).toEqual([]);
    const recent = Array.from({ length: 20 }, (_, index) => ({
      ...old,
      question: `Input ${index}`,
      answer: { text: 'я'.repeat(10000), sources: entries },
    }));
    const result = getConversationContext(entries, 'Input пароль', recent);
    expect(result.history.map((message) => message.content).join(' ')).not.toContain('Input 0');
    expect(result.history.some((message) => message.content === 'Input 19')).toBe(true);
    expect(
      new TextEncoder().encode(result.text).length +
        new TextEncoder().encode(JSON.stringify(result.history)).length,
    ).toBeLessThanOrEqual(3600);
    expect(result.text).toContain('<Input type="password" />');
  });
  it('accepts the empty Qwen thinking header but rejects nonempty reasoning or invalid citations', () => {
    const response = JSON.stringify({ answer: 'API', sources: [entry.id] });
    expect(parseAnswer(`<think>\n\n</think>\n\n${response}`, entries)?.text).toBe('API');
    expect(parseAnswer(`<think>private reasoning</think>${response}`, entries)).toBeNull();
    expect(
      parseAnswer('<think></think>{"answer":"API","sources":["invented"]}', entries),
    ).toBeNull();
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
    expect(
      parseAnswer(JSON.stringify({ answer: 'API', sources: [entry.id] }), entries)?.sources,
    ).toEqual(entries);
    expect(safeSourceUrl('javascript:alert(1)')).toBeUndefined();
    expect(safeSourceUrl('//example.com')).toBeUndefined();
  });
});
