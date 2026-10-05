import { readFileSync } from 'node:fs';
import { packages } from '../config.mjs';
import { CatalogQueryError } from './errors.mjs';

const fail = (message, at) => { throw new CatalogQueryError('INVALID_CATALOG', message, {at}); };
const object = (value, at) => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) fail('Expected object', at);
  return value;
};
const array = (value, at) => {
  if (!Array.isArray(value)) fail('Expected array', at);
  return value;
};
const string = (value, at) => {
  if (typeof value !== 'string' || !value.trim()) fail('Expected nonempty string', at);
};
const boolean = (value, at) => {
  if (typeof value !== 'boolean') fail('Expected boolean', at);
};
const unique = (items, at) => {
  const seen = new Set();
  for (const [index, item] of items.entries()) {
    object(item, `${at}[${index}]`);
    string(item.id, `${at}[${index}].id`);
    if (seen.has(item.id)) fail('Duplicate id', at);
    seen.add(item.id);
  }
};
const strings = (items, at) => array(items, at).forEach((item, i) => string(item, `${at}[${i}]`));
function validateVariants(value, at) {
  const variants = array(value, at);
  if (!variants.length) fail('Missing contract variants', at);
  variants.forEach((variant, vi) => {
    const vat = `${at}[${vi}]`;
    object(variant, vat);
    const props = array(variant.properties, `${vat}.properties`);
    const names = new Set();
    props.forEach((prop, pi) => {
      const pat = `${vat}.properties[${pi}]`;
      object(prop, pat);
      string(prop.name, `${pat}.name`);
      string(prop.type, `${pat}.type`);
      boolean(prop.optional, `${pat}.optional`);
      if (!['library', 'dependency'].includes(prop.origin)) fail('Invalid origin', `${pat}.origin`);
      if (prop.values !== undefined) array(prop.values, `${pat}.values`).forEach(v => {
        if (typeof v !== 'string' && typeof v !== 'number') fail('Invalid literal', `${pat}.values`);
      });
      if (names.has(prop.name)) fail('Duplicate property', vat);
      names.add(prop.name);
    });
  });
}
const publicImports = new Map(packages.flatMap((pkg) => pkg.entrypoints.map((entry) =>
  [entry === '.' ? pkg.name : `${pkg.name}/${entry.slice(2)}`, {layer: pkg.layer, framework: pkg.framework}])));
const packageNames = packages.map((pkg) => pkg.name);

export function validateCatalog(value) {
  object(value, 'catalog');
  if (value.schemaVersion !== 1) throw new CatalogQueryError('UNSUPPORTED_SCHEMA', 'Expected catalog schema version 1', {actual: value.schemaVersion});
  const versions = object(value.packageVersions, 'packageVersions');
  if (Object.keys(versions).length !== packageNames.length) fail('Unexpected package version set', 'packageVersions');
  for (const name of packageNames) string(versions[name], `packageVersions.${name}`);
  if (new Set(Object.values(versions)).size !== 1) fail('Package versions must match', 'packageVersions');
  const entries = array(value.entries, 'entries');
  unique(entries, 'entries');
  entries.forEach((entry, ei) => {
    const at = `entries[${ei}]`;
    object(entry, at);
    for (const field of ['id', 'kind', 'name', 'family', 'description', 'docsUrl']) string(entry[field], `${at}.${field}`);
    if (!['component', 'action', 'behavior', 'domain'].includes(entry.kind)) fail('Unsupported entry kind', `${at}.kind`);
    if (entry.composesWith !== undefined) {
      strings(entry.composesWith, `${at}.composesWith`);
      if (entry.composesWith.some(id => !entries.some(other => other?.id === id))) fail('Unknown composition reference', `${at}.composesWith`);
    }
    strings(entry.states, `${at}.states`);
    strings(entry.constraints, `${at}.constraints`);
    array(entry.parts, `${at}.parts`).forEach((part, i) => {
      object(part, `${at}.parts[${i}]`);
      string(part.name, `${at}.parts[${i}].name`);
      string(part.description, `${at}.parts[${i}].description`);
    });
    array(entry.tokens, `${at}.tokens`).forEach((token, i) => {
      object(token, `${at}.tokens[${i}]`);
      string(token.name, `${at}.tokens[${i}].name`);
      string(token.value, `${at}.tokens[${i}].value`);
    });
    const bindings = array(entry.bindings, `${at}.bindings`);
    if (!bindings.length) fail('Missing bindings', `${at}.bindings`);
    unique(bindings, `${at}.bindings`);
    bindings.forEach((binding, bi) => {
      const bat = `${at}.bindings[${bi}]`;
      object(binding, bat);
      if (![1, 2, 3].includes(binding.layer)) fail('Invalid layer', `${bat}.layer`);
      if (entry.kind !== 'component' && (binding.layer !== 1 || binding.framework !== null)) fail('Core capability must use layer 1', bat);
      if (binding.framework !== null) string(binding.framework, `${bat}.framework`);
      for (const field of ['id', 'importPath', 'exportName', 'description']) string(binding[field], `${bat}.${field}`);
      if (!publicImports.has(binding.importPath)) fail('Non-public import', `${bat}.importPath`);
      const kind = publicImports.get(binding.importPath);
      if (!kind || binding.layer !== kind.layer || binding.framework !== kind.framework) {
        fail('Binding layer/framework does not match public import', bat);
      }
      if (binding.propertyPath !== undefined) strings(binding.propertyPath, `${bat}.propertyPath`);
      for (const field of ['propertyDescriptions', 'defaults']) object(binding[field], `${bat}.${field}`);
      Object.entries(binding.propertyDescriptions).forEach(([name, description]) => string(description, `${bat}.propertyDescriptions.${name}`));
      const examples = array(binding.examples, `${bat}.examples`);
      unique(examples, `${bat}.examples`);
      examples.forEach((example, i) => string(example.code, `${bat}.examples[${i}].code`));
      const contracts = array(binding.contracts, `${bat}.contracts`);
      if (!contracts.length) fail('Missing contracts', `${bat}.contracts`);
      contracts.forEach((contract, ci) => {
        const cat = `${bat}.contracts[${ci}]`;
        object(contract, cat);
        string(contract.returnType, `${cat}.returnType`);
        validateVariants(contract.variants, `${cat}.variants`);
        array(contract.parameters, `${cat}.parameters`).forEach((parameter, i) => {
          const pat = `${cat}.parameters[${i}]`;
          object(parameter, pat);
          string(parameter.name, `${pat}.name`);
          string(parameter.type, `${pat}.type`);
          boolean(parameter.optional, `${pat}.optional`);
          if (parameter.values !== undefined) array(parameter.values, `${pat}.values`).forEach(value => {
            if (typeof value !== 'string' && typeof value !== 'number') fail('Invalid literal', `${pat}.values`);
          });
          if (parameter.variants !== undefined) validateVariants(parameter.variants, `${pat}.variants`);
          if (parameter.defaults !== undefined) {
            object(parameter.defaults, `${pat}.defaults`);
            const properties = (i === 0 ? contract.variants : parameter.variants ?? []).flatMap(variant => variant.properties);
            for (const name of Object.keys(parameter.defaults)) {
              if (!properties.some(property => property.name === name)) fail('Unknown parameter default', `${pat}.defaults.${name}`);
            }
          }
        });
      });
    });
  });
  return value;
}

export function loadCatalog(filename) {
  let contents;
  try { contents = readFileSync(filename, 'utf8'); }
  catch (error) { throw new CatalogQueryError('CATALOG_READ_FAILED', 'Cannot read catalog', {path: filename, cause: error.code}); }
  let value;
  try { value = JSON.parse(contents); }
  catch { throw new CatalogQueryError('INVALID_JSON', 'Catalog is not valid JSON', {path: filename}); }
  return validateCatalog(value);
}
