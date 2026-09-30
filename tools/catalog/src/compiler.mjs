import { readFileSync, existsSync } from 'node:fs';
import path from 'node:path';
import ts from 'typescript';

export function readJson(file) {
  return JSON.parse(readFileSync(file, 'utf8'));
}

export function createContext(root, packages) {
  const entries = new Map();
  const packageVersions = {};
  const paths = {};
  for (const config of packages) {
    const directory = path.resolve(root, config.directory);
    const manifest = readJson(path.join(directory, 'package.json'));
    if (!manifest.name || !manifest.version) throw new Error(`Missing package identity: ${config.directory}`);
    packageVersions[manifest.name] = manifest.version;
    for (const entry of config.entrypoints) {
      const declaration = manifest.exports?.[entry]?.types;
      if (typeof declaration !== 'string' || !declaration.startsWith('./dist/') || !declaration.endsWith('.d.ts')) {
        throw new Error(`Missing public types export: ${manifest.name}/${entry}`);
      }
      const runtime = manifest.exports[entry].import ?? manifest.exports[entry].default;
      if (typeof runtime !== 'string' || !runtime.startsWith('./')) {
        throw new Error(`Missing public runtime export: ${manifest.name}/${entry}`);
      }
      const source = path.resolve(directory, declaration.replace('./dist/', './src/').replace(/\.d\.ts$/, '.ts'));
      if (!source.startsWith(`${directory}${path.sep}`) || !existsSync(source)) {
        throw new Error(`Cannot map public declaration to source: ${manifest.name}/${entry}`);
      }
      const importPath = entry === '.' ? manifest.name : manifest.name + entry.slice(1);
      if (entries.has(importPath)) throw new Error(`Duplicate public entry: ${importPath}`);
      entries.set(importPath, source);
      paths[importPath] = [source];
    }
  }
  if (new Set(Object.values(packageVersions)).size !== 1) throw new Error('Package versions must match for a catalog release');

  const options = {
    target: ts.ScriptTarget.ES2022,
    module: ts.ModuleKind.NodeNext,
    moduleResolution: ts.ModuleResolutionKind.NodeNext,
    jsx: ts.JsxEmit.ReactJSX,
    strict: true,
    skipLibCheck: true,
    noEmit: true,
    allowImportingTsExtensions: true,
    esModuleInterop: true,
    paths: { ...paths, '#behaviors/*': [path.join(root, 'packages/core/src/behaviors/*.ts')] },
  };
  const cssTypes = path.join(root, 'packages/ui/src/css-modules.d.ts');
  const roots = [...entries.values(), ...(existsSync(cssTypes) ? [cssTypes] : [])];
  const program = ts.createProgram(roots, options);
  assertNoErrors(program);
  return { root, entries, packageVersions, options, roots, program, checker: program.getTypeChecker() };
}

export function assertNoErrors(program, files) {
  const diagnostics = files ? [
    ...program.getOptionsDiagnostics(), ...program.getGlobalDiagnostics(),
    ...files.flatMap((file) => [...program.getSyntacticDiagnostics(file), ...program.getSemanticDiagnostics(file)]),
  ] : ts.getPreEmitDiagnostics(program);
  const errors = diagnostics.filter((item) => item.category === ts.DiagnosticCategory.Error);
  if (errors.length) {
    throw new Error(ts.formatDiagnostics(errors, {
      getCurrentDirectory: () => program.getCurrentDirectory(),
      getCanonicalFileName: (file) => file,
      getNewLine: () => '\n',
    }));
  }
}

export function getExport(context, importPath, name) {
  const sourcePath = context.entries.get(importPath);
  if (!sourcePath) throw new Error(`Not an allowed public entry: ${importPath}`);
  const module = context.checker.getSymbolAtLocation(context.program.getSourceFile(sourcePath));
  if (!module) throw new Error(`Missing public export: ${importPath} → ${name}`);
  const symbol = context.checker.getExportsOfModule(module).find((item) => item.name === name);
  if (!symbol) throw new Error(`Missing public export: ${importPath} → ${name}`);
  return symbol.flags & ts.SymbolFlags.Alias ? context.checker.getAliasedSymbol(symbol) : symbol;
}
