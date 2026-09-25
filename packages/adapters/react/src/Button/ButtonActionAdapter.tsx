import { forwardRef } from 'react';
import { useButton } from './useButton.js';
import type { UseButtonOptions } from './useButton.js';
import { renderButtonContent } from './renderButtonContent.js';
import type { ButtonContentProps } from './renderButtonContent.js';

export type ButtonActionAdapterProps = UseButtonOptions & ButtonContentProps;

export const ButtonActionAdapter = forwardRef<HTMLButtonElement, ButtonActionAdapterProps>(
  function ButtonActionAdapter({ children, icon, iconPosition, ...options }, ref) {
    const { buttonProps } = useButton(options);

    return <button {...buttonProps} data-ui="button" ref={ref}>
      {renderButtonContent({ children, icon, iconPosition })}
    </button>;
  },
);
