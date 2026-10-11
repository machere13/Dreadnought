import type { UploadEvent } from '@dreadnought/core';
import type { UploadHandler } from './upload.types.ts';

export async function runUploadAttempt(
  file: File,
  handler: UploadHandler,
  controller: AbortController,
  isCurrent: () => boolean,
  publish: (event: UploadEvent) => void,
): Promise<void> {
  try {
    await handler(file, {
      signal: controller.signal,
      onProgress(value) {
        if (isCurrent()) publish({ type: 'progress', value });
      },
    });
    if (isCurrent()) publish({ type: 'success' });
  } catch (error) {
    if (isCurrent()) publish({ type: 'error', error });
  }
}
