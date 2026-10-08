import { useState, useSyncExternalStore } from 'react';
import { LayoutSidebarAdapter } from '@dreadnought/react/unstyled';
import type { LayoutSidebarAdapterProps } from '@dreadnought/react/unstyled';
import { layoutPresentation } from '#presentation/Layout/Layout/layoutPresentation.ts';
import { Icon } from '../../DataDisplay/Icon/Icon.tsx';

export type LayoutSidebarProps = LayoutSidebarAdapterProps;

const mobileQuery = '(max-width: 40rem)';

function isMobile() {
  return (
    typeof window !== 'undefined' &&
    typeof window.matchMedia === 'function' &&
    window.matchMedia(mobileQuery).matches
  );
}

function subscribeToViewportChange(onChange: () => void) {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
    return () => {};
  }
  const media = window.matchMedia(mobileQuery);
  media.addEventListener('change', onChange);
  return () => media.removeEventListener('change', onChange);
}

export function LayoutSidebar({
  className,
  slotClassNames,
  triggerIcon,
  collapsed,
  defaultCollapsed,
  onCollapsedChange,
  ...props
}: LayoutSidebarProps) {
  const mobile = useSyncExternalStore(subscribeToViewportChange, isMobile, () => false);
  const [manualState, setManualState] = useState<{ mobile: boolean; collapsed: boolean } | null>(
    null,
  );
  const isCollapsed =
    collapsed ??
    (manualState?.mobile === mobile ? manualState.collapsed : (defaultCollapsed ?? mobile));

  function handleCollapsedChange(next: boolean) {
    if (collapsed === undefined) {
      setManualState({ mobile, collapsed: next });
    }
    onCollapsedChange?.(next);
  }

  return (
    <LayoutSidebarAdapter
      {...props}
      collapsed={isCollapsed}
      onCollapsedChange={handleCollapsedChange}
      data-mobile={mobile}
      triggerIcon={triggerIcon ?? <Icon name="menu" />}
      className={[layoutPresentation.sidebar, className].filter(Boolean).join(' ')}
      slotClassNames={{
        body: [layoutPresentation.body, slotClassNames?.body].filter(Boolean).join(' '),
        trigger: [layoutPresentation.trigger, slotClassNames?.trigger].filter(Boolean).join(' '),
      }}
    />
  );
}
