import type { UploadAdapterProps, UploadItem } from './upload.types.ts';

export const uploadStatusLabels = {
  ready: 'Готов к отправке',
  uploading: 'Загружается',
  success: 'Загружен',
  error: 'Не удалось загрузить',
  canceled: 'Загрузка отменена',
} as const;

type ItemProps = Pick<
  UploadAdapterProps,
  'upload' | 'slotClassNames' | 'renderAction' | 'renderProgress'
> & {
  item: UploadItem;
};

export function UploadItemAdapter({
  item,
  upload,
  slotClassNames,
  renderAction,
  renderProgress,
}: ItemProps) {
  function action(kind: 'start' | 'cancel' | 'retry' | 'remove', label: string) {
    const props = {
      action: kind,
      label: `${label} ${item.file.name}`,
      disabled: (kind === 'start' || kind === 'retry') && upload.disabled,
      onClick() {
        void upload[kind](item.id);
      },
    };
    return (
      <span data-action={kind}>
        {renderAction ? (
          renderAction(props)
        ) : (
          <button
            type="button"
            aria-label={props.label}
            disabled={props.disabled}
            onClick={props.onClick}
          >
            {label}
          </button>
        )}
      </span>
    );
  }

  return (
    <li
      data-upload-id={item.id}
      data-state={item.status}
      data-slot="item"
      className={slotClassNames?.item}
    >
      <div data-slot="file">
        <span data-slot="name" className={slotClassNames?.name}>
          {item.file.name}
        </span>
        <span data-slot="status" className={slotClassNames?.status}>
          {uploadStatusLabels[item.status]}
        </span>
        {item.status === 'uploading' &&
          (renderProgress ? (
            renderProgress(item)
          ) : (
            <progress aria-label={`Загрузка ${item.file.name}`} max={100} value={item.progress} />
          ))}
      </div>
      <div data-slot="actions" className={slotClassNames?.actions}>
        {item.status === 'ready' && upload.canUpload && action('start', 'Загрузить')}
        {item.status === 'uploading' && action('cancel', 'Отменить')}
        {(item.status === 'error' || item.status === 'canceled') &&
          upload.canUpload &&
          action('retry', 'Повторить')}
        {action('remove', 'Удалить')}
      </div>
    </li>
  );
}
