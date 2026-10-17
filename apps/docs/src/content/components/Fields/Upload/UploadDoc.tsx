import { ComponentPage } from '../../../../shared/ComponentPage.tsx';
import { getCatalogDoc } from '../../../../data/catalog/getCatalogDoc.ts';
import type { ComponentDoc } from '../../../../shared/types.ts';
import { UploadDemo } from './UploadDemo.tsx';
import basicCode from './UploadDemo.tsx?raw';
import { UploadLimitsDemo } from './UploadLimitsDemo.tsx';
import limitsCode from './UploadLimitsDemo.tsx?raw';
import { UploadLifecycleDemo } from './UploadLifecycleDemo.tsx';
import lifecycleCode from './UploadLifecycleDemo.tsx?raw';
import { UploadFormDemo } from './UploadFormDemo.tsx';
import formCode from './UploadFormDemo.tsx?raw';

export const uploadDoc: ComponentDoc = {
  ...getCatalogDoc('upload'),
  title: 'Upload',
  usage:
    'Для вложений, которые выбирают с устройства или перетаскивают на страницу. Компонент показывает список и состояние; способ отправки на сервер задаёте вы.',
  primaryProps: ['upload', 'dropzone', 'label'],
  description: 'Выбор файлов с устройства или перетаскиванием, со списком и состояниями загрузки.',
  adapterDescription: 'Доступная кнопка выбора, dropzone и список файлов без оформления.',
  logicDescription: 'useUpload управляет файлами и запросами; чистые правила доступны в core.',
  examples: [
    {
      id: 'selection',
      title: 'Выбрать файлы без отправки',
      description:
        'Нажмите «Выбрать файлы» или перетащите несколько файлов в область. Они появятся в списке со статусом «Готов к отправке», но никуда не отправятся: у useUpload нет обработчика upload. Крестик удаляет один файл, «Очистить список» — все.',
      demo: <UploadDemo />,
      code: basicCode,
    },
    {
      id: 'limits',
      title: 'Тип, размер и количество файлов',
      description:
        'Принимаются PDF и изображения: максимум три файла, каждый не больше 10 МиБ. Перетащите неподходящий файл или добавьте четвёртый — появится причина отказа. Удалите принятый файл, чтобы освободить место. Даже успешно загруженные файлы занимают место, пока вы их не удалите.',
      demo: <UploadLimitsDemo />,
      code: limitsCode,
    },
    {
      id: 'lifecycle',
      title: 'Прогресс, ошибка, отмена и повтор',
      description:
        'Добавьте пример файла и начните загрузку. Кнопками задайте 50%, успех или ошибку; после ошибки повторите попытку, во время загрузки — отмените. Только «Успех» завершает операцию. Сеть не используется.',
      demo: <UploadLifecycleDemo />,
      code: lifecycleCode,
    },
    {
      id: 'form',
      title: 'Список вложений в Form',
      description:
        'Прикрепите до трёх документов и нажмите «Сохранить список»: ниже появятся количество и имена файлов на момент сохранения. Это локальный результат, без отправки на сервер. «Сбросить» очищает результат и файлы через явный вызов upload.clear().',
      demo: <UploadFormDemo />,
      code: formCode,
    },
  ],
  notes: [
    <>Передайте upload(file, &#123;signal, onProgress&#125;) для отправки на свой сервер.</>,
    <>Fetch сам не сообщает прогресс отправки.</>,
    <>accept и maxSize проверяют метаданные; сервер должен проверить содержимое.</>,
    <>Отмена не гарантирует удаления файла на сервере.</>,
    <>При сбросе Form вызывайте upload.clear() явно.</>,
    <>Файлы сохраняются до удаления или очистки.</>,
  ],
};

export function UploadPage() {
  return <ComponentPage component="upload" doc={uploadDoc} />;
}
