import { forwardRef, useImperativeHandle } from 'react';
import type { ComponentPropsWithoutRef, ReactNode } from 'react';
import { useInput } from './useInput.ts';
import type { UseInputOptions } from './useInput.ts';

export type InputAdapterProps = UseInputOptions & {
  passwordVisibilityContent?: { show: ReactNode; hide: ReactNode };
  renderStepButton?: (props: ComponentPropsWithoutRef<'button'>) => ReactNode;
};

export const InputAdapter = forwardRef<HTMLInputElement, InputAdapterProps>(function InputAdapter(
  {
    className,
    style,
    passwordVisibilityContent,
    renderStepButton = (props) => <button {...props} />,
    ...options
  },
  ref,
) {
  const { inputProps, state, visibilityButtonProps, stepButtonProps, isPasswordVisible } =
    useInput(options);
  useImperativeHandle(ref, () => inputProps.ref.current!, [inputProps.ref]);
  const visibilityContent =
    passwordVisibilityContent?.[isPasswordVisible ? 'hide' : 'show'] ??
    visibilityButtonProps?.children;
  const isInvalid =
    state.invalid || inputProps['aria-invalid'] === true || inputProps['aria-invalid'] === 'true';

  return (
    <div
      className={className}
      style={style}
      data-ui="input"
      data-invalid={isInvalid ? '' : undefined}
      data-disabled={state.disabled ? '' : undefined}
    >
      <input {...inputProps} data-slot="control" />
      {stepButtonProps && (
        <span data-slot="step-controls">
          {renderStepButton(stepButtonProps.increase)}
          {renderStepButton(stepButtonProps.decrease)}
        </span>
      )}
      {visibilityButtonProps && (
        <button {...visibilityButtonProps} data-slot="visibility-toggle">
          {visibilityContent}
        </button>
      )}
    </div>
  );
});
