// @vitest-environment node
import { expect, it } from 'vitest';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { updateManifest, pnpmCommand } from '../src/syncConsumer.mjs';

it('rejects a missing consumer before building or installing packages', () => {
  const script = fileURLToPath(new URL('../src/syncConsumer.mjs', import.meta.url));
  const result = spawnSync(process.execPath, [script], { encoding: 'utf8' });
  expect(result.status).toBe(1);
  expect(result.stderr).toContain('Usage: pnpm sync:consumer -- <project>');
});

it('updates nested library dependencies without changing unrelated settings', () => {
  const manifest = {
    scripts: { build: 'vite build' },
    dependencies: { react: '^19', '@dreadnought/ui': 'file:old.tgz' },
    pnpm: { overrides: { react: '^19', '@dreadnought/ui': 'file:old.tgz' } },
  };
  const result = updateManifest(manifest, { '@dreadnought/ui': 'file:./vendor/new.tgz' });
  expect(result.dependencies).toEqual({ react: '^19', '@dreadnought/ui': 'file:./vendor/new.tgz' });
  expect(result.pnpm.overrides).toEqual({ react: '^19' });
  expect(result.scripts).toEqual({ build: 'vite build' });
  expect(manifest.dependencies['@dreadnought/ui']).toBe('file:old.tgz');
});

it('pins internal dependencies but leaves React peer constraints as versions', () => {
  const result = updateManifest(
    {},
    {
      '@dreadnought/core': 'file:core.tgz',
      '@dreadnought/themes': 'file:themes.tgz',
      '@dreadnought/react': 'file:react.tgz',
      '@dreadnought/ui': 'file:ui.tgz',
    },
  );
  expect(result.pnpm.overrides).toEqual({
    '@dreadnought/core': 'file:core.tgz',
    '@dreadnought/themes': 'file:themes.tgz',
  });
});

it('runs standalone pnpm directly and JavaScript pnpm through Node', () => {
  expect(pnpmCommand('C:/pnpm/pnpm.exe', ['install'])).toEqual(['C:/pnpm/pnpm.exe', 'install']);
  expect(pnpmCommand('/pnpm/pnpm.cjs', ['install'])).toEqual([
    process.execPath,
    '/pnpm/pnpm.cjs',
    'install',
  ]);
});
