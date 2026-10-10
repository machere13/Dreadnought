// @vitest-environment node
import { expect, it } from 'vitest';
import ts from 'typescript';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { assertCoreCoverage } from '../src/compiler.mjs';
import { readMetadata } from '../src/metadata.mjs';
import { components } from '../src/config.mjs';

const root = fileURLToPath(new URL('../../../', import.meta.url));
const config = ts.readConfigFile(
  path.join(root, 'packages/core/tsconfig.build.json'),
  ts.sys.readFile,
);
const parsed = ts.parseJsonConfigFileContent(
  config.config,
  ts.sys,
  path.join(root, 'packages/core'),
);
const program = ts.createProgram(parsed.fileNames, parsed.options);
const context = {
  program,
  checker: program.getTypeChecker(),
  entries: new Map([['@dreadnought/core', path.join(root, 'packages/core/src/index.ts')]]),
};
const metadata = readMetadata(root, components);

it('covers every current public core value without a separate export allowlist', () => {
  expect(() => assertCoreCoverage(context, metadata)).not.toThrow();
});

it('rejects a public function when its metadata disappears', () => {
  const withoutCopy = metadata.filter((entry) => entry.id !== 'action:copy');
  expect(() => assertCoreCoverage(context, withoutCopy)).toThrow(/copy/);
});

it('does not count a same-named React binding as core coverage', () => {
  const wrongPackage = metadata.map((entry) => ({
    ...entry,
    bindings: entry.bindings.map((binding) =>
      binding.exportName === 'copy' ? { ...binding, importPath: '@dreadnought/react' } : binding,
    ),
  }));
  expect(() => assertCoreCoverage(context, wrongPackage)).toThrow(/copy/);
});
