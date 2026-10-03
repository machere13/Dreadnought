function primitiveChoices(variants) {
  const choices = new Map();
  for (const property of variants.flat(2)) {
    const types = property.type.split(/\s+\|\s+/);
    if (!types.every(type => /^("[^"]*"|undefined|boolean|string|number)$/.test(type))) continue;
    const values = choices.get(property.name) ?? new Set();
    types.forEach(type => values.add(type));
    choices.set(property.name, values);
  }
  return Object.fromEntries([...choices].filter(([, values]) => !(values.size === 1 && values.has('undefined'))).map(([name, values]) => [name,[...values].join(' | ')]));
}

export function compactContext(response) {
  if (response.compatibility?.status !== 'compatible' || response.result?.truncated) throw new Error('Complete compatible source required');
  return {
    mode:'usage examples and primitive prop choices; MCP get for additional API details',
    compatibility:response.compatibility,
    components:response.result.items.map(item => ({
      name:item.name, importPath:item.binding.importPath, exportName:item.binding.exportName,
      example:item.example.code,
      props:primitiveChoices(item.variants),
    })),
  };
}
