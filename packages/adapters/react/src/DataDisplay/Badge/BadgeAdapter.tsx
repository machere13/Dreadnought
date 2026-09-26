import type { ComponentPropsWithRef, ReactElement, ReactNode } from 'react';

export type BadgeAdapterProps = Omit<ComponentPropsWithRef<'span'>, 'children'> & {
  children: ReactNode;
  target?: ReactElement;
  icon?: ReactNode;
  iconPosition?: 'start' | 'end';
};

export function BadgeAdapter({
  children,
  target,
  icon,
  iconPosition = 'start',
  ref,
  className,
  ...rootProps
}: BadgeAdapterProps) {
  const badgeContent = <>
    {iconPosition === 'start' && icon != null && <span data-slot="icon" aria-hidden="true">{icon}</span>}
    <span data-slot="label">{children}</span>
    {iconPosition === 'end' && icon != null && <span data-slot="icon" aria-hidden="true">{icon}</span>}
  </>;
  const hasTarget = target !== undefined;

  return (
    <span
      {...rootProps}
      ref={ref}
      className={className}
      data-ui="badge"
      data-mode={hasTarget ? 'overlay' : 'standalone'}
      data-slot={hasTarget ? undefined : 'badge'}
    >
      {hasTarget ? <>
        <span data-slot="target">{target}</span>
        <span data-slot="badge" aria-hidden="true">{badgeContent}</span>
      </> : badgeContent}
    </span>
  );
}
