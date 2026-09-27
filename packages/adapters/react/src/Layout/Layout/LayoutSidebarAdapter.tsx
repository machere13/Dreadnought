import { useId, useState, type ComponentPropsWithRef } from 'react';

export type LayoutSidebarSlotClassNames = Partial<Record<'body' | 'trigger', string>>;

export type LayoutSidebarAdapterProps = ComponentPropsWithRef<'aside'> & {
  collapsed?: boolean;
  defaultCollapsed?: boolean;
  onCollapsedChange?: (next: boolean) => void;
  expandLabel?: string;
  collapseLabel?: string;
  slotClassNames?: LayoutSidebarSlotClassNames;
};

export function LayoutSidebarAdapter({
  collapsed,
  defaultCollapsed = false,
  onCollapsedChange,
  expandLabel = 'Expand sidebar',
  collapseLabel = 'Collapse sidebar',
  slotClassNames,
  children,
  ref,
  ...asideProps
}: LayoutSidebarAdapterProps) {
  const [internalCollapsed, setInternalCollapsed] = useState(defaultCollapsed);
  const isCollapsed = collapsed !== undefined ? collapsed : internalCollapsed;
  const bodyId = useId();

  function toggle() {
    const next = !isCollapsed;
    if (collapsed === undefined) setInternalCollapsed(next);
    onCollapsedChange?.(next);
  }

  return <aside {...asideProps} ref={ref} data-ui="layout-sidebar" data-collapsed={isCollapsed}>
    <button type="button" data-slot="trigger" className={slotClassNames?.trigger}
      aria-controls={bodyId} aria-expanded={!isCollapsed} onClick={toggle}>
      {isCollapsed ? expandLabel : collapseLabel}
    </button>
    <div id={bodyId} data-slot="body" className={slotClassNames?.body} hidden={isCollapsed}>
      {children}
    </div>
  </aside>;
}
