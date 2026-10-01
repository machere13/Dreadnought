export function makeCatalog() {
  return {
    schemaVersion: 1,
    packageVersions: {
      '@dreadnought/core': '0.1.0',
      '@dreadnought/react': '0.1.0',
      '@dreadnought/ui': '0.1.0',
      '@dreadnought/themes': '0.1.0',
    },
    entries: [{
      id: 'component:button', kind: 'component', name: 'Button', family: 'Controls',
      description: 'Кнопка действия', docsUrl: '/components/button/#button-api',
      states: [], parts: [], constraints: [], tokens: [],
      bindings: [{
        id: 'react-ui', layer: 3, framework: 'react',
        importPath: '@dreadnought/ui/react', exportName: 'Button',
        description: 'Готовая кнопка', propertyDescriptions: {}, defaults: {}, examples: [],
        contracts: [{parameters: [], returnType: 'ReactNode', variants: [{properties: []}]}],
      }],
    }],
  };
}
