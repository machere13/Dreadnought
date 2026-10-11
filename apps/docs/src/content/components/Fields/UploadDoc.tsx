import { ComponentPage } from '../../../shared/ComponentPage.tsx';
import { getCatalogDoc } from '../../../data/catalog/getCatalogDoc.ts';
import type { ComponentDoc } from '../../../shared/types.ts';
import { UploadDemo, UploadFormDemo } from './UploadDemo.tsx';
import { UploadLifecycleDemo } from './UploadLifecycleDemo.tsx';

export const uploadDoc: ComponentDoc = {
  ...getCatalogDoc('upload'),
  title: 'Upload',
  description: 'Выбор файлов, ограничения, прогресс, отмена и повтор отправки.',
  adapterDescription: 'Доступная кнопка выбора, dropzone и список файлов без оформления.',
  logicDescription: 'useUpload управляет файлами и запросами; чистые правила доступны в core.',
  demo: (
    <div style={{ display: 'grid', gap: '2rem', width: '100%' }}>
      <section>
        <h3>Выбор без отправки</h3>
        <UploadDemo />
      </section>
      <section>
        <h3>Прогресс, ошибка и повтор</h3>
        <UploadLifecycleDemo />
      </section>
      <section>
        <h3>С Form</h3>
        <UploadFormDemo />
      </section>
    </div>
  ),
  footnote: (
    <>
      Передайте upload(file, &#123;signal, onProgress&#125;) для отправки на свой сервер. Fetch сам
      не сообщает прогресс отправки. accept и maxSize проверяют метаданные; сервер должен проверить
      содержимое. Отмена не гарантирует удаления файла на сервере. При сбросе Form вызывайте
      upload.clear() явно. Файлы сохраняются до удаления или очистки.
    </>
  ),
};

export function UploadPage() {
  return <ComponentPage component="upload" doc={uploadDoc} />;
}
