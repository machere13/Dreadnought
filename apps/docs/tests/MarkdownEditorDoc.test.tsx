import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, expect, it } from 'vitest';
import { markdownEditorDoc } from '../src/content/components/Fields/MarkdownEditor/MarkdownEditorDoc.tsx';

afterEach(cleanup);

it('pairs all editor scenarios with their complete runnable source', () => {
  expect(markdownEditorDoc.examples).toHaveLength(6);
  for (const example of markdownEditorDoc.examples!) {
    const name = (example.demo as { type: { name: string } }).type.name;
    expect(example.code).toBe(
      readFileSync(resolve('apps/docs/src/content/components/Fields', markdownEditorDoc.title, `${name}.tsx`), 'utf8'),
    );
    expect(example.code).not.toMatch(/from ['"]\./);
  }
});

it('formats the selected text and accepts the controlled value synchronously', async () => {
  const user = userEvent.setup();
  render(markdownEditorDoc.examples![0].demo);
  const field = screen.getByRole('textbox', { name: 'Текст Markdown' }) as HTMLTextAreaElement;
  field.focus();
  field.setSelectionRange(11, 25);
  fireEvent.select(field);
  await user.click(screen.getByRole('button', { name: 'Жирный' }));
  expect(field.value).toBe('# Заметки\n\n**Важная заметка**');
  expect(screen.getByRole('status').textContent).toBe('Длина Markdown: 29');
});

it('changes preview modes without discarding the original document', async () => {
  const user = userEvent.setup();
  render(markdownEditorDoc.examples![1].demo);
  const field = screen.getByRole('textbox', {
    name: 'Markdown с предпросмотром',
  }) as HTMLTextAreaElement;
  expect(screen.getByRole('heading', { name: 'План' })).toBeTruthy();
  await user.click(screen.getByRole('button', { name: 'Предпросмотр', exact: true }));
  expect(screen.queryByRole('textbox')).toBeNull();
  expect(screen.getByRole('button', { name: 'Жирный' })).toHaveProperty('disabled', true);
  expect(screen.getByRole('status').textContent).toBe('Режим: предпросмотр');
  await user.click(screen.getByRole('button', { name: 'Редактирование', exact: true }));
  expect(screen.getByRole('textbox')).toBe(field);
  expect(field.value).toBe('# План\n\n- Написать текст\n- Проверить результат\n\n**Готово**');
  expect(screen.getByRole('status').textContent).toBe('Режим: редактирование');
});

it('undoes a command with Ctrl+Z and redoes it through the standard toolbar', async () => {
  const user = userEvent.setup();
  render(markdownEditorDoc.examples![2].demo);
  const field = screen.getByRole('textbox', { name: 'История Markdown' }) as HTMLTextAreaElement;
  field.focus();
  field.setSelectionRange(0, 13);
  fireEvent.select(field);
  await user.click(screen.getByRole('button', { name: 'Жирный' }));
  expect(field.value).toBe('**Первая версия**');
  await user.keyboard('{Control>}z{/Control}');
  expect(field.value).toBe('Первая версия');
  await user.click(screen.getByRole('button', { name: 'Повторить', exact: true }));
  expect(field.value).toBe('**Первая версия**');
  await user.click(screen.getByRole('button', { name: 'Отменить', exact: true }));
  await user.type(field, '!');
  expect(screen.getByRole('button', { name: 'Повторить', exact: true })).toHaveProperty(
    'disabled',
    true,
  );
});

it('inserts a link template and replaces its selected destination', async () => {
  const user = userEvent.setup();
  render(markdownEditorDoc.examples![3].demo);
  const field = screen.getByRole('textbox', { name: 'Markdown со ссылкой' }) as HTMLTextAreaElement;
  field.focus();
  field.setSelectionRange(0, 12);
  fireEvent.select(field);
  await user.click(screen.getByRole('button', { name: 'Ссылка', exact: true }));
  expect(field.value).toBe('[Сайт проекта](url)');
  expect([field.selectionStart, field.selectionEnd]).toEqual([15, 18]);
  await user.paste('https://example.com');
  expect(field.value).toBe('[Сайт проекта](https://example.com)');
  expect(screen.getByRole('link', { name: 'Сайт проекта' }).getAttribute('href')).toBe(
    'https://example.com',
  );
});

it('inserts the declared documentation image after a file drop', async () => {
  render(markdownEditorDoc.examples![4].demo);
  const field = screen.getByRole('textbox', {
    name: 'Markdown с изображением',
  }) as HTMLTextAreaElement;
  field.focus();
  field.setSelectionRange(field.value.length, field.value.length);
  fireEvent.select(field);
  fireEvent.drop(field, {
    dataTransfer: {
      types: ['Files'],
      files: [new File(['image'], 'example.png', { type: 'image/png' })],
    },
  });
  const image = await screen.findByRole('img', { name: 'image', exact: true });
  expect(image.getAttribute('src')).toBe('/markdown-upload-demo.svg');
  expect(field.value).toContain('/markdown-upload-demo.svg');
});

it('inserts a two-column table with three data rows into the live preview', async () => {
  const user = userEvent.setup();
  render(markdownEditorDoc.examples![5].demo);
  await user.click(screen.getByRole('button', { name: 'Таблица', exact: true }));
  const field = screen.getByRole('textbox', { name: 'Markdown с таблицей' }) as HTMLTextAreaElement;
  expect(field.value).toContain('| Header | Header |');
  expect(screen.getAllByRole('columnheader')).toHaveLength(2);
  expect(screen.getAllByRole('row')).toHaveLength(4);
  expect(screen.getAllByRole('cell')).toHaveLength(6);
});
