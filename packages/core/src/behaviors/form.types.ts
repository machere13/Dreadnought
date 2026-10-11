export type FormKey<V extends object> = Extract<keyof V, string>;
export type FormErrors<V extends object> = Partial<Record<FormKey<V>, string>>;
export type FormFailures<V extends object> = Partial<Record<FormKey<V>, unknown>>;

export interface FormState<V extends object> {
  values: V;
  initialValues: V;
  errors: FormErrors<V>;
  touched: Partial<Record<FormKey<V>, boolean>>;
  revision: number;
}

export type FieldValidator<T, V extends object> = (
  value: T,
  values: Readonly<V>,
  context: { signal: AbortSignal },
) => string | undefined | Promise<string | undefined>;

export type FormValidators<V extends object> = {
  [K in FormKey<V>]?: FieldValidator<V[K], V>;
};

export interface FormValidationResult<V extends object> {
  revision: number;
  errors: FormErrors<V>;
  failures: FormFailures<V>;
}

export type FormSubmitStatus = 'success' | 'invalid' | 'stale' | 'busy' | 'error';
export type FormSubmitHandler<V extends object> = (values: Readonly<V>) => void | Promise<void>;
