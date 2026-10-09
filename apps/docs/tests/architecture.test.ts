// @vitest-environment node
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';
import { expect, it } from 'vitest';

const root = fileURLToPath(new URL('../src/', import.meta.url));

function dependencies(entry: string, visited = new Set<string>()) {
  const file = path.resolve(root, entry);
  if (visited.has(file)) return visited;
  visited.add(file);
  if (!/\.(tsx?|astro)$/.test(file)) return visited;
  const text = readFileSync(file, 'utf8');
  const source = file.endsWith('.astro') ? text.split('---')[1] : text;
  const ast = ts.createSourceFile(file, source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  for (const node of ast.statements) {
    if (!ts.isImportDeclaration(node) && !ts.isExportDeclaration(node)) continue;
    if (ts.isImportDeclaration(node) && node.importClause?.isTypeOnly) continue;
    if (ts.isExportDeclaration(node) && node.isTypeOnly) continue;
    if (!node.moduleSpecifier || !ts.isStringLiteral(node.moduleSpecifier)) continue;
    const specifier = node.moduleSpecifier.text;
    if (!specifier.startsWith('.')) continue;
    const target = path.resolve(path.dirname(file), specifier);
    const resolved = [target, target + '.ts', target + '.tsx'].find(existsSync);
    expect(resolved, `${file}: ${specifier}`).toBeTruthy();
    dependencies(path.relative(root, resolved!), visited);
  }
  return visited;
}

it('keeps navigation and sidebar independent of component documents', () => {
  for (const entry of ['app/navigation.ts', 'app/Sidebar.tsx']) {
    const files = [...dependencies(entry)];
    expect(files.filter(file => file.includes(path.join('content', 'components')))).toEqual([]);
  }
});

it('loads only the requested document through each component route', () => {
  const routes = readdirSync(path.join(root, 'pages/components'))
    .filter(component => existsSync(path.join(root, 'pages/components', component, 'index.astro')));
  expect(routes).toHaveLength(37);
  for (const component of routes) {
    const files = [...dependencies(`pages/components/${component}/index.astro`)];
    const docs = files.filter(file => /Doc\.tsx$/.test(file));
    expect(docs, component).toHaveLength(1);
    expect(path.basename(docs[0]).toLowerCase()).toBe(`${component}doc.tsx`);
    expect(files.filter(file => file.includes(path.join('scripts', 'catalog')))).toEqual([]);
  }
});

it('keeps the shell free of page selection and runtime build tools', () => {
  const files = [...dependencies('app/DocsShell.tsx')];
  expect(files.filter(file => file.includes(path.join('content', 'components')))).toEqual([]);
  expect(files.filter(file => file.includes(path.join('scripts', 'catalog')))).toEqual([]);
});
