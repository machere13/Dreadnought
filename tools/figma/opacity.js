export function createOpacityBinder(
  figma,
  { derived = new Map(), samples = [], repaired = new Set() } = {},
) {
  let resolvedCollection;
  return async function repairOpacity(node, variable) {
    const expected = variable.resolveForConsumer(node).value;
    if (typeof expected !== 'number' || expected < 0 || expected > 1)
      throw new Error('Некорректная CSS opacity: ' + variable.name);
    node.setBoundVariable('opacity', variable);
    if (Math.abs(node.opacity - expected) > 0.0001) {
      if (Math.abs(node.opacity * 100 - expected) > 0.0001)
        throw new Error(`Неизвестная шкала opacity: ${node.name} = ${node.opacity}`);
      let percentage = derived.get(variable.id);
      if (!percentage) {
        const collections = await figma.variables.getLocalVariableCollectionsAsync();
        resolvedCollection = collections.find((c) => c.name === 'Dreadnought / Figma resolved');
        if (!resolvedCollection) {
          resolvedCollection = figma.variables.createVariableCollection(
            'Dreadnought / Figma resolved',
          );
          resolvedCollection.renameMode(resolvedCollection.defaultModeId, 'Default');
        }
        const name = 'Opacity/' + variable.name.split('/').pop();
        percentage = (await figma.variables.getLocalVariablesAsync()).find(
          (v) => v.variableCollectionId === resolvedCollection.id && v.name === name,
        );
        if (percentage && percentage.resolvedType !== 'FLOAT')
          throw new Error('Конфликт вычисляемой opacity');
        if (!percentage)
          percentage = figma.variables.createVariable(name, resolvedCollection, 'FLOAT');
        percentage.scopes = ['OPACITY'];
        percentage.setVariableCodeSyntax('WEB', variable.codeSyntax.WEB);
        percentage.description =
          'Figma percentage conversion of ' +
          variable.codeSyntax.WEB +
          '; source opacity remains 0–1. Resync after source changes.';
        percentage.setValueForMode(resolvedCollection.defaultModeId, expected * 100);
        derived.set(variable.id, percentage);
      }
      node.setBoundVariable('opacity', percentage);
    }
    if (Math.abs(node.opacity - expected) > 0.0001)
      throw new Error(`Opacity не восстановлена: ${node.name}`);
    samples.push({ id: node.id, expected, actual: node.opacity });
    repaired.add(node.id);
  };
}
