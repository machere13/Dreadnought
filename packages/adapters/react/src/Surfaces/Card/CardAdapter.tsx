import type { ComponentPropsWithRef, ReactNode } from 'react';

export type CardAdapterProps = Omit<ComponentPropsWithRef<'div'>, 'title'> & {
  title?: ReactNode;
  extra?: ReactNode;
  slotClassNames?: Partial<Record<'header' | 'title' | 'extra' | 'body', string>>;
};

export function CardAdapter({
  title,
  extra,
  children,
  slotClassNames,
  ...props
}: CardAdapterProps) {
  const hasTitle = title != null && title !== false;
  const hasExtra = extra != null && extra !== false;
  const hasHeader = hasTitle || hasExtra;

  return (
    <div {...props} data-ui="card" data-has-header={hasHeader}>
      {hasHeader ? <>
        <div data-slot="header" className={slotClassNames?.header}>
          {hasTitle && <div data-slot="title" className={slotClassNames?.title}>{title}</div>}
          {hasExtra && <div data-slot="extra" className={slotClassNames?.extra}>{extra}</div>}
        </div>
        <div data-slot="body" className={slotClassNames?.body}>{children}</div>
      </> : children}
    </div>
  );
}
