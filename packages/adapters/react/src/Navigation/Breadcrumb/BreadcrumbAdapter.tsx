import type { ComponentPropsWithRef, ReactNode } from 'react';

export type BreadcrumbItem = {
  label: ReactNode;
  href?: string;
};

export type BreadcrumbSlotClassNames = Partial<
  Record<'list' | 'item' | 'link' | 'current', string>
>;

export type BreadcrumbAdapterProps = Omit<ComponentPropsWithRef<'nav'>, 'children'> & {
  items: readonly BreadcrumbItem[];
  slotClassNames?: BreadcrumbSlotClassNames;
};

export function BreadcrumbAdapter({
  items,
  slotClassNames,
  'aria-label': ariaLabel = 'Breadcrumb',
  ref,
  ...navProps
}: BreadcrumbAdapterProps) {
  if (items.length === 0) {
    return null;
  }

  return (
    <nav {...navProps} ref={ref} aria-label={ariaLabel} data-ui="breadcrumb">
      <ol className={slotClassNames?.list}>
        {items.map(({ label, href }, index) => {
          const isCurrent = index === items.length - 1;
          return (
            <li key={index} className={slotClassNames?.item}>
              {href != null ? (
                <a
                  href={href}
                  aria-current={isCurrent ? 'page' : undefined}
                  className={[slotClassNames?.link, isCurrent && slotClassNames?.current]
                    .filter(Boolean)
                    .join(' ')}
                >
                  {label}
                </a>
              ) : (
                <span
                  aria-current={isCurrent ? 'page' : undefined}
                  className={isCurrent ? slotClassNames?.current : undefined}
                >
                  {label}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
