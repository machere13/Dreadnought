import { readFileSync, mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

function apiRows(entry, binding) {
  const peers = entry.bindings.filter((item) =>
    JSON.stringify(item.propertyPath ?? []) === JSON.stringify(binding.propertyPath ?? []));
  const descriptions = Object.assign({}, ...peers.map((item) => item.propertyDescriptions), binding.propertyDescriptions);
  const defaults = Object.assign({}, ...peers.map((item) => item.defaults), binding.defaults);
  const props = new Map();
  for (const contract of binding.contracts) for (const variant of contract.variants) {
    for (const prop of variant.properties) {
      if (prop.origin !== 'library' && !descriptions[prop.name] && !Object.hasOwn(defaults, prop.name)) continue;
      const previous = props.get(prop.name) ?? [];
      previous.push(prop);
      props.set(prop.name, previous);
    }
  }
  const prefix = binding.propertyPath?.length ? `${entry.name}.${binding.propertyPath.join('.')}.` : '';
  return [...props].map(([name, variants]) => {
    const types = [...new Set(variants.map((prop) => prop.values?.join(' | ') ?? prop.type.replace(/ \| undefined/g, '')))].filter((type) => type !== 'undefined');
    const fallback = Object.hasOwn(defaults, name) ? String(typeof defaults[name] === 'object' ? JSON.stringify(defaults[name]) : defaults[name]) : '—';
    return [prefix + name, types.join(' | ') || 'undefined', fallback, descriptions[name] ?? 'Свойство компонента'];
  });
}

export function prepareCatalogDocs(root) {
  const catalog = JSON.parse(readFileSync(path.join(root, 'tools/catalog/dist/catalog.json'), 'utf8'));
  const components = {};
  for (const entry of catalog.entries) {
    const ready = entry.bindings.find((binding) => binding.id === 'react-ui');
    const adapter = entry.bindings.find((binding) => binding.id === 'react-adapter');
    const logic = entry.bindings.find((binding) => binding.id === 'react-logic') ?? entry.bindings.find((binding) => binding.layer === 1);
    if (!ready || !adapter || !ready.examples.length || !adapter.examples.length) throw new Error(`Missing documentation example: ${entry.name}`);
    components[entry.name.toLowerCase()] = {
      readyCode: ready.examples[0].code,
      adapterCode: adapter.examples[0].code,
      ...(logic?.examples[0] ? { logicCode: logic.examples[0].code } : {}),
      apiRows: entry.bindings.filter((binding) => binding.layer === 3).flatMap((binding) => apiRows(entry, binding)),
    };
  }
  const output = path.join(root, 'apps/docs/src/generated/catalog-docs.json');
  mkdirSync(path.dirname(output), { recursive: true });
  writeFileSync(output, `${JSON.stringify({ packageVersions: catalog.packageVersions, components }, null, 2)}\n`);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  prepareCatalogDocs(fileURLToPath(new URL('../../../../', import.meta.url)));
}
