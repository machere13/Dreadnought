import type { FormKey, FormState } from './form.types.ts';

function assertField<V extends object>(state: FormState<V>, name: FormKey<V>) {
  if (!Object.hasOwn(state.initialValues, name)) {
    throw new TypeError(`Unknown form field: ${name}`);
  }
}

export function createFormState<V extends object>(values: V): FormState<V> {
  if (!values || typeof values !== 'object' || Array.isArray(values)) {
    throw new TypeError('Form values must be a record');
  }
  return {
    values: { ...values },
    initialValues: { ...values },
    errors: {},
    touched: {},
    revision: 0,
  };
}

export function setFormValue<V extends object, K extends FormKey<V>>(
  state: FormState<V>,
  name: K,
  value: V[K],
): FormState<V> {
  assertField(state, name);
  if (Object.is(state.values[name], value)) return state;
  return {
    ...state,
    values: { ...state.values, [name]: value },
    errors: {},
    revision: state.revision + 1,
  };
}

export function setFormTouched<V extends object>(
  state: FormState<V>,
  name?: FormKey<V>,
): FormState<V> {
  if (name !== undefined) assertField(state, name);
  const names = name === undefined ? Object.keys(state.initialValues) : [name];
  return {
    ...state,
    touched: { ...state.touched, ...Object.fromEntries(names.map((key) => [key, true])) },
  };
}

export function setFormError<V extends object>(
  state: FormState<V>,
  name: FormKey<V>,
  error?: string,
): FormState<V> {
  assertField(state, name);
  const errors = { ...state.errors, [name]: error };
  if (error === undefined) delete errors[name];
  return { ...state, errors, revision: state.revision + 1 };
}

export function resetFormState<V extends object>(
  state: FormState<V>,
  values: V = state.initialValues,
): FormState<V> {
  const reset = createFormState(values);
  const keys = Object.keys(state.initialValues);
  if (
    keys.length !== Object.keys(values).length ||
    keys.some((key) => !Object.hasOwn(values, key))
  ) {
    throw new TypeError('Reset values must contain the same form fields');
  }
  return { ...reset, revision: state.revision + 1 };
}

export function getFormState<V extends object>(state: FormState<V>): { dirty: boolean } {
  const keys = Object.keys(state.initialValues) as FormKey<V>[];
  return { dirty: keys.some((key) => !Object.is(state.values[key], state.initialValues[key])) };
}
