import { CatalogQueryError } from './errors.mjs';

export function selectEntries(catalog, {query = '', kind, family, layer, framework, limit = 10, offset = 0} = {}) {
  if (typeof query !== 'string' || (family !== undefined && !catalog.entries.some((entry) => entry.family === family)) ||
      (kind !== undefined && !['component', 'action', 'behavior'].includes(kind)) ||
      (layer !== undefined && ![1, 2, 3].includes(layer)) ||
      (framework !== undefined && (typeof framework !== 'string' || !framework.trim())) ||
      !Number.isInteger(limit) || limit < 1 || limit > 50 || !Number.isInteger(offset) || offset < 0) {
    throw new CatalogQueryError('INVALID_FILTER', 'Invalid catalog filter');
  }
  const words = query.toLocaleLowerCase().trim().split(/\s+/).filter(Boolean);
  const entries = catalog.entries.flatMap((entry) => {
    if (kind !== undefined && entry.kind !== kind) return [];
    if (family !== undefined && entry.family !== family) return [];
    const bindings = entry.bindings.filter((binding) =>
      (layer === undefined || binding.layer === layer) &&
      (framework === undefined || binding.framework === (framework === 'core' ? null : framework)));
    if (!bindings.length) return [];
    const text = [entry.name, entry.description, ...bindings.flatMap((binding) => [binding.exportName, binding.importPath, binding.description])]
      .join(' ').toLocaleLowerCase();
    if (!words.every((word) => text.includes(word))) return [];
    const needle = query.trim().toLocaleLowerCase();
    const rank = entry.name.toLocaleLowerCase() === needle ? 0 :
      bindings.some((binding) => binding.exportName.toLocaleLowerCase() === needle) ? 1 : 2;
    return [{rank, id: entry.id, kind: entry.kind, name: entry.name, family: entry.family, description: entry.description,
      docsUrl: entry.docsUrl, bindings: bindings.map(({id, layer, framework, importPath, exportName, propertyPath}) =>
        ({id, layer, framework, importPath, exportName, ...(propertyPath ? {propertyPath} : {})}))}];
  });
  entries.sort((a, b) => a.rank - b.rank || (a.id < b.id ? -1 : a.id > b.id ? 1 : 0));
  return {total: entries.length, offset, limit, items: entries.slice(offset, offset + limit).map(({rank, ...item}) => item)};
}
