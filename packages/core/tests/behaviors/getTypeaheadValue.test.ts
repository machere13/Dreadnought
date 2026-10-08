// @vitest-environment node
import { describe, expect, it } from 'vitest';
import * as core from '../../src/index.ts';

const items = [
  { value: 'news', text: 'Новости' },
  { value: 'locked', text: 'Настройки', disabled: true },
  { value: 'settings', text: ' Настройки ' },
  { value: 'notes', text: 'Наши заметки' },
];

describe('getTypeaheadValue', () => {
  it('finds a prefix without case sensitivity and skips disabled items', () => {
    expect(core.getTypeaheadValue(items, 'news', 'НА')).toBe('settings');
  });

  it('cycles matches in collection order, including from a nonmatching current item', () => {
    expect(core.getTypeaheadValue(items, 'settings', 'н')).toBe('notes');
    expect(core.getTypeaheadValue(items, 'notes', 'н')).toBe('news');
    expect(core.getTypeaheadValue(items, 'locked', 'н')).toBe('settings');
    expect(core.getTypeaheadValue(items, 'unknown', 'на')).toBe('settings');
    expect(core.getTypeaheadValue(items, 'news', 'нов')).toBe('news');
  });

  it('can retain the current match when extending a query', () => {
    expect(core.getTypeaheadValue(items, 'settings', 'на', { includeCurrent: true })).toBe(
      'settings',
    );
  });

  it('returns undefined for an empty query or no available match without mutating input', () => {
    expect(core.getTypeaheadValue(items, 'news', ' ')).toBeUndefined();
    expect(core.getTypeaheadValue(items, 'news', 'xyz')).toBeUndefined();
    expect(core.getTypeaheadValue([], 'news', 'н')).toBeUndefined();
    expect(core.getTypeaheadValue([items[1]], 'news', 'на')).toBeUndefined();
    expect(items[2].text).toBe(' Настройки ');
  });
});
