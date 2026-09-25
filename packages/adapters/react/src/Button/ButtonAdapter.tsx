import { forwardRef } from 'react';
import type { AnchorHTMLAttributes, MouseEvent, ReactNode, Ref } from 'react';
import { getButtonState } from '@dreadnought/core';
import { useButton } from './useButton.js';
import type { UseButtonOptions } from './useButton.js';

interface ButtonContentProps {
  children?: ReactNode;
  icon?: ReactNode;
  iconPosition?: 'start' | 'end';
}

type NativeButtonProps = UseButtonOptions & ButtonContentProps & { href?: undefined };

type LinkButtonProps = Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href' | 'type'>
  & ButtonContentProps
  & { href: string; disabled?: boolean; loading?: boolean; type?: never };

export type ButtonAdapterProps = NativeButtonProps | LinkButtonProps;

function renderContent({ children, icon, iconPosition = 'start' }: ButtonContentProps) {
  const iconSlot = icon == null ? null : <span data-slot="icon" aria-hidden="true">{icon}</span>;

  return <>
    {iconPosition === 'start' && iconSlot}
    {children != null && <span data-slot="label">{children}</span>}
    {iconPosition === 'end' && iconSlot}
  </>;
}

const NativeButton = forwardRef<HTMLButtonElement, NativeButtonProps>(
  function NativeButton({ children, icon, iconPosition, href: _href, ...options }, ref) {
    const { buttonProps } = useButton(options);

    return (
      <button {...buttonProps} data-ui="button" ref={ref}>
        {renderContent({ children, icon, iconPosition })}
      </button>
    );
  },
);

const ButtonLink = forwardRef<HTMLAnchorElement, LinkButtonProps>(
  function ButtonLink({ children, icon, iconPosition, href, disabled = false, loading = false, onClick, tabIndex, ...rest }, ref) {
    const state = getButtonState({ disabled, loading });

    function handleClick(event: MouseEvent<HTMLAnchorElement>) {
      if (state.actionBlocked) {
        event.preventDefault();
        event.stopPropagation();
        return;
      }

      onClick?.(event);
    }

    return <a
      {...rest}
      href={state.actionBlocked ? undefined : href}
      role={state.actionBlocked ? 'link' : undefined}
      tabIndex={state.actionBlocked ? (loading ? 0 : -1) : tabIndex}
      aria-disabled={state.actionBlocked || undefined}
      aria-busy={state.busy || undefined}
      data-loading={state.busy ? '' : undefined}
      data-ui="button"
      onClick={handleClick}
      ref={ref}
    >
      {renderContent({ children, icon, iconPosition })}
    </a>;
  },
);

export const ButtonAdapter = forwardRef<HTMLButtonElement | HTMLAnchorElement, ButtonAdapterProps>(
  function ButtonAdapter(props, ref) {
    if (typeof props.href === 'string') {
      return <ButtonLink {...props} ref={ref as Ref<HTMLAnchorElement>} />;
    }

    return <NativeButton {...props} ref={ref as Ref<HTMLButtonElement>} />;
  },
);
