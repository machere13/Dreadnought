import { CatalogQueryError } from './errors.mjs';

const error = (code, message, details = {}) => { throw new CatalogQueryError(code, message, details); };

export function getEntry(catalog, component, {binding, section = 'overview', property, includeInherited = false, example} = {}) {
  if (typeof component !== 'string' || !component.trim() || !['overview', 'api', 'examples', 'tokens'].includes(section) ||
      (property !== undefined && (section !== 'api' || typeof property !== 'string' || !property.trim())) ||
      (example !== undefined && (section !== 'examples' || typeof example !== 'string' || !example.trim())) ||
      typeof includeInherited !== 'boolean' || (includeInherited && section !== 'api')) {
    error('INVALID_ARGUMENTS', 'Invalid get arguments');
  }
  const matches = catalog.entries.filter((entry) => entry.id === component || entry.name.toLocaleLowerCase() === component.toLocaleLowerCase());
  if (!matches.length) error('UNKNOWN_COMPONENT', 'Unknown component', {component});
  if (matches.length > 1) error('AMBIGUOUS_COMPONENT', 'Ambiguous component name', {component});
  const entry = matches[0];
  const common = {id: entry.id, name: entry.name, family: entry.family, description: entry.description, docsUrl: entry.docsUrl};
  if (section === 'tokens') {
    if (binding !== undefined) error('INVALID_ARGUMENTS', 'Tokens belong to component, not binding');
    return {scope: 'component', componentId: entry.id, tokens: entry.tokens, parts: entry.parts};
  }
  if (section === 'overview') {
    if (binding !== undefined) error('INVALID_ARGUMENTS', 'Binding is not used for overview');
    return {...common, states: entry.states, parts: entry.parts, constraints: entry.constraints,
      bindings: entry.bindings.map(({id, layer, framework, importPath, exportName, propertyPath, description}) =>
        ({id, layer, framework, importPath, exportName, ...(propertyPath ? {propertyPath} : {}), description}))};
  }
  if (!binding) error('INVALID_ARGUMENTS', 'Binding is required for API and examples');
  const selected = entry.bindings.find((item) => item.id === binding);
  if (!selected) error('UNKNOWN_BINDING', 'Unknown binding', {component, binding});
  const bindingInfo = {id: selected.id, layer: selected.layer, framework: selected.framework,
    importPath: selected.importPath, exportName: selected.exportName,
    ...(selected.propertyPath ? {propertyPath: selected.propertyPath} : {}), description: selected.description};
  if (section === 'examples') {
    const examples = example === undefined ? selected.examples : selected.examples.filter((item) => item.id === example);
    if (example !== undefined && !examples.length) error('UNKNOWN_EXAMPLE', 'Unknown example', {example});
    return {...common, binding: bindingInfo, examples};
  }
  const allProperties = selected.contracts.flatMap((contract) => contract.variants.flatMap((variant) => variant.properties));
  if (property && !allProperties.some((prop) => prop.name === property)) error('UNKNOWN_PROPERTY', 'Unknown property', {property});
  if (property && !includeInherited && allProperties.some((prop) => prop.name === property) &&
      !allProperties.some((prop) => prop.name === property && prop.origin === 'library')) {
    error('PROPERTY_FILTERED', 'Property is inherited; request includeInherited', {property});
  }
  const contracts = selected.contracts.map((contract, overloadIndex) => ({
    overloadIndex, parameters: contract.parameters, returnType: contract.returnType,
    variants: contract.variants.map((variant, variantIndex) => {
      const properties = variant.properties.filter((prop) =>
        (includeInherited || prop.origin === 'library') && (property === undefined || prop.name === property));
      return {variantIndex, propertyPresent: property === undefined ? undefined : properties.length > 0, properties};
    }),
  }));
  return {...common, binding: bindingInfo, propertyDescriptions: selected.propertyDescriptions,
    defaults: selected.defaults, contracts};
}
