import { readFileSync, readdirSync } from 'node:fs';
import { basename, dirname, resolve } from 'node:path';
import { isValidElement } from 'react';
import { expect, it } from 'vitest';
import { componentTitles } from '../src/app/navigation.ts';
import type { ComponentDoc } from '../src/shared/types.ts';
import { getCatalogDoc } from '../src/data/catalog/getCatalogDoc.ts';

const modules = import.meta.glob('../src/content/components/**/*Doc.tsx', { eager: true });
const pages = Object.entries(modules).map(([path, module]) => {
  const doc = Object.values(module as Record<string, unknown>).find(
    (value): value is ComponentDoc =>
      typeof value === 'object' && value !== null && 'apiRows' in value,
  );
  if (!doc) throw new Error(`Missing component documentation in ${path}`);
  return { path, doc };
});

it('covers every component in the documentation navigation', () => {
  expect(pages.map(({ doc }) => doc.title).sort()).toEqual(Object.values(componentTitles).sort());
});

it.each(pages)('keeps the main API selection valid for $doc.title', ({ doc }) => {
  expect(doc.primaryProps?.length).toBeGreaterThan(0);
  expect(new Set(doc.primaryProps).size).toBe(doc.primaryProps!.length);
  const names = doc.apiRows.map(([name]) => name);
  for (const name of doc.primaryProps!) expect(names).toContain(name);
});

it.each(pages)('keeps all catalog properties available for $doc.title', ({ doc }) => {
  expect(doc.apiRows.map(([name]) => name).sort()).toEqual(
    getCatalogDoc(doc.title.toLowerCase())
      .apiRows.map(([name]) => name)
      .sort(),
  );
});

it.each(pages)('copies the complete live example source for $doc.title', ({ path, doc }) => {
  expect(doc.examples?.length).toBeGreaterThan(0);
  const ids = doc.examples!.map((example) => example.id);
  expect(new Set(ids).size).toBe(ids.length);
  for (const example of doc.examples!) {
    expect(isValidElement(example.demo)).toBe(true);
    if (!isValidElement(example.demo) || typeof example.demo.type !== 'function') {
      throw new Error(`Missing standalone demo in ${doc.title}: ${example.id}`);
    }
    const directory = resolve('apps/docs/tests', dirname(path));
    const name = `${example.demo.type.name}.tsx`;
    const files = readdirSync(directory, { recursive: true }).filter(
      (file) => basename(String(file)) === name,
    );
    expect(files).toHaveLength(1);
    const source = readFileSync(resolve(directory, String(files[0])), 'utf8');
    expect(example.code).toBe(source);
    expect(example.code).not.toMatch(/from ['"]\./);
  }
});
