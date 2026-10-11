import type {
  FormErrors,
  FormFailures,
  FormKey,
  FormState,
  FormValidators,
  FormSubmitHandler,
  FormSubmitStatus,
} from '@dreadnought/core';
import type { ComponentPropsWithRef, ReactNode } from 'react';

export type FormAdapterProps<V extends object> = ComponentPropsWithRef<'form'> &
  (
    | { form: UseFormResult<V>; onFinish: FormSubmitHandler<V> }
    | { form?: undefined; onFinish?: never }
  );

export interface FormFieldControlProps {
  id: string;
  'aria-describedby'?: string;
  'aria-invalid'?: true;
  'aria-required'?: true;
}

export type FormFieldAdapterProps = Omit<ComponentPropsWithRef<'div'>, 'children'> & {
  label?: ReactNode;
  help?: ReactNode;
  error?: string;
  required?: boolean;
  controlId?: string;
  children: (props: FormFieldControlProps) => ReactNode;
};

export interface UseFormOptions<V extends object> {
  initialValues: V;
  validators?: FormValidators<V>;
  validateOn?: 'blur' | 'change' | 'submit';
}

export interface UseFormResult<V extends object> {
  values: V;
  errors: FormErrors<V>;
  touched: FormState<V>['touched'];
  dirty: boolean;
  validating: boolean;
  submitting: boolean;
  validationFailures: FormFailures<V>;
  submitError: unknown;
  setValue<K extends FormKey<V>>(name: K, value: V[K]): void;
  setError(name: FormKey<V>, error?: string): void;
  reset(values?: V): void;
  validate(): Promise<'valid' | 'invalid' | 'stale'>;
  submit(handler: FormSubmitHandler<V>): Promise<FormSubmitStatus>;
  field<K extends FormKey<V>>(
    name: K,
  ): {
    value: V[K];
    error?: string;
    touched: boolean;
    dirty: boolean;
    validating: boolean;
    setValue(value: V[K]): void;
    onBlur(): void;
  };
}
