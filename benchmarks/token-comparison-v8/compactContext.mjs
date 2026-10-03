export function compactContext(response) {
  if (response.compatibility?.status !== 'compatible' || response.result?.truncated) throw new Error('A complete compatible contract is required');
  return {
    compatibility: response.compatibility,
    imports: [...new Set(response.result.items.map(item => item.binding.importPath))],
    components: response.result.items.map(item => ({
      name: item.name,
      importPath: item.binding.importPath,
      exportName: item.binding.exportName,
      ...(item.parts.length ? {parts: item.parts.map(part => part.propertyPath.join('.'))} : {}),
      ...(item.slots.length ? {slots: item.slots} : {}),
      example: item.example?.code,
      // Preserve overload and union boundaries. '?' encodes optional, as in TypeScript.
      contracts: item.variants?.map(overload => overload.map(variant => Object.fromEntries(variant.map(property => [property.name + (property.required ? '' : '?'),property.type])))),
    })),
  };
}

