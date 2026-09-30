export const packages = [
  { directory: 'packages/core', entrypoints: ['.'] },
  { directory: 'packages/adapters/react', entrypoints: ['./logic', './unstyled'] },
  { directory: 'packages/ui', entrypoints: ['./react'] },
  { directory: 'packages/themes', entrypoints: [] },
];

// Explicit inputs: adding a file elsewhere never publishes it automatically.
export const components = [
  { family: 'Controls', name: 'Button' },
  { family: 'Fields', name: 'Input' },
];
