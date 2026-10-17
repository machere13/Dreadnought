import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, expect, it } from 'vitest';
import { badgeDoc } from '../src/content/components/DataDisplay/Badge/BadgeDoc.tsx';
import { markDoc } from '../src/content/components/DataDisplay/Mark/MarkDoc.tsx';
import { iconDoc } from '../src/content/components/DataDisplay/Icon/IconDoc.tsx';

afterEach(cleanup);

it.each([
  ['Badge', badgeDoc, 3],
  ['Mark', markDoc, 2],
  ['Icon', iconDoc, 2],
] as const)('pairs each %s example with its full portable source', (_name, doc, count) => {
  expect(doc.examples).toHaveLength(count);
  for (const example of doc.examples!) {
    const name = (example.demo as { type: { name: string } }).type.name;
    expect(example.code).toBe(
      readFileSync(resolve('apps/docs/src/content/components/DataDisplay', doc.title, `${name}.tsx`), 'utf8'),
    );
    expect(example.code).not.toMatch(/from ['"]\./);
  }
});

it('updates the badge target name and resets the count without hiding zero', () => {
  render(badgeDoc.examples![2].demo);
  fireEvent.click(screen.getByRole('button', { name: 'Уведомления, 2 новых' }));
  expect(screen.getByRole('button', { name: 'Уведомления, 3 новых' })).toBeTruthy();
  expect(screen.getByText('3').closest('[aria-hidden="true"]')).toBeTruthy();
  fireEvent.click(screen.getByRole('button', { name: 'Отметить прочитанными' }));
  expect(screen.getByRole('button', { name: 'Уведомления, 0 новых' })).toBeTruthy();
  expect(screen.getByText('0')).toBeTruthy();
});

it('keeps the icon gallery decorative and labels every supported name', () => {
  render(iconDoc.examples![0].demo);
  const list = screen.getByRole('list', { name: 'Набор иконок' });
  expect(within(list).getAllByRole('listitem')).toHaveLength(33);
  for (const name of ['calendar', 'ellipsis', 'eye-off', 'ordered-list']) {
    expect(within(list).getByText(name)).toBeTruthy();
  }
  expect(within(list).queryByRole('img')).toBeNull();
});

it('names the meaningful icon and lets the icon-only button toggle details', () => {
  render(iconDoc.examples![1].demo);
  expect(screen.getByRole('img', { name: 'Успешно' })).toBeTruthy();
  const trigger = screen.getByRole('button', { name: 'Показать подробности' });
  expect(within(trigger).queryByRole('img')).toBeNull();
  expect(trigger.getAttribute('aria-expanded')).toBe('false');
  const details = screen.getByText(
    'Подробности доступны по нажатию на кнопку, а не на саму иконку.',
  );
  expect(trigger.getAttribute('aria-controls')).toBe(details.id);
  expect(details).toHaveProperty('hidden', true);
  fireEvent.click(trigger);
  expect(
    screen.getByRole('button', { name: 'Скрыть подробности' }).getAttribute('aria-expanded'),
  ).toBe('true');
  expect(details).toHaveProperty('hidden', false);
  fireEvent.click(screen.getByRole('button', { name: 'Скрыть подробности' }));
  expect(details).toHaveProperty('hidden', true);
});
