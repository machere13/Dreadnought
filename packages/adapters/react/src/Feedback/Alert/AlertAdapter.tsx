import { useState, type ComponentPropsWithRef, type MouseEvent, type ReactNode } from 'react';

export type AlertType = 'info' | 'success' | 'warning' | 'error';

type AlertContent =
  | { title: ReactNode; description?: ReactNode }
  | { title?: ReactNode; description: ReactNode };

export type AlertSlotClassNames = Partial<Record<'icon' | 'title' | 'description' | 'actions' | 'close', string>>;

export type AlertCloseOptions = {
  closeIcon?: ReactNode;
  onClose?: (event: MouseEvent<HTMLButtonElement>) => void;
  'aria-label'?: string;
};

export type AlertAdapterProps = Omit<ComponentPropsWithRef<'div'>, 'title' | 'children'> &
  AlertContent & {
    type?: AlertType;
    action?: ReactNode;
    showIcon?: boolean;
    icon?: ReactNode;
    closable?: boolean | AlertCloseOptions;
    slotClassNames?: AlertSlotClassNames;
  };

export function AlertAdapter({
  title,
  description,
  action,
  type = 'info',
  showIcon = false,
  icon,
  closable,
  slotClassNames,
  role,
  className,
  ref,
  ...rootProps
}: AlertAdapterProps) {
  const [closed, setClosed] = useState(false);
  const closeOptions = typeof closable === 'object' ? closable : undefined;

  if (closed) return null;

  return (
    <div
      {...rootProps}
      ref={ref}
      role={role ?? (type === 'warning' || type === 'error' ? 'alert' : 'status')}
      className={className}
      data-ui="alert"
      data-type={type}
    >
      {showIcon && icon != null && <span data-slot="icon" className={slotClassNames?.icon} aria-hidden="true">{icon}</span>}
      {title != null && <div data-slot="title" className={slotClassNames?.title}>{title}</div>}
      {description != null && <div data-slot="description" className={slotClassNames?.description}>{description}</div>}
      {action != null && <div data-slot="actions" className={slotClassNames?.actions}>{action}</div>}
      {closable && (
        <button
          type="button"
          data-slot="close"
          className={slotClassNames?.close}
          aria-label={closeOptions?.['aria-label'] ?? 'Close alert'}
          onClick={(event) => {
            closeOptions?.onClose?.(event);
            setClosed(true);
          }}
        >
          {closeOptions?.closeIcon ?? 'Close'}
        </button>
      )}
    </div>
  );
}
