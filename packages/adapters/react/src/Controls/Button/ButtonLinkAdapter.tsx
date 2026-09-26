import { forwardRef } from 'react';
import type { AnchorHTMLAttributes, MouseEvent } from 'react';
import { getButtonState } from '@dreadnought/core';
import { renderButtonContent } from './renderButtonContent.tsx';
import type { ButtonContentProps } from './renderButtonContent.tsx';

export type ButtonLinkAdapterProps = Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href' | 'type'>
  & ButtonContentProps
  & { href: string; disabled?: boolean; loading?: boolean; type?: never };

export const ButtonLinkAdapter = forwardRef<HTMLAnchorElement, ButtonLinkAdapterProps>(
  function ButtonLinkAdapter({ children, icon, iconPosition, href, disabled = false, loading = false, onClick, tabIndex, ...rest }, ref) {
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
      {renderButtonContent({ children, icon, iconPosition })}
    </a>;
  },
);
