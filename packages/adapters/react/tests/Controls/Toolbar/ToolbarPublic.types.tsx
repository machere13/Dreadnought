import { createRef } from 'react';
import { useToolbarItem } from '@dreadnought/react/logic';
import { ToolbarAdapter } from '@dreadnought/react/unstyled';

function Tool() {
  const { itemProps } = useToolbarItem<HTMLButtonElement>({
    value: 'save',
    ref: createRef<HTMLButtonElement>(),
    onFocus: (event) => event.currentTarget.focus(),
  });
  return <button {...itemProps}>Save</button>;
}
<ToolbarAdapter
  ref={createRef<HTMLDivElement>()}
  navigation="roving"
  orientation="vertical"
  loop={false}
  aria-label="Commands"
  onClick={(event) => event.currentTarget.focus()}
>
  <Tool />
</ToolbarAdapter>;
// @ts-expect-error Unsupported navigation mode.
<ToolbarAdapter navigation="auto" />;
// @ts-expect-error Unsupported orientation.
<ToolbarAdapter orientation="diagonal" />;
// @ts-expect-error Participant keys are strings.
useToolbarItem({ value: 5 });
// @ts-expect-error A button participant cannot receive an input ref.
useToolbarItem<HTMLButtonElement>({ value: 'save', ref: createRef<HTMLInputElement>() });
