import path from 'node:path';
import { readJson } from './compiler.mjs';

export function mergeMetadata(base, additions) {
  const entry = structuredClone(base);
  entry.parts ??= [];
  entry.constraints ??= [];
  for (const addition of additions) {
    if (addition.componentId !== entry.id) throw new Error(`Metadata component mismatch: ${addition.componentId}`);
    entry.bindings.push(...addition.bindings);
    entry.states.push(...(addition.states ?? []));
    entry.parts.push(...(addition.parts ?? []));
    entry.constraints.push(...(addition.constraints ?? []));
  }
  return entry;
}

export function readMetadata(root, components) {
  return components.map(({ family, name, sources }) => {
    const [base, ...additions] = sources.map((directory) => readJson(path.join(root, directory, family, name, 'catalog.json')));
    return mergeMetadata(base, additions);
  });
}
