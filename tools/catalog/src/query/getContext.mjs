import { CatalogQueryError } from './errors.mjs';

const fail = (code, message, details = {}) => { throw new CatalogQueryError(code, message, details); };
const bytes = (value) => Buffer.byteLength(JSON.stringify(value), 'utf8');

// These are usage hints, not a flattened replacement for union/overload contracts.
function primitiveChoices(binding) {
  const properties = new Map();
  for (const property of binding.contracts.flatMap(contract => contract.variants.flatMap(variant => variant.properties))) {
    if (property.origin !== 'library') continue;
    const types = properties.get(property.name) ?? new Set();
    property.type.split(/\s+\|\s+/).forEach(type => types.add(type));
    properties.set(property.name, types);
  }
  return Object.fromEntries([...properties]
    .filter(([, types]) => [...types].every(type => /^("[^"]*"|undefined|boolean|string|number)$/.test(type)) &&
      !(types.size === 1 && types.has('undefined')))
    .map(([name, types]) => [name, [...types].join(' | ')]));
}

export function getContext(catalog, {components, layer = 3, framework, maxBytes = 8192, includeTokens = false, format = 'usage'} = {}) {
  framework ??= layer === 1 ? 'core' : 'react';
  if (!Array.isArray(components) || !components.length || components.length > 10 ||
      components.some((name) => typeof name !== 'string' || !name.trim()) ||
      new Set(components.map((name) => name.toLowerCase())).size !== components.length ||
      ![1, 2, 3].includes(layer) || typeof framework !== 'string' || !framework.trim() ||
      !Number.isInteger(maxBytes) || maxBytes < 256 || maxBytes > 32768 || typeof includeTokens !== 'boolean' ||
      !['usage', 'contract'].includes(format)) {
    fail('INVALID_ARGUMENTS', 'Invalid context arguments');
  }

  const selected = components.map((name) => {
    const entry = catalog.entries.find((item) => item.id === name || item.name.toLowerCase() === name.toLowerCase());
    if (!entry) fail('UNKNOWN_COMPONENT', 'Unknown component', {component: name});
    const bindings = entry.bindings.filter((item) => item.layer === layer &&
      item.framework === (framework === 'core' ? null : framework));
    const binding = bindings.find((item) => !item.propertyPath);
    if (!binding) fail('UNKNOWN_BINDING', 'No binding for layer and framework', {component: name, layer, framework});
    return {entry, binding, bindings};
  });

  const result = {layer, framework, format, apiCoverage: 'partial', items: selected.map(({entry, binding, bindings}) => ({
    name: entry.name,
    binding: {id: binding.id, importPath: binding.importPath, exportName: binding.exportName},
    parts: bindings.filter((item) => item.propertyPath).map((item) => ({
      id: item.id, propertyPath: item.propertyPath,
    })),
    ...(format === 'contract' ? {
      description: entry.description,
      slots: entry.parts.map(part => part.name),
      props: [...new Set(binding.contracts.flatMap(contract => contract.variants.flatMap(variant =>
        variant.properties.filter(property => property.origin === 'library').map(property => property.name))))],
    } : {}),
  })), truncated: false};
  if (bytes(result) > maxBytes) fail('BUDGET_TOO_SMALL', 'Context summary exceeds maxBytes', {requiredBytes: bytes(result)});

  // Add optional detail only while the complete JSON reply stays inside the byte cap.
  const details = selected.map(({entry, binding, bindings}) => ({
    example: (() => {
      const example = binding.examples.find(item => item.id === 'usage')
        || (bindings.some((item) => item.propertyPath) && binding.examples.find((item) => item.id === 'compound'))
        || binding.examples[0];
      return example && {id: example.id, code: example.code};
    })(),
    props: format === 'usage' ? primitiveChoices(binding) : undefined,
    variants: format === 'contract' ? binding.contracts.map((contract) => contract.variants.map((variant) =>
        variant.properties.filter((property) => property.origin === 'library').map((property) => ({
          name: property.name, type: property.type, ...(property.optional ? {} : {required: true}),
        })))) : undefined,
    tokens: includeTokens ? entry.tokens.map((token) => token.name) : undefined,
  }));
  for (const key of ['example', 'props', 'variants', 'tokens']) {
    for (const [index, detail] of details.entries()) {
      const item = result.items[index];
      const value = detail[key];
      if (value === undefined) continue;
      item[key] = value;
      if (bytes(result) > maxBytes) { delete item[key]; result.truncated = true; }
    }
  }
  return result;
}
