import path from 'node:path';
import {CatalogQueryError} from '../query/errors.mjs';

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
  if (Object.keys(values).length !== 2 || !path.isAbsolute(values['--catalog']) || !path.isAbsolute(values['--project'])) {
    throw new CatalogQueryError('INVALID_ARGUMENTS', 'Absolute catalog and project paths are required');
  }
  return Object.freeze({catalogPath: values['--catalog'], projectPath: values['--project']});
}
