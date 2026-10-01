import { fileURLToPath } from 'node:url';
import { parseArgs } from './query/parseArgs.mjs';
import { executeQuery } from './query/executeQuery.mjs';
import { CatalogQueryError } from './query/errors.mjs';

const argv = process.argv.slice(2);
try {
  const request = parseArgs(argv);
  request.catalogPath ??= fileURLToPath(new URL('../dist/catalog.json', import.meta.url));
  const response = executeQuery(request);
  process.stdout.write(`${JSON.stringify(response)}\n`);
  if (response.operation === 'check' && response.compatibility.status !== 'compatible') process.exitCode = 1;
} catch (error) {
  const known = error instanceof CatalogQueryError;
  process.stdout.write(`${JSON.stringify({responseVersion: 1, operation: argv[0] ?? null,
    error: {code: known ? error.code : 'INTERNAL_ERROR',
      message: known ? error.message : 'Unexpected query failure', details: known ? error.details : {}}})}\n`);
  process.exitCode = 1;
}
