export interface PickFilesOptions {
  accept?: string;
  multiple?: boolean;
  signal?: AbortSignal;
}

export function pickFiles(options: PickFilesOptions = {}): Promise<File[]> {
  if (options.signal?.aborted) {
    return Promise.resolve([]);
  }
  return new Promise((resolve, reject) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.hidden = true;
    input.accept = options.accept ?? '';
    input.multiple = options.multiple ?? false;

    const cleanup = () => {
      input.removeEventListener('change', onChange);
      input.removeEventListener('cancel', onCancel);
      options.signal?.removeEventListener('abort', onCancel);
      input.remove();
    };
    const onChange = () => {
      const files = Array.from(input.files ?? []);
      cleanup();
      resolve(files);
    };
    const onCancel = () => {
      cleanup();
      resolve([]);
    };

    input.addEventListener('change', onChange);
    input.addEventListener('cancel', onCancel);
    options.signal?.addEventListener('abort', onCancel, { once: true });
    document.body.append(input);

    try {
      input.click();
    } catch (error) {
      cleanup();
      reject(error);
    }
  });
}
