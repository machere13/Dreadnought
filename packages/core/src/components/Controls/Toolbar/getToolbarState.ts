import type { ToolbarCore, ToolbarCoreOptions } from './ToolbarCore.ts';

export function getToolbarState({
  items,
  activeValue,
  navigation = 'roving',
  orientation = 'horizontal',
}: ToolbarCoreOptions): ToolbarCore {
  const keys = new Set<string>();
  for (const { value } of items) {
    if (!value.trim()) {
      throw new Error('Toolbar item value must not be empty.');
    }
    if (keys.has(value)) {
      throw new Error(`Duplicate Toolbar item value: ${value}`);
    }
    keys.add(value);
  }
  const enabled = items.filter((item) => !item.disabled);
  return {
    role: navigation === 'roving' ? 'toolbar' : 'group',
    ariaOrientation: navigation === 'roving' ? orientation : undefined,
    tabStopValue:
      navigation === 'native'
        ? undefined
        : (enabled.find((item) => item.value === activeValue)?.value ?? enabled[0]?.value),
  };
}
