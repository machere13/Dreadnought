import path from 'node:path';
import {CatalogQueryError} from '../query/errors.mjs';

function isFullyQualified(value) {
  if (!path.isAbsolute(value)) return false;
  if (process.platform !== 'win32') return true;
  const root = path.win32.parse(value).root;
  return /^[A-Za-z]:[\\/]/.test(root) || /^[\\/]{2}[^\\/]+[\\/][^\\/]+[\\/]?$/.test(root);
}

export function parseServerArgs(argv) {
  const values = {};
  for (let index = 0; index < argv.length; index += 2) {
    const flag = argv[index];
    const value = argv[index + 1];
    if (!['--catalog', '--project'].includes(flag) || !value || value.startsWith('--') || Object.hasOwn(values, flag)) {
      throw new CatalogQueryError('INVALID_ARGUMENTS', 'Invalid startup arguments');
    }
    values[flag] = value;
  }
  if (Object.keys(values).length !== 2 || !isFullyQualified(values['--catalog']) || !isFullyQualified(values['--project'])) {
    throw new CatalogQueryError('INVALID_ARGUMENTS', 'Absolute catalog and project paths are required');
  }
  return Object.freeze({catalogPath: values['--catalog'], projectPath: values['--project']});
}
