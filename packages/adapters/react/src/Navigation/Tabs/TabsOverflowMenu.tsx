import { useTabsContext } from './TabsContext.tsx';
import type { RegisteredTab } from './TabsContext.tsx';
import type { TabsListAdapterProps } from './TabsListAdapter.tsx';
import { DropdownAdapter } from '../Dropdown/DropdownAdapter.tsx';

export function TabsOverflowMenu({
  tabs,
  revealTab,
  label,
  slotProps,
}: {
  tabs: RegisteredTab[];
  revealTab: (element: HTMLButtonElement) => void;
  label: string;
  slotProps: NonNullable<TabsListAdapterProps['slotProps']>;
}) {
  const context = useTabsContext();
  const { onToggle, ...menuProps } = slotProps.menu ?? {};
  const menu = { ...menuProps, 'data-slot': 'more-menu' };
  return (
    <DropdownAdapter
      placement="bottomRight"
      initialFocus="first"
      disabled={slotProps.more?.disabled}
      aria-label={label}
      style={{
        padding: 0,
        border: 0,
        background: 'transparent',
        color: 'inherit',
        overflow: 'visible',
      }}
      onToggle={onToggle}
      items={tabs.map((tab) => ({
        value: tab.value,
        label: tab.label,
        disabled: tab.disabled,
        ariaLabel: tab.element.getAttribute('aria-label') ?? undefined,
      }))}
      selectedValue={context.value}
      menuProps={{
        ...menu,
        role: 'menu',
        'aria-label': label,
        slotProps: { item: slotProps.item },
      }}
      onAction={(value) => {
        const tab = tabs.find((tab) => tab.value === value)!;
        context.setValue(value);
        revealTab(tab.element);
        tab.element.focus({ preventScroll: true });
      }}
    >
      {(trigger) => (
        <button
          {...slotProps.more}
          {...trigger}
          id={slotProps.more?.id ?? trigger.id}
          data-slot="more"
          aria-label={label}
          onClick={(event) => {
            slotProps.more?.onClick?.(event);
            if (event.defaultPrevented) return;
            event.preventDefault();
            trigger.onClick?.(event);
          }}
          onKeyDown={(event) => {
            slotProps.more?.onKeyDown?.(event);
            trigger.onKeyDown?.(event);
          }}
        >
          {slotProps.more?.children ?? '…'}
        </button>
      )}
    </DropdownAdapter>
  );
}
