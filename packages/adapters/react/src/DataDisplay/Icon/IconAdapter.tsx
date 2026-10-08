import type { ComponentPropsWithRef, ReactNode } from 'react';

export type IconAdapterProps = Omit<ComponentPropsWithRef<'span'>, 'children'> & {
  children: ReactNode;
};

export function IconAdapter({ children, 'aria-label': label, ...props }: IconAdapterProps) {
  return (
    <span
      {...props}
      data-ui="icon"
      role={label ? 'img' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
    >
      {children}
    </span>
  );
}
