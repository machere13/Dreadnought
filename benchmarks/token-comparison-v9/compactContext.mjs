export function compactContext(response) {
  if (response.compatibility?.status !== 'compatible' || response.result?.truncated) throw new Error('Complete compatible source required');
  return {
    mode:'examples; request MCP get for additional API details',
    compatibility: response.compatibility,
    components: response.result.items.map(item => ({name:item.name,importPath:item.binding.importPath,exportName:item.binding.exportName,example:item.example.code})),
  };
}

