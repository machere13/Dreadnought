import { useId } from 'react';
import type { FormFieldAdapterProps } from './form.types.ts';

export function FormFieldAdapter({
  label,
  help,
  error,
  required = false,
  controlId,
  children,
  ...props
}: FormFieldAdapterProps) {
  const generated = useId();
  const id = controlId ?? `${generated}-control`;
  const helpId = `${generated}-help`;
  const labelId = `${generated}-label`;
  const errorId = `${generated}-error`;
  const hasHelp = help !== undefined && help !== null && help !== false;
  const hasError = error !== undefined;
  const description = [hasHelp && helpId, hasError && errorId].filter(Boolean).join(' ');
  return (
    <div {...props} data-ui="form-field" data-invalid={hasError ? '' : undefined}>
      {label !== undefined && label !== null && (
        <label id={labelId} htmlFor={id} data-slot="label">
          {label}
          {required && (
            <span data-slot="required" aria-hidden="true">
              {' '}
              *
            </span>
          )}
        </label>
      )}
      {children({
        id,
        'aria-labelledby': label !== undefined && label !== null ? labelId : undefined,
        'aria-describedby': description || undefined,
        'aria-invalid': hasError ? true : undefined,
        'aria-required': required ? true : undefined,
      })}
      {hasHelp && (
        <div id={helpId} data-slot="help">
          {help}
        </div>
      )}
      {hasError && (
        <div id={errorId} data-slot="error" aria-live="polite">
          {error}
        </div>
      )}
    </div>
  );
}
