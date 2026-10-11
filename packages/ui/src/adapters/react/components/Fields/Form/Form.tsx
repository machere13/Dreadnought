import { FormAdapter } from '@dreadnought/react/unstyled';
import type { FormAdapterProps } from '@dreadnought/react/unstyled';
import { formPresentation } from '#presentation/Fields/Form/formPresentation.ts';

export type FormProps<V extends object> = FormAdapterProps<V>;

export function Form<V extends object>({ className, ...props }: FormProps<V>) {
  return (
    <FormAdapter
      {...props}
      className={[formPresentation.root, className].filter(Boolean).join(' ')}
    />
  );
}
