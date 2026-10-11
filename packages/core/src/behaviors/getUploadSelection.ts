import type { UploadConstraints, UploadFileMetadata, UploadRejection } from './upload.types.ts';

const extension = /^\.[a-z0-9][a-z0-9._+-]*$/i;
const mime = /^[a-z0-9!#$&^_.+-]+\/(?:[a-z0-9!#$&^_.+-]+|\*)$/i;

function requireInteger(value: number, minimum: number, name: string) {
  if (!Number.isSafeInteger(value) || value < minimum) {
    throw new RangeError(`${name} must be a safe integer >= ${minimum}`);
  }
}

export function getUploadSelection(
  files: readonly UploadFileMetadata[],
  existingCount: number,
  constraints: UploadConstraints = {},
): { accepted: number[]; rejected: UploadRejection[] } {
  if (!Array.isArray(files) || !constraints || typeof constraints !== 'object') {
    throw new TypeError('Upload requires file metadata and constraints');
  }
  requireInteger(existingCount, 0, 'existingCount');
  if (constraints.maxCount !== undefined) requireInteger(constraints.maxCount, 1, 'maxCount');
  if (constraints.maxSize !== undefined) requireInteger(constraints.maxSize, 0, 'maxSize');
  if (constraints.multiple !== undefined && typeof constraints.multiple !== 'boolean') {
    throw new TypeError('multiple must be boolean');
  }
  const accept = constraints.accept ?? '';
  if (typeof accept !== 'string') throw new TypeError('accept must be a string');
  const tokens = accept.trim()
    ? accept
        .toLowerCase()
        .split(',')
        .map((token) => token.trim())
    : [];
  if (tokens.some((token) => !extension.test(token) && !mime.test(token))) {
    throw new TypeError('accept requires extensions or MIME types');
  }
  const capacity = constraints.multiple ? Infinity : 1;
  const limit = Math.min(capacity, constraints.maxCount ?? Infinity);
  const accepted: number[] = [];
  const rejected: UploadRejection[] = [];
  files.forEach((file, index) => {
    if (!file || typeof file.name !== 'string' || typeof file.type !== 'string') {
      throw new TypeError('File metadata requires name and type strings');
    }
    requireInteger(file.size, 0, 'file.size');
    const matches =
      !tokens.length ||
      tokens.some((token) => {
        if (token.startsWith('.')) return file.name.toLowerCase().endsWith(token);
        const type = file.type.toLowerCase();
        return token.endsWith('/*') ? type.startsWith(token.slice(0, -1)) : type === token;
      });
    let reason: UploadRejection['reason'] | undefined;
    if (!matches) reason = 'type';
    else if (file.size > (constraints.maxSize ?? Infinity)) reason = 'size';
    else if (existingCount + accepted.length >= limit) reason = 'count';
    if (reason) rejected.push({ index, reason });
    else accepted.push(index);
  });
  return { accepted, rejected };
}
