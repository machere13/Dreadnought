import { describeContract, getSignatures } from './contracts.mjs';
import { checkExamples } from './examples.mjs';
import { readComponentTokens } from './tokens.mjs';
import { usageExamples } from './usageExamples.mjs';

function nonempty(value, label) {
  if (typeof value !== 'string' || !value.trim()) throw new Error(`Missing ${label}`);
}

function unique(items, label) {
  const ids = new Set();
  for (const item of items) {
    nonempty(item.id, `${label} id`);
    if (ids.has(item.id)) throw new Error(`Duplicate ${label} id: ${item.id}`);
    ids.add(item.id);
  }
}

export function generateCatalog(context, metadata) {
  unique(metadata, 'entry');
  const examples = [];
  const defaultChecks = [];
  const entries = metadata.map((entry) => {
    nonempty(entry.name, 'name');
    nonempty(entry.description, 'description');
    nonempty(entry.family, 'family');
    if (!['component', 'action', 'behavior', 'domain'].includes(entry.kind)) throw new Error(`Unsupported catalog kind: ${entry.kind}`);
    const namePattern = entry.kind === 'component' ? /^[A-Z][A-Za-z0-9]*$/ : /^[A-Za-z][A-Za-z0-9]*$/;
    if (!namePattern.test(entry.name) || !/^[A-Z][A-Za-z0-9]*$/.test(entry.family)) throw new Error('Invalid catalog name or family');
    if (!/^\/[a-z0-9/-]+\/#[-a-z0-9]+$/.test(entry.docsUrl)) throw new Error(`Invalid documentation URL: ${entry.docsUrl}`);
    if (!entry.bindings?.length) throw new Error(`Missing bindings: ${entry.id}`);
    unique(entry.bindings, 'binding');
    const bindings = entry.bindings.map((binding) => {
      if (![1, 2, 3].includes(binding.layer)) throw new Error(`Invalid layer: ${binding.id}`);
      if (entry.kind !== 'component' && (binding.layer !== 1 || binding.framework !== null)) throw new Error(`Core capability must use layer 1: ${entry.id}`);
      if (binding.framework !== null && binding.framework !== 'react') throw new Error(`Unsupported framework: ${binding.id}`);
      if (binding.propertyPath && (!Array.isArray(binding.propertyPath) || binding.propertyPath.some((member) => typeof member !== 'string' || !/^[A-Za-z][A-Za-z0-9]*$/.test(member)))) throw new Error(`Invalid property path: ${binding.id}`);
      const contracts = describeContract(context, binding);
      const propertyNames = new Set(contracts.flatMap((contract) => contract.variants.flatMap((variant) => variant.properties.map((prop) => prop.name))));
      for (const [name, description] of Object.entries(binding.propertyDescriptions ?? {})) {
        if (!propertyNames.has(name)) throw new Error(`Unknown property metadata: ${binding.exportName}.${name}`);
        nonempty(description, `description of ${name}`);
      }
      for (const [name, value] of Object.entries(binding.defaults ?? {})) {
        if (!propertyNames.has(name)) throw new Error(`Unknown default property: ${binding.exportName}.${name}`);
        defaultChecks.push({
          id: `${entry.id}/${binding.id}/default:${name}`,
          binding, parameterIndex: 0, propertyName: name,
          code: `import { ${binding.exportName} } from '${binding.importPath}';\nconst value: NonNullable<Parameters<typeof ${[binding.exportName, ...(binding.propertyPath ?? [])].join('.')}>[0]>[${JSON.stringify(name)}] = ${JSON.stringify(value)};`,
        });
      }
      const parameterDefaults = binding.parameterDefaults ?? {};
      if (typeof parameterDefaults !== 'object' || Array.isArray(parameterDefaults)) throw new Error('Invalid parameter defaults');
      for (const [index, defaults] of Object.entries(parameterDefaults)) {
        if (!/^(0|[1-9]\d*)$/.test(index)) throw new Error(`Invalid parameter index: ${index}`);
        if (!defaults || typeof defaults !== 'object' || Array.isArray(defaults)) throw new Error(`Invalid parameter defaults: ${index}`);
        for (const contract of contracts) {
          const parameter = contract.parameters[Number(index)];
          if (!parameter) throw new Error(`Unknown parameter: ${binding.exportName}[${index}]`);
          const properties = (Number(index) === 0 ? contract.variants : parameter.variants ?? [])
            .flatMap(variant => variant.properties);
          for (const name of Object.keys(defaults)) {
            if (!properties.some(property => property.name === name)) throw new Error(`Unknown parameter default: ${binding.exportName}[${index}].${name}`);
          }
          parameter.defaults = defaults;
        }
        for (const [name, value] of Object.entries(defaults)) {
          defaultChecks.push({
            id: `${entry.id}/${binding.id}/parameter:${index}/default:${name}`,
            binding, parameterIndex: Number(index), propertyName: name,
            code: `import { ${binding.exportName} } from '${binding.importPath}';\nconst value: NonNullable<Parameters<typeof ${[binding.exportName, ...(binding.propertyPath ?? [])].join('.')}>[${index}]>[${JSON.stringify(name)}] = ${JSON.stringify(value)};`,
          });
        }
      }
      const bindingExamples = [...(binding.examples ?? [])];
      if (binding.id === 'react-ui' && usageExamples[entry.name] && !bindingExamples.some(example => example.id === 'usage')) {
        bindingExamples.unshift({id: 'usage', code: usageExamples[entry.name]});
      }
      for (const example of bindingExamples) {
        nonempty(example.id, 'example id');
        nonempty(example.code, 'example code');
        examples.push({ ...example, id: `${entry.id}/${binding.id}/${example.id}` });
      }
      return {
        id: binding.id, layer: binding.layer, framework: binding.framework,
        importPath: binding.importPath, exportName: binding.exportName,
        ...(binding.propertyPath ? { propertyPath: binding.propertyPath } : {}),
        description: binding.description ?? entry.description,
        propertyDescriptions: binding.propertyDescriptions ?? {}, defaults: binding.defaults ?? {},
        examples: bindingExamples, contracts,
      };
    });
    return {
      id: entry.id, kind: entry.kind, name: entry.name, family: entry.family,
      description: entry.description, docsUrl: entry.docsUrl,
      states: entry.states ?? [], parts: entry.parts ?? [], constraints: entry.constraints ?? [],
      ...(entry.composesWith ? {composesWith: entry.composesWith} : {}),
      tokens: entry.kind === 'component' && bindings.some(binding => binding.layer === 3)
        ? readComponentTokens(context.root, entry.family, entry.name) : [], bindings,
    };
  });
  const ids = new Set(entries.map(entry => entry.id));
  for (const entry of entries) {
    if (entry.composesWith !== undefined && (!Array.isArray(entry.composesWith) ||
      entry.composesWith.some(id => !ids.has(id)))) throw new Error(`Unknown composition reference: ${entry.id}`);
  }
  unique(examples, 'example');
  const program = checkExamples(context, [...examples, ...defaultChecks]);
  const checker = program.getTypeChecker();
  const sources = new Map(program.getSourceFiles().map(source => [source.text, source]));
  for (const check of defaultChecks) {
    const source = sources.get(check.code);
    const initializer = source.statements[1].declarationList.declarations[0].initializer;
    const valueType = checker.getTypeAtLocation(initializer);
    const { signatures, declaration } = getSignatures({ ...context, program, checker }, check.binding);
    for (const [index, signature] of signatures.entries()) {
      const parameter = signature.parameters[check.parameterIndex];
      const type = parameter && checker.getNonNullableType(checker.getTypeOfSymbolAtLocation(parameter, declaration));
      const property = type && checker.getPropertyOfType(type, check.propertyName);
      if (!property || !checker.isTypeAssignableTo(valueType, checker.getTypeOfSymbolAtLocation(property, declaration))) {
        throw new Error(`Default not assignable to overload ${index + 1}: ${check.id}`);
      }
    }
  }
  return {
    schemaVersion: 1,
    packageVersions: context.packageVersions,
    entries: entries.sort((a, b) => a.id < b.id ? -1 : a.id > b.id ? 1 : 0),
  };
}
