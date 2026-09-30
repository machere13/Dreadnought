import ts from 'typescript';
import { getExport } from './compiler.mjs';

function printType(checker, type) {
  const result = checker.typeToString(type, undefined,
    ts.TypeFormatFlags.NoTruncation | ts.TypeFormatFlags.UseAliasDefinedOutsideCurrentScope);
  if (/import\(["'](?:[A-Za-z]:|\/|\.\.)/.test(result)) throw new Error('Internal path leaked into a public type');
  return result;
}

function literalValues(type) {
  const members = (type.isUnion() ? type.types : [type]).filter((item) => !(item.flags & ts.TypeFlags.Undefined));
  if (!members.length || !members.every((item) => item.isStringLiteral() || item.isNumberLiteral())) return undefined;
  return members.map((item) => item.value);
}

export function describeContract(context, binding) {
  const { checker } = context;
  const symbol = getExport(context, binding.importPath, binding.exportName);
  const declaration = symbol.valueDeclaration ?? symbol.declarations?.[0];
  let type = checker.getTypeOfSymbolAtLocation(symbol, declaration);
  for (const member of binding.propertyPath ?? []) {
    const property = checker.getPropertyOfType(type, member);
    if (!property) throw new Error(`Missing public member: ${binding.exportName}.${member}`);
    type = checker.getTypeOfSymbolAtLocation(property, property.valueDeclaration ?? declaration);
  }
  const signatures = type.getCallSignatures();
  if (!signatures.length) throw new Error(`Not a callable export: ${binding.exportName}`);
  // Preserve both overloads and union branches rather than merging their props.
  return signatures.map((signature) => {
    const parameter = signature.parameters[0];
    if (!parameter) throw new Error(`No options parameter: ${binding.exportName}`);
    const input = checker.getNonNullableType(checker.getTypeOfSymbolAtLocation(parameter, declaration));
    const branches = input.isUnion() ? input.types : [input];
    return {
      parameters: signature.parameters.map((parameter) => ({
        name: parameter.name,
        type: printType(checker, checker.getTypeOfSymbolAtLocation(parameter, declaration)),
        optional: Boolean(parameter.flags & ts.SymbolFlags.Optional) || Boolean(parameter.valueDeclaration?.questionToken) || Boolean(parameter.valueDeclaration?.initializer),
      })),
      returnType: printType(checker, checker.getReturnTypeOfSignature(signature)),
      variants: branches.map((branch) => ({
        properties: ((branch.flags & ts.TypeFlags.Object || branch.isIntersection()) && !checker.isArrayType(branch) && !checker.isTupleType(branch) ? checker.getPropertiesOfType(branch) : [])
          .sort((a, b) => a.name < b.name ? -1 : a.name > b.name ? 1 : 0)
          .map((property) => {
            const value = checker.getTypeOfSymbolAtLocation(property, declaration);
            return {
              name: property.name,
              type: printType(checker, value),
              optional: Boolean(property.flags & ts.SymbolFlags.Optional),
              values: literalValues(value),
              origin: property.declarations?.some((node) => node.getSourceFile().fileName.replaceAll('\\', '/').includes('/node_modules/'))
                ? 'dependency' : 'library',
            };
          }),
      })),
    };
  });
}
