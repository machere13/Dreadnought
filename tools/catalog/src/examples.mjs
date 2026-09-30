import path from 'node:path';
import ts from 'typescript';
import { assertNoErrors } from './compiler.mjs';

export function checkExamples(context, examples) {
  const files = new Map();
  for (const [index, example] of examples.entries()) {
    const file = path.join(context.root, '__catalog_examples__', `example-${index}.tsx`);
    if (/@ts-(?:ignore|expect-error|nocheck)/.test(example.code)) throw new Error(`Suppressed type check in example: ${example.id}`);
    const source = ts.createSourceFile(file, example.code, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
    const allowed = new Set([...context.entries.keys(), 'react']);
    function inspect(node) {
      if (ts.isImportDeclaration(node) || ts.isExportDeclaration(node)) {
        if (node.moduleSpecifier && (!ts.isStringLiteral(node.moduleSpecifier) || !allowed.has(node.moduleSpecifier.text))) {
          throw new Error(`Non-public import in example: ${example.id}`);
        }
      }
      if (ts.isCallExpression(node) && (node.expression.kind === ts.SyntaxKind.ImportKeyword || node.expression.getText(source) === 'require')) {
        throw new Error(`Dynamic imports are not supported in catalog examples: ${example.id}`);
      }
      if (ts.isImportTypeNode(node)) throw new Error(`Use a public static type import in example: ${example.id}`);
      ts.forEachChild(node, inspect);
    }
    inspect(source);
    files.set(path.normalize(file), example.code);
  }
  const host = ts.createCompilerHost(context.options);
  const originalRead = host.readFile.bind(host);
  const originalExists = host.fileExists.bind(host);
  const originalSource = host.getSourceFile.bind(host);
  host.readFile = (file) => files.get(path.normalize(file)) ?? originalRead(file);
  host.fileExists = (file) => files.has(path.normalize(file)) || originalExists(file);
  host.getSourceFile = (file, languageVersion, onError, shouldCreateNewSourceFile) => {
    const code = files.get(path.normalize(file));
    return code === undefined ? context.program.getSourceFile(file) ?? originalSource(file, languageVersion, onError, shouldCreateNewSourceFile)
      : ts.createSourceFile(file, code, languageVersion, true, ts.ScriptKind.TSX);
  };
  const program = ts.createProgram([...context.roots, ...files.keys()], context.options, host, context.program);
  assertNoErrors(program, [...files.keys()].map((file) => program.getSourceFile(file)));
}
