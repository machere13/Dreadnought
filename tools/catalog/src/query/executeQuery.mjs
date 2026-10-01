import { loadCatalog } from './loadCatalog.mjs';
import { selectEntries } from './selectEntries.mjs';
import { getEntry } from './getEntry.mjs';
import { checkProject, requireBindingPackage } from './checkProject.mjs';
import { CatalogQueryError } from './errors.mjs';

export function executeQuery({operation, component, query, catalogPath, projectPath, options = {}}) {
  if (operation === 'help') return {responseVersion: 1, operation: 'help', commands: {
    list: 'list [--family NAME] [--layer 1|2|3] [--framework NAME] [--limit 1..50] [--offset N]',
    search: 'search QUERY [list filters]',
    get: 'get COMPONENT [--binding ID] [--section overview|api|examples|tokens] [--property NAME] [--example ID] [--include-inherited]',
    check: 'check --project PATH',
  }, commonFlags: ['--catalog PATH', '--project PATH']};
  const catalog = loadCatalog(catalogPath);
  const compatibility = projectPath ? checkProject(catalog, projectPath) : {status: 'unchecked'};
  if (operation === 'check') return {responseVersion: 1, operation, packageVersions: catalog.packageVersions, compatibility, result: compatibility};
  if (compatibility.status === 'incompatible') {
    const code = compatibility.mismatches.length ? 'VERSION_MISMATCH' : 'NO_PACKAGES';
    throw new CatalogQueryError(code, 'Target project is incompatible with this catalog', {compatibility});
  }
  let result;
  if (operation === 'list' || operation === 'search') result = selectEntries(catalog, {...options, query: operation === 'search' ? query : ''});
  else if (operation === 'get') {
    result = getEntry(catalog, component, options);
    if (projectPath && result.binding) requireBindingPackage(compatibility, result.binding);
  } else throw new CatalogQueryError('INVALID_ARGUMENTS', 'Unknown operation', {operation});
  return {responseVersion: 1, operation, packageVersions: catalog.packageVersions, compatibility, result};
}
