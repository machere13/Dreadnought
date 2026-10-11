import { useUpload } from '@dreadnought/react/logic';
import { Upload } from '../src/adapters/react/index.ts';

export function TypedUpload() {
  const upload = useUpload({ multiple: true, maxCount: 3 });
  // @ts-expect-error no legacy fileList
  const legacy = <Upload upload={upload} label="Файлы" fileList={[]} />;
  // @ts-expect-error sending requires a Promise
  useUpload({ upload: () => 'url' });
  void legacy;
  return <Upload upload={upload} label="Файлы" dropzone aria-label="Документы" />;
}
