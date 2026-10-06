export const packages = [
  { name: '@dreadnought/core', directory: 'packages/core', entrypoints: ['.'], layer: 1, framework: null },
  { name: '@dreadnought/react', directory: 'packages/adapters/react', entrypoints: ['./logic', './unstyled'], layer: 2, framework: 'react' },
  { name: '@dreadnought/ui', directory: 'packages/ui', entrypoints: ['./react'], layer: 3, framework: 'react' },
  { name: '@dreadnought/themes', directory: 'packages/themes', entrypoints: [] },
];

// Explicit inputs: adding a file elsewhere never publishes it automatically.
const core = 'packages/core/src/components';
const adapter = 'packages/adapters/react/src';
const ui = 'packages/ui/src/adapters/react/components';
export const components = [
  { family: 'DataDisplay', name: 'MarkdownPreview', sources: [adapter, ui] },
  { family: 'Fields', name: 'MarkdownEditor', sources: [adapter, ui] },
  { family: 'Feedback', name: 'Toast', sources: [core, adapter, ui] },
  { family: 'Feedback', name: 'Loader', sources: [core, adapter, ui] },
  { family: 'Overlays', name: 'Tooltip', sources: [core, adapter, ui] },
  { family: 'Overlays', name: 'Popover', sources: [core, adapter, ui] },
  { family: 'Overlays', name: 'Modal', sources: [core, adapter, ui] },
  { family: 'Overlays', name: 'Drawer', sources: [core, adapter, ui] },
  { family: 'Visualization', name: 'RadarChart', sources: [adapter, ui] },
  { family: 'Visualization', name: 'LineChart', sources: [adapter, ui] },
  { family: 'Visualization', name: 'BarChart', sources: [adapter, ui] },
  { family: 'Controls', name: 'Button', sources: [core, adapter, ui] },
  { family: 'Controls', name: 'Toolbar', sources: [core, adapter, ui] },
  { family: 'Fields', name: 'Input', sources: [core, adapter, ui] },
  { family: 'Fields', name: 'TextArea', sources: [core, adapter, ui] },
  { family: 'Fields', name: 'Checkbox', sources: [core, adapter, ui] },
  { family: 'Fields', name: 'Radio', sources: [core, adapter, ui] },
  { family: 'Fields', name: 'Select', sources: [core, adapter, ui] },
  { family: 'DataDisplay', name: 'Table', sources: [core, adapter, ui] },
  { family: 'DataDisplay', name: 'Badge', sources: [adapter, ui] },
  { family: 'Surfaces', name: 'Card', sources: [adapter, ui] },
  { family: 'Navigation', name: 'Tabs', sources: [core, adapter, ui] },
  { family: 'Navigation', name: 'Menu', sources: [adapter, ui] },
  { family: 'Navigation', name: 'Accordion', sources: [core, adapter, ui] },
  { family: 'DataDisplay', name: 'CodeBlock', sources: [adapter, ui] },
  { family: 'Feedback', name: 'Alert', sources: [adapter, ui] },
  { family: 'Layout', name: 'Layout', sources: [adapter, ui] },
  { family: 'Navigation', name: 'Breadcrumb', sources: [adapter, ui] },
  { family: 'DataDisplay', name: 'Icon', sources: [adapter, ui] },
  { family: 'DataDisplay', name: 'Mark', sources: [adapter, ui] },
];

export const capabilitySources = ['packages/core/src/actions/catalog.json', 'packages/core/src/behaviors/catalog.json', 'packages/core/src/domains/charts/catalog.json', 'packages/core/src/domains/markdown/catalog.json'];
