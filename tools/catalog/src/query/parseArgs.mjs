import { CatalogQueryError } from './errors.mjs';

const allowed = {
  list: new Set(['catalog', 'project', 'family', 'layer', 'framework', 'limit', 'offset']),
  search: new Set(['catalog', 'project', 'family', 'layer', 'framework', 'limit', 'offset']),
  get: new Set(['catalog', 'project', 'binding', 'section', 'property', 'example', 'include-inherited']),
  check: new Set(['catalog', 'project']),
};
const fail = (message, details = {}) => { throw new CatalogQueryError('INVALID_ARGUMENTS', message, details); };

export function parseArgs(argv) {
  if (!Array.isArray(argv)) fail('Arguments must be an array');
  if (argv.length === 1 && argv[0] === '--help') return {operation: 'help', options: {}};
  const [operation, ...rest] = argv;
  if (!allowed[operation]) fail('Expected list, search, get or check', {operation});
  const fields = {};
  const positionals = [];
  for (let i = 0; i < rest.length; i++) {
    const arg = rest[i];
    if (arg === '--help') {
      if (rest.length !== 1) fail('--help cannot be combined with other arguments');
      return {operation: 'help', options: {}};
    }
    if (arg.startsWith('--')) {
      const flag = arg.slice(2);
      if (!allowed[operation].has(flag)) fail('Unknown or unsupported flag', {flag, operation});
      if (Object.hasOwn(fields, flag)) fail('Duplicate flag', {flag});
      if (flag === 'include-inherited') { fields[flag] = true; continue; }
      const value = rest[++i];
      if (value === undefined || value.startsWith('--')) fail('Missing flag value', {flag});
      fields[flag] = value;
    } else {
      positionals.push(arg);
    }
  }
  const needed = operation === 'search' || operation === 'get' ? 1 : 0;
  if (positionals.length !== needed || (needed && !positionals[0].trim())) fail('Wrong number of positional arguments');
  if (operation === 'check' && !fields.project) fail('check requires --project');
  for (const flag of ['catalog', 'project', 'family', 'framework', 'binding', 'section', 'property', 'example']) {
    if (fields[flag] !== undefined && !fields[flag].trim()) fail('Empty flag value', {flag});
  }
  for (const [flag, min, max] of [['layer', 1, 3], ['limit', 1, 50], ['offset', 0, Number.MAX_SAFE_INTEGER]]) {
    if (fields[flag] !== undefined) {
      if (!/^\d+$/.test(fields[flag])) fail('Expected integer flag value', {flag});
      fields[flag] = Number(fields[flag]);
      if (!Number.isSafeInteger(fields[flag]) || fields[flag] < min || fields[flag] > max) fail('Integer flag out of range', {flag});
    }
  }
  return {
    operation, component: operation === 'get' ? positionals[0] : undefined,
    query: operation === 'search' ? positionals[0] : undefined,
    catalogPath: fields.catalog, projectPath: fields.project,
    options: {
      ...(fields.family !== undefined ? {family: fields.family} : {}),
      ...(fields.layer !== undefined ? {layer: fields.layer} : {}),
      ...(fields.framework !== undefined ? {framework: fields.framework} : {}),
      ...(fields.limit !== undefined ? {limit: fields.limit} : {}),
      ...(fields.offset !== undefined ? {offset: fields.offset} : {}),
      ...(fields.binding !== undefined ? {binding: fields.binding} : {}),
      ...(fields.section !== undefined ? {section: fields.section} : {}),
      ...(fields.property !== undefined ? {property: fields.property} : {}),
      ...(fields.example !== undefined ? {example: fields.example} : {}),
      ...(fields['include-inherited'] ? {includeInherited: true} : {}),
    },
  };
}
