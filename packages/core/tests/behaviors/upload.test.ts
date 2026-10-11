import { expect, it } from 'vitest';
import { getUploadItemState, getUploadSelection } from '../../src/index.ts';

const pdf = { name: 'A.PDF', size: 10, type: '' };

it('does not consume capacity for rejected files', () => {
  expect(
    getUploadSelection(
      [{ name: 'bad.txt', size: 1, type: 'text/plain' }, pdf, { ...pdf, name: 'B.pdf' }],
      0,
      { accept: '.pdf', multiple: true, maxCount: 1, maxSize: 10 },
    ),
  ).toEqual({
    accepted: [1],
    rejected: [
      { index: 0, reason: 'type' },
      { index: 2, reason: 'count' },
    ],
  });
});

it('matches extensions and exact or family MIME without altering input', () => {
  const files = Object.freeze([
    Object.freeze(pdf),
    Object.freeze({ name: 'x', size: 0, type: 'IMAGE/PNG' }),
    Object.freeze({ name: 'y', size: 0, type: 'application/json' }),
    Object.freeze({ name: 'z', size: 0, type: '' }),
  ]);
  expect(
    getUploadSelection(files, 0, {
      accept: ' .pdf, image/*,application/json ',
      multiple: true,
    }),
  ).toEqual({ accepted: [0, 1, 2], rejected: [{ index: 3, reason: 'type' }] });
});

it('single selection does not replace an existing record', () => {
  expect(getUploadSelection([pdf], 1)).toEqual({
    accepted: [],
    rejected: [{ index: 0, reason: 'count' }],
  });
  expect(getUploadSelection([pdf, pdf], 0).accepted).toEqual([0]);
  expect(getUploadSelection([pdf, pdf], 0, { multiple: true }).accepted).toEqual([0, 1]);
});

it('accepts empty files and an inclusive size limit', () => {
  expect(getUploadSelection([{ ...pdf, size: 0 }], 0, { maxSize: 0 }).accepted).toEqual([0]);
  expect(getUploadSelection([pdf], 0, { maxSize: 9 }).rejected).toEqual([
    { index: 0, reason: 'size' },
  ]);
  expect(getUploadSelection([], 0)).toEqual({ accepted: [], rejected: [] });
});

it('rejects malformed constraints even for an empty batch', () => {
  for (const options of [
    { maxCount: 0 },
    { maxCount: 1.5 },
    { maxSize: -1 },
    { maxSize: Infinity },
  ])
    expect(() => getUploadSelection([], 0, options)).toThrow(RangeError);
  for (const accept of ['pdf', 'image/', '*/*', '.pdf,,image/png', '.']) {
    expect(() => getUploadSelection([], 0, { accept })).toThrow(TypeError);
  }
  expect(() => getUploadSelection([], -1)).toThrow(RangeError);
  expect(() => getUploadSelection([{ ...pdf, size: NaN }], 0)).toThrow(RangeError);
});

it('starts and retries without mutating prior errors', () => {
  const ready = Object.freeze({ status: 'ready' as const });
  expect(getUploadItemState(ready, { type: 'start' })).toEqual({ status: 'uploading' });
  const error = Object.freeze({ status: 'error' as const, error: 'bad', progress: 30 });
  expect(getUploadItemState(error, { type: 'retry' })).toEqual({ status: 'uploading' });
  expect(error.error).toBe('bad');
  expect(getUploadItemState(error, { type: 'start' })).toBe(error);
});

it('keeps progress monotone but does not treat 100 as completion', () => {
  const state = { status: 'uploading' as const, progress: 40 };
  for (const value of [39, -1, 101, NaN, Infinity]) {
    expect(getUploadItemState(state, { type: 'progress', value })).toBe(state);
  }
  expect(getUploadItemState(state, { type: 'progress', value: 100 })).toEqual({
    status: 'uploading',
    progress: 100,
  });
  expect(getUploadItemState(state, { type: 'success' })).toEqual({
    status: 'success',
    progress: 100,
  });
});

it('keeps undefined failures distinct and ignores late completion after cancel', () => {
  expect(
    getUploadItemState(
      { status: 'uploading' },
      {
        type: 'error',
        error: undefined,
      },
    ),
  ).toEqual({ status: 'error', error: undefined });
  const canceled = getUploadItemState({ status: 'uploading' }, { type: 'cancel' });
  expect(canceled.status).toBe('canceled');
  expect(getUploadItemState(canceled, { type: 'success' })).toBe(canceled);
  expect(getUploadItemState(canceled, { type: 'retry' })).toEqual({ status: 'uploading' });
});
