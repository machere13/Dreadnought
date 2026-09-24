export interface PickFilesOptions {
  accept?: string;
  multiple?: boolean;
}

export function pickFiles(options: PickFilesOptions = {}): Promise<File[]> {
  return new Promise((resolve, reject) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.hidden = true;
    input.accept = options.accept ?? '';
    input.multiple = options.multiple ?? false;

    const cleanup = () => {
      input.removeEventListener('change', onChange);
      input.removeEventListener('cancel', onCancel);
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
    document.body.append(input);

    try {
      input.click();
    } catch (error) {
      cleanup();
      reject(error);
    }
  });
}
