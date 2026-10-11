import type { FormKey, FormState, FormValidators, FormValidationResult } from '@dreadnought/core';

export async function runFormValidation<V extends object>(
  snapshot: FormState<V>,
  validators: FormValidators<V>,
  signal: AbortSignal,
): Promise<FormValidationResult<V>> {
  const result: FormValidationResult<V> = { revision: snapshot.revision, errors: {}, failures: {} };
  const keys = Object.keys(validators) as FormKey<V>[];
  let cancel!: () => void;
  const aborted = new Promise<FormValidationResult<V>>((resolve) => {
    cancel = () => resolve(result);
    signal.addEventListener('abort', cancel, { once: true });
    if (signal.aborted) cancel();
  });
  const checked = Promise.all(
    keys.map(async (key) => {
      try {
        if (signal.aborted) return;
        if (!Object.hasOwn(snapshot.values, key)) throw new TypeError(`Unknown form field: ${key}`);
        const validator = validators[key];
        if (validator === undefined) return;
        const error = await validator(snapshot.values[key], snapshot.values, { signal });
        if (signal.aborted) return;
        if (error !== undefined && typeof error !== 'string') {
          throw new TypeError('A form validator must return a string or undefined');
        }
        if (error !== undefined)
          Object.defineProperty(result.errors, key, {
            value: error,
            enumerable: true,
            configurable: true,
            writable: true,
          });
      } catch (error) {
        if (!signal.aborted)
          Object.defineProperty(result.failures, key, {
            value: error,
            enumerable: true,
            configurable: true,
            writable: true,
          });
      }
    }),
  ).then(() => result);
  try {
    return await Promise.race([checked, aborted]);
  } finally {
    signal.removeEventListener('abort', cancel);
  }
}
