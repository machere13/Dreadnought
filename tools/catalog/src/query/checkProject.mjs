import { existsSync, readFileSync, realpathSync, statSync } from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';
import { packages } from '../config.mjs';
import { CatalogQueryError } from './errors.mjs';

const trustedNames = packages.map((pkg) => pkg.name);
const fail = (code, message, details = {}) => { throw new CatalogQueryError(code, message, details); };
const inside = (directory, target) => {
  const relative = path.relative(directory, target);
  return relative === '' || (relative !== '..' && !relative.startsWith(`..${path.sep}`) && !path.isAbsolute(relative));
};
function readManifest(filename) {
  try { return JSON.parse(readFileSync(filename, 'utf8')); }
  catch (error) { fail('PROJECT_READ_FAILED', 'Cannot read package manifest', {path: filename, cause: error.code}); }
}

export function checkProject(catalog, projectPath) {
  if (typeof projectPath !== 'string' || !projectPath.trim()) fail('PROJECT_READ_FAILED', 'Project path is required');
  let project;
  try {
    project = realpathSync(projectPath);
    if (!statSync(project).isDirectory()) fail('PROJECT_READ_FAILED', 'Project path is not a directory', {path: projectPath});
  } catch (error) {
    if (error instanceof CatalogQueryError) throw error;
    fail('PROJECT_READ_FAILED', 'Cannot access project', {path: projectPath, cause: error.code});
  }
  const manifest = path.join(project, 'package.json');
  readManifest(manifest);
  const resolutionPaths = createRequire(manifest).resolve.paths('@dreadnought/core')
    .filter((candidate) => path.basename(candidate) === 'node_modules' && inside(path.dirname(candidate), project));
  if (existsSync(path.join(project, '.pnp.cjs')) && !resolutionPaths.some((candidate) => existsSync(candidate))) {
    fail('UNSUPPORTED_RESOLUTION', 'PnP projects without node_modules are not supported', {path: project});
  }
  const installed = {};
  const missing = [];
  const mismatches = [];
  for (const name of trustedNames) {
    let found = false;
    for (const candidate of resolutionPaths) {
      const packagePath = path.join(candidate, ...name.split('/'));
      let actualPath;
      try { actualPath = realpathSync(packagePath); }
      catch (error) {
        if (error.code === 'ENOENT') continue;
        fail('PROJECT_READ_FAILED', 'Cannot resolve installed package', {name, path: packagePath, cause: error.code});
      }
      const packageManifest = readManifest(path.join(actualPath, 'package.json'));
      if (packageManifest.name !== name || typeof packageManifest.version !== 'string' || !packageManifest.version.trim()) {
        fail('PROJECT_READ_FAILED', 'Invalid installed package manifest', {name, path: actualPath});
      }
      installed[name] = packageManifest.version;
      if (packageManifest.version !== catalog.packageVersions[name]) {
        mismatches.push({name, expected: catalog.packageVersions[name], actual: packageManifest.version});
      }
      found = true;
      break;
    }
    if (!found) missing.push(name);
  }
  return {status: Object.keys(installed).length && !mismatches.length ? 'compatible' : 'incompatible', installed, missing, mismatches};
}

export function requireBindingPackage(report, binding) {
  const name = /^(@[^/]+\/[^/]+)(?:\/|$)/.exec(binding?.importPath)?.[1];
  if (!name || !trustedNames.includes(name)) fail('INVALID_ARGUMENTS', 'Unknown binding package');
  if (!(name in report.installed)) fail('MISSING_BINDING_PACKAGE', 'Binding package is not installed', {name});
  if (report.mismatches.some((item) => item.name === name)) fail('VERSION_MISMATCH', 'Binding package version does not match catalog', {name});
}
