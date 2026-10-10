import { Children, isValidElement } from 'react';
import type { ComponentPropsWithRef, ReactNode } from 'react';

export type CardAdapterProps = Omit<ComponentPropsWithRef<'div'>, 'title'> & {
  title?: ReactNode;
  extra?: ReactNode;
  cover?: ReactNode;
  footer?: ReactNode;
  actions?: readonly ReactNode[];
  slotClassNames?: Partial<
    Record<
      'header' | 'title' | 'extra' | 'body' | 'cover' | 'footer' | 'actions' | 'action',
      string
    >
  >;
};

export function CardAdapter({
  title,
  extra,
  cover,
  footer,
  actions,
  children,
  slotClassNames,
  ...props
}: CardAdapterProps) {
  const hasTitle = title != null && title !== false;
  const hasExtra = extra != null && extra !== false;
  const hasHeader = hasTitle || hasExtra;
  const hasCover = cover != null && cover !== false;
  const hasFooter = footer != null && footer !== false;
  const actionItems = Children.toArray(actions);
  const hasSections = hasHeader || hasCover || hasFooter || actionItems.length > 0;

  return (
    <div {...props} data-ui="card" data-has-header={hasHeader} data-has-sections={hasSections}>
      {hasCover && (
        <div data-slot="cover" className={slotClassNames?.cover}>
          {cover}
        </div>
      )}
      {hasHeader && (
        <div data-slot="header" className={slotClassNames?.header}>
          {hasTitle && (
            <div data-slot="title" className={slotClassNames?.title}>
              {title}
            </div>
          )}
          {hasExtra && (
            <div data-slot="extra" className={slotClassNames?.extra}>
              {extra}
            </div>
          )}
        </div>
      )}
      {hasSections ? (
        <div data-slot="body" className={slotClassNames?.body}>
          {children}
        </div>
      ) : (
        children
      )}
      {hasFooter && (
        <div data-slot="footer" className={slotClassNames?.footer}>
          {footer}
        </div>
      )}
      {actionItems.length > 0 && (
        <ul data-slot="actions" className={slotClassNames?.actions}>
          {actionItems.map((action, index) => (
            <li
              key={isValidElement(action) ? action.key : index}
              data-slot="action"
              className={slotClassNames?.action}
            >
              {action}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
