// @vitest-environment node
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import ts from 'typescript';
import { expect, it } from 'vitest';

it('includes the public Drawer contract fixture in standard typechecking', () => {
  const configPath = fileURLToPath(new URL('../../../tsconfig.type-tests.json', import.meta.url));
  const { config, error } = ts.readConfigFile(configPath, ts.sys.readFile);
  expect(error).toBeUndefined();
  const parsed = ts.parseJsonConfigFileContent(config, ts.sys, path.dirname(configPath));
  expect(parsed.errors).toEqual([]);
  expect(parsed.fileNames.map(file => path.resolve(file)))
    .toContain(fileURLToPath(new URL('./drawer.types.tsx', import.meta.url)));
  expect(parsed.fileNames.map(file => path.resolve(file)))
    .toContain(fileURLToPath(new URL('../../core/tests/components/Overlays/Drawer/DrawerPublic.types.ts', import.meta.url)));
});
