import { readFileSync, mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

function apiOwner(entry, binding) {
  if (binding.propertyPath?.length) return [entry.name, ...binding.propertyPath].join('.');
  const name = binding.exportName?.replace(/Adapter$/, '');
  return binding.layer > 1 && binding.id !== 'react-logic' && name && name !== entry.name ? name : entry.name;
}

function apiRows(entry, binding) {
  const owner = apiOwner(entry, binding);
  const peers = entry.bindings.filter((item) =>
    apiOwner(entry, item) === owner);
  const descriptions = Object.assign({}, ...peers.map((item) => item.propertyDescriptions), binding.propertyDescriptions);
  const defaults = Object.assign({}, ...peers.filter((item) => item.layer > 1).map((item) => item.defaults), binding.defaults);
  const props = new Map();
  for (const contract of binding.contracts) for (const variant of contract.variants) {
    for (const prop of variant.properties) {
      if (prop.type === 'undefined' || prop.type === 'never') continue;
      if (prop.origin !== 'library' && !descriptions[prop.name] && !Object.hasOwn(defaults, prop.name)) continue;
      const previous = props.get(prop.name) ?? [];
      previous.push(prop);
      props.set(prop.name, previous);
    }
  }
  const prefix = owner !== entry.name ? `${owner}.` : '';
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
    if (entry.kind !== 'component') continue;
    const ready = entry.bindings.find((binding) => binding.id === 'react-ui');
    const adapter = entry.bindings.find((binding) => binding.id === 'react-adapter');
    const relatedCore = (entry.composesWith ?? []).map(id => catalog.entries.find(item => item.id === id))
      .find(item => item?.kind === 'domain')?.bindings.find(binding => binding.id === 'core');
    const logic = entry.bindings.find((binding) => binding.id === 'react-logic') ?? entry.bindings.find((binding) => binding.layer === 1) ?? relatedCore;
    if (!adapter?.examples.length || (ready && !ready.examples.length)) throw new Error(`Missing documentation example: ${entry.name}`);
    components[entry.name.toLowerCase()] = {
      ...(ready ? { readyCode: ready.examples[0].code } : {}),
      adapterCode: adapter.examples[0].code,
      ...(logic?.examples[0] ? { logicCode: logic.examples[0].code } : {}),
      apiRows: entry.bindings.filter((binding) => binding.layer === (ready ? 3 : 2)).flatMap((binding) => apiRows(entry, binding)),
    };
  }
  const output = path.join(root, 'apps/docs/src/generated/catalog-docs.json');
  mkdirSync(path.dirname(output), { recursive: true });
  writeFileSync(output, `${JSON.stringify({ packageVersions: catalog.packageVersions, components }, null, 2)}\n`);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  prepareCatalogDocs(fileURLToPath(new URL('../../../../', import.meta.url)));
}
