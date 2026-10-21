export function mockFigma(opacityScale = 1) {
  let next = 0;
  const collections = [],
    variables = [],
    styles = [];
  const page = { id: '1161:2', name: '1 module', children: [], findAllWithCriteria: () => [] };
  const node = (name, type = 'FRAME', children = []) => ({
    id: String(++next),
    name,
    type,
    children,
    opacity: 1,
    findAllWithCriteria: ({ types }) =>
      children
        .flatMap((child) => [child, ...child.findAllWithCriteria({ types })])
        .filter((child) => types.includes(child.type)),
    setBoundVariable(field, variable) {
      (this.boundVariables ||= {})[field] = { id: variable.id };
      if (field === 'opacity')
        this.opacity = variable.resolveForConsumer(this).value / opacityScale;
    },
  });
  const api = {
    fileKey: 'wpjgUf13LJaogeTFapW8w9',
    root: { children: [page] },
    setCurrentPageAsync: async () => {},
    viewport: { scrollAndZoomIntoView() {} },
    listAvailableFontsAsync: async () =>
      ['Regular', 'SemiBold', 'Bold'].map((style) => ({
        fontName: { family: 'Roboto Flex', style },
      })),
    loadFontAsync: async () => {},
    getLocalTextStylesAsync: async () => styles,
    createTextStyle() {
      const style = { id: String(++next), setBoundVariable() {} };
      styles.push(style);
      return style;
    },
    variables: {
      getLocalVariableCollectionsAsync: async () => collections,
      getLocalVariablesAsync: async () => variables,
      createVariableCollection(name) {
        const collection = {
          id: String(++next),
          name,
          defaultModeId: 'default',
          modes: [{ modeId: 'default', name: 'Mode 1' }],
          renameMode(id, name) {
            this.modes.find((m) => m.modeId === id).name = name;
          },
        };
        collections.push(collection);
        return collection;
      },
      createVariable(name, collection, resolvedType) {
        const variable = {
          id: String(++next),
          name,
          resolvedType,
          variableCollectionId: collection.id,
          codeSyntax: {},
          valuesByMode: {},
          setVariableCodeSyntax(platform, value) {
            this.codeSyntax[platform] = value;
          },
          setValueForMode(mode, value) {
            this.valuesByMode[mode] = value;
          },
          resolveForConsumer(node) {
            const value = this.valuesByMode.default;
            return value?.type === 'VARIABLE_ALIAS'
              ? variables.find((v) => v.id === value.id).resolveForConsumer(node)
              : { value };
          },
        };
        variables.push(variable);
        return variable;
      },
      createVariableAlias: (variable) => ({ type: 'VARIABLE_ALIAS', id: variable.id }),
      setBoundVariableForPaint: (paint, field, variable) => ({
        ...paint,
        boundVariables: { [field]: { id: variable.id } },
      }),
    },
  };
  return { api, page, node, collections, variables, styles };
}
