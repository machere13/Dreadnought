import { useLayoutEffect, useRef, useState } from 'react';
import {
  createFormState,
  getFormState,
  getFormValidationState,
  resetFormState,
  setFormError,
  setFormTouched,
  setFormValue,
} from '@dreadnought/core';
import type { FormFailures, FormKey, FormSubmitHandler, FormValidators } from '@dreadnought/core';
import type { UseFormOptions, UseFormResult } from './form.types.ts';
import { runFormValidation } from './runFormValidation.ts';

export function useForm<V extends object>({
  initialValues,
  validators = {},
  validateOn = 'blur',
}: UseFormOptions<V>): UseFormResult<V> {
  const [view, setView] = useState(() => ({
    state: createFormState(initialValues),
    failures: {} as FormFailures<V>,
    validating: false,
    submitting: false,
    submitError: undefined as unknown,
  }));
  const current = useRef(view);
  const mounted = useRef(true);
  const controller = useRef<AbortController | null>(null);
  const sending = useRef(false);
  const generation = useRef(0);
  const rules = useRef<FormValidators<V>>({ ...validators });
  const mode = useRef(validateOn);

  function publish(next: typeof view) {
    current.current = next;
    if (mounted.current) setView(next);
  }

  function cancelValidation() {
    controller.current?.abort();
    controller.current = null;
  }

  useLayoutEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      generation.current++;
      cancelValidation();
    };
  }, []);

  useLayoutEffect(() => {
    mode.current = validateOn;
    const keys = Object.keys(validators) as FormKey<V>[];
    const previous = rules.current;
    if (
      keys.length === Object.keys(previous).length &&
      keys.every((key) => Object.hasOwn(previous, key) && previous[key] === validators[key])
    )
      return;
    rules.current = { ...validators };
    cancelValidation();
    const latest = current.current;
    const next = {
      ...latest,
      validating: false,
      state: { ...latest.state, revision: latest.state.revision + 1 },
    };
    current.current = next;
    if (latest.validating) publish(next);
  });

  async function validate(): Promise<'valid' | 'invalid' | 'stale'> {
    if (!mounted.current) return 'stale';
    cancelValidation();
    const active = new AbortController();
    controller.current = active;
    const latest = current.current;
    const snapshot = { ...latest.state, revision: latest.state.revision + 1 };
    publish({ ...latest, state: snapshot, validating: true, failures: {} });
    const checked = await runFormValidation(snapshot, rules.current, active.signal);
    if (!mounted.current || active.signal.aborted) return 'stale';
    const accepted = getFormValidationState(current.current.state, checked);
    if (!accepted.accepted) return 'stale';
    controller.current = null;
    publish({
      ...current.current,
      state: accepted.state,
      failures: checked.failures,
      validating: false,
    });
    return accepted.valid ? 'valid' : 'invalid';
  }

  function setValue<K extends FormKey<V>>(name: K, value: V[K]) {
    const latest = current.current;
    const next = setFormValue(latest.state, name, value);
    if (next === latest.state) return;
    cancelValidation();
    publish({ ...latest, state: next, failures: {}, validating: false });
    if (mode.current === 'change') void validate();
  }

  function setError(name: FormKey<V>, error?: string) {
    const latest = current.current;
    const state = setFormError(latest.state, name, error);
    cancelValidation();
    publish({ ...latest, state, failures: {}, validating: false });
  }

  function reset(values?: V) {
    const latest = current.current;
    const state = resetFormState(latest.state, values);
    generation.current++;
    cancelValidation();
    publish({ ...latest, state, failures: {}, validating: false, submitError: undefined });
  }

  async function submit(handler: FormSubmitHandler<V>) {
    if (!mounted.current) return 'stale' as const;
    if (sending.current) return 'busy' as const;
    sending.current = true;
    const attempt = generation.current;
    publish({
      ...current.current,
      state: setFormTouched(current.current.state),
      submitting: true,
      submitError: undefined,
    });
    try {
      const checking = validate();
      const snapshot = current.current.state;
      const status = await checking;
      if (status !== 'valid') return status;
      if (
        !mounted.current ||
        generation.current !== attempt ||
        current.current.state.revision !== snapshot.revision
      )
        return 'stale' as const;
      await handler(snapshot.values);
      return mounted.current && generation.current === attempt
        ? ('success' as const)
        : ('stale' as const);
    } catch (error) {
      if (!mounted.current || generation.current !== attempt) return 'stale' as const;
      publish({ ...current.current, submitError: error });
      return 'error' as const;
    } finally {
      sending.current = false;
      if (mounted.current) publish({ ...current.current, submitting: false });
    }
  }

  function field<K extends FormKey<V>>(name: K) {
    if (!Object.hasOwn(view.state.initialValues, name))
      throw new TypeError(`Unknown form field: ${name}`);
    return {
      value: view.state.values[name],
      error: Object.hasOwn(view.state.errors, name) ? view.state.errors[name] : undefined,
      touched: Object.hasOwn(view.state.touched, name) && Boolean(view.state.touched[name]),
      dirty: !Object.is(view.state.values[name], view.state.initialValues[name]),
      validating: view.validating && Object.hasOwn(rules.current, name),
      setValue: (value: V[K]) => setValue(name, value),
      onBlur: () => {
        publish({ ...current.current, state: setFormTouched(current.current.state, name) });
        if (mode.current === 'blur') void validate();
      },
    };
  }

  return {
    values: view.state.values,
    errors: view.state.errors,
    touched: view.state.touched,
    dirty: getFormState(view.state).dirty,
    validating: view.validating,
    submitting: view.submitting,
    validationFailures: view.failures,
    submitError: view.submitError,
    setValue,
    setError,
    reset,
    validate,
    submit,
    field,
  };
}
