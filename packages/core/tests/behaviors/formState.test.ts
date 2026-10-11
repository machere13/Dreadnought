import { expect, it } from 'vitest';
import {
  createFormState,
  getFormState,
  getFormValidationState,
  resetFormState,
  setFormError,
  setFormTouched,
  setFormValue,
} from '../../src/index.ts';

it('changes values immutably and clears dirty when restored', () => {
  const initial = Object.freeze({ name: '', accepted: false });
  const start = createFormState(initial);
  const changed = setFormValue(start, 'name', 'Ada');
  expect(start.values).toEqual({ name: '', accepted: false });
  expect(getFormState(changed).dirty).toBe(true);
  expect(getFormState(setFormValue(changed, 'name', '')).dirty).toBe(false);
  expect(setFormValue(changed, 'name', 'Ada')).toBe(changed);
});

it('compares object and array values by identity', () => {
  const tags = ['a'];
  const start = createFormState({ tags });
  expect(getFormState(setFormValue(start, 'tags', ['a'])).dirty).toBe(true);
  expect(getFormState(setFormValue(start, 'tags', tags)).dirty).toBe(false);
});

it('tracks touched independently from errors and resets to a replaceable baseline', () => {
  const start = createFormState({ name: '', accepted: false });
  const visited = setFormTouched(start, 'name');
  expect(visited.touched).toEqual({ name: true });
  const failed = setFormError(visited, 'name', 'Required');
  expect(failed.errors).toEqual({ name: 'Required' });
  expect(setFormError(failed, 'name').errors).toEqual({});
  const changed = setFormValue(failed, 'name', 'Ada');
  expect(changed.errors).toEqual({});
  expect(changed.touched).toEqual({ name: true });
  expect(setFormTouched(changed).touched).toEqual({ name: true, accepted: true });
  const reset = resetFormState(changed, { name: 'Grace', accepted: true });
  expect(reset.errors).toEqual({});
  expect(reset.touched).toEqual({});
  expect(getFormState(reset).dirty).toBe(false);
  expect(resetFormState(setFormValue(reset, 'name', 'Ada')).values.name).toBe('Grace');
  expect(resetFormState(changed).values.name).toBe('');
});

it('rejects stale validation and counts thrown undefined as a failure', () => {
  const start = createFormState({ name: '' });
  const changed = setFormValue(start, 'name', 'Ada');
  const stale = getFormValidationState(changed, {
    revision: start.revision,
    errors: { name: 'Old' },
    failures: {},
  });
  expect(stale.accepted).toBe(false);
  expect(stale.state).toBe(changed);
  expect(
    getFormValidationState(changed, {
      revision: changed.revision,
      errors: {},
      failures: { name: undefined },
    }).valid,
  ).toBe(false);
  expect(
    getFormValidationState(changed, {
      revision: changed.revision,
      errors: { name: 'Required' },
      failures: {},
    }).state.errors,
  ).toEqual({ name: 'Required' });
  expect(
    getFormValidationState(changed, {
      revision: changed.revision,
      errors: {},
      failures: {},
    }).valid,
  ).toBe(true);
});

it('rejects unknown fields and reset records with different keys', () => {
  const start = createFormState({ name: '' });
  expect(() => setFormValue(start, 'missing' as 'name', '')).toThrow(TypeError);
  expect(() => setFormTouched(start, 'missing' as 'name')).toThrow(TypeError);
  expect(() => setFormError(start, 'missing' as 'name', 'Error')).toThrow(TypeError);
  expect(() => resetFormState(start, {} as { name: string })).toThrow(TypeError);
  expect(() => resetFormState(start, { name: '', extra: true })).toThrow(TypeError);
});

it('supports empty records and special own field names without prototype mutation', () => {
  expect(getFormState(createFormState({})).dirty).toBe(false);
  const initial = JSON.parse('{"__proto__":"first","constructor":"value"}');
  const next = setFormValue(createFormState(initial), '__proto__', 'second');
  expect(Object.getPrototypeOf(next.values)).toBe(Object.prototype);
  expect(Object.hasOwn(next.values, '__proto__')).toBe(true);
  expect(next.values.__proto__).toBe('second');
  expect(setFormError(next, '__proto__', 'Error').errors.__proto__).toBe('Error');
});
