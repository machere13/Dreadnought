import type { ComponentProps, Ref } from 'react';
import { useToolbarItem } from '../../../src/logic.ts';
import { ToolbarAdapter } from '../../../src/unstyled.ts';
import type { ToolbarAdapterProps } from '../../../src/unstyled.ts';

export function Tool({
  value,
  disabled = false,
  itemRef,
  onFocus,
  onKeyDown,
  ...props
}: ComponentProps<'button'> & { value: string; itemRef?: Ref<HTMLButtonElement> }) {
  const { itemProps } = useToolbarItem<HTMLButtonElement>({
    value,
    disabled,
    ref: itemRef,
    onFocus,
    onKeyDown,
  });
  return (
    <button {...props} {...itemProps} disabled={disabled}>
      {props.children ?? value}
    </button>
  );
}
export function ThreeTools(props: ToolbarAdapterProps) {
  return (
    <ToolbarAdapter aria-label="Commands" {...props}>
      <Tool value="save" />
      <Tool value="blocked" disabled />
      <Tool value="copy" />
    </ToolbarAdapter>
  );
}
