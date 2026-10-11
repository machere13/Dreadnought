import { FormFieldAdapter } from '@dreadnought/react/unstyled';
import type { FormFieldAdapterProps } from '@dreadnought/react/unstyled';
import { formPresentation } from '#presentation/Fields/Form/formPresentation.ts';

export type FormFieldProps = FormFieldAdapterProps;

export function FormField({ className, ...props }: FormFieldProps) {
  return (
    <FormFieldAdapter
      {...props}
      className={[formPresentation.field, className].filter(Boolean).join(' ')}
    />
  );
}
