import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import {
  copyFileSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  readdirSync,
  realpathSync,
  renameSync,
  writeFileSync,
} from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { packages } from './config.mjs';

const root = fileURLToPath(new URL('../../../', import.meta.url));

export function updateManifest(manifest, archives) {
  const overrides = { ...manifest.pnpm?.overrides };
  for (const name of Object.keys(archives)) delete overrides[name];
  for (const name of ['@dreadnought/core', '@dreadnought/themes']) {
    if (archives[name]) overrides[name] = archives[name];
  }
  return {
    ...manifest,
    dependencies: { ...manifest.dependencies, ...archives },
    pnpm: { ...manifest.pnpm, overrides },
  };
}

export function pnpmCommand(executable, args) {
  return /\.[cm]?js$/i.test(executable)
    ? [process.execPath, executable, ...args]
    : [executable, ...args];
}

function run(args, cwd = root) {
  const [command, ...parameters] = pnpmCommand(process.env.npm_execpath, args);
  const result = spawnSync(command, parameters, {
    cwd,
    stdio: 'inherit',
  });
  if (result.error) throw result.error;
  if (result.status !== 0) throw new Error(`pnpm ${args.join(' ')} failed (${result.status})`);
}

function syncConsumer(argv) {
  if (argv[0] === '--') argv = argv.slice(1);
  if (argv.length !== 1) throw new Error('Usage: pnpm sync:consumer -- <project>');
  const project = realpathSync(path.resolve(argv[0]));
  if (project === realpathSync(root))
    throw new Error('Choose a consumer, not the library repository');
  const manifestPath = path.join(project, 'package.json');
  const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
  if (!process.env.npm_execpath?.includes('pnpm')) throw new Error('Run this command through pnpm');
  run([
    '--filter',
    '@dreadnought/core',
    '--filter',
    '@dreadnought/react',
    '--filter',
    '@dreadnought/themes',
    '--filter',
    '@dreadnought/ui',
    'build',
  ]);
  run(['catalog']);
  const staging = mkdtempSync(path.join(root, 'tools/catalog/dist/consumer-'));
  const candidate = path.join(staging, 'catalog.json');
  copyFileSync(path.join(root, 'tools/catalog/dist/catalog.json'), candidate);
  const vendor = path.join(project, 'vendor');
  mkdirSync(vendor, { recursive: true });
  const archives = {};
  for (const pkg of packages) {
    const destination = path.join(staging, pkg.name.split('/')[1]);
    mkdirSync(destination);
    run(['pack', '--pack-destination', destination], path.join(root, pkg.directory));
    const archive = path.join(
      destination,
      readdirSync(destination).find((name) => name.endsWith('.tgz')),
    );
    const hash = createHash('sha256').update(readFileSync(archive)).digest('hex');
    const name = `${path.basename(archive, '.tgz')}-${hash}.tgz`;
    copyFileSync(archive, path.join(vendor, name));
    archives[pkg.name] = `file:./vendor/${name}`;
  }
  const catalogDirectory = path.join(project, '.dreadnought');
  mkdirSync(catalogDirectory, { recursive: true });
  const catalog = path.join(catalogDirectory, 'catalog.json');
  if (existsSync(catalog)) {
    renameSync(catalog, path.join(catalogDirectory, `catalog-${Date.now()}.previous.json`));
  }
  const backup = path.join(staging, 'consumer-package.json');
  copyFileSync(manifestPath, backup);
  console.log(`Previous consumer manifest: ${backup}`);
  writeFileSync(manifestPath, `${JSON.stringify(updateManifest(manifest, archives), null, 2)}\n`);
  run(['install', '--no-frozen-lockfile'], project);
  const check = spawnSync(
    process.execPath,
    [
      path.join(root, 'tools/catalog/src/query.mjs'),
      'check',
      '--catalog',
      candidate,
      '--project',
      project,
    ],
    { stdio: 'inherit' },
  );
  if (check.error) throw check.error;
  if (check.status !== 0) throw new Error('Installed packages do not match the catalog');
  const nextCatalog = path.join(catalogDirectory, 'catalog.next.json');
  copyFileSync(candidate, nextCatalog);
  renameSync(nextCatalog, catalog);
  console.log(`Updated packages and catalog: ${catalog}`);
}

if (
  process.argv[1] &&
  realpathSync(process.argv[1]) === realpathSync(fileURLToPath(import.meta.url))
) {
  try {
    syncConsumer(process.argv.slice(2));
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}
