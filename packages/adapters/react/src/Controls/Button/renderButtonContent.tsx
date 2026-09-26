import type { ReactNode } from 'react';

export interface ButtonContentProps {
  children?: ReactNode;
  icon?: ReactNode;
  iconPosition?: 'start' | 'end';
}

export function renderButtonContent({ children, icon, iconPosition = 'start' }: ButtonContentProps) {
  const iconSlot = icon == null ? null : <span data-slot="icon" aria-hidden="true">{icon}</span>;

  return <>
    {iconPosition === 'start' && iconSlot}
    {children != null && <span data-slot="label">{children}</span>}
    {iconPosition === 'end' && iconSlot}
  </>;
}
