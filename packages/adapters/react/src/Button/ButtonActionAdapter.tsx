import { forwardRef } from 'react';
import { useButton } from './useButton.ts';
import type { UseButtonOptions } from './useButton.ts';
import { renderButtonContent } from './renderButtonContent.tsx';
import type { ButtonContentProps } from './renderButtonContent.tsx';

export type ButtonActionAdapterProps = UseButtonOptions & ButtonContentProps;

export const ButtonActionAdapter = forwardRef<HTMLButtonElement, ButtonActionAdapterProps>(
  function ButtonActionAdapter({ children, icon, iconPosition, ...options }, ref) {
    const { buttonProps } = useButton(options);

    return <button {...buttonProps} data-ui="button" ref={ref}>
      {renderButtonContent({ children, icon, iconPosition })}
    </button>;
  },
);
