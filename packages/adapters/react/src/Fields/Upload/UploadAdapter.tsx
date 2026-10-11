import { useImperativeHandle, useLayoutEffect, useRef, useState } from 'react';
import type { DragEvent } from 'react';
import type { UploadAdapterProps } from './upload.types.ts';
import { UploadItemAdapter, uploadStatusLabels } from './UploadItemAdapter.tsx';

const rejectionLabels = {
  type: 'Недопустимый тип файла',
  size: 'Файл слишком большой',
  count: 'Превышено количество файлов',
} as const;

function hasFiles(event: DragEvent<HTMLDivElement>) {
  return Array.from(event.dataTransfer.types).includes('Files');
}

function droppedFiles(transfer: DataTransfer): File[] {
  if (!transfer.items?.length) return Array.from(transfer.files);
  return Array.from(transfer.items).flatMap((item) => {
    if (item.kind !== 'file' || item.webkitGetAsEntry?.()?.isDirectory) return [];
    const file = item.getAsFile();
    return file ? [file] : [];
  });
}

export function UploadAdapter({
  upload,
  label,
  dropzone = false,
  slotClassNames,
  renderAction,
  renderProgress,
  ref,
  className,
  onDrop,
  onDragEnter,
  onDragLeave,
  onDragOver,
  onFocusCapture,
  ...props
}: UploadAdapterProps) {
  const root = useRef<HTMLDivElement>(null);
  const depth = useRef(0);
  const [dragging, setDragging] = useState(false);
  const focused = useRef<{ element: HTMLElement; index: number } | null>(null);
  useImperativeHandle(ref, () => root.current!);

  function resetDrag() {
    depth.current = 0;
    setDragging(false);
  }

  useLayoutEffect(() => {
    if (upload.disabled || !dropzone) resetDrag();
  }, [upload.disabled, dropzone]);

  useLayoutEffect(() => {
    const previous = focused.current;
    if (!previous || previous.element.isConnected || !root.current) return;
    focused.current = null;
    const document = root.current.ownerDocument;
    if (document.activeElement && document.activeElement !== document.body) return;
    const rows = root.current.querySelectorAll<HTMLElement>('[data-upload-id]');
    const row = rows[Math.min(previous.index, rows.length - 1)];
    const target =
      row?.querySelector<HTMLButtonElement>('button:not([disabled])') ??
      root.current.querySelector<HTMLButtonElement>('[data-action="pick"] button');
    target?.focus();
  }, [upload.items]);

  const pickerProps = {
    action: 'pick' as const,
    label,
    disabled: upload.disabled || upload.picking,
    onClick() {
      void upload.pick();
    },
  };
  const announcements = [
    ...upload.items.map((item) => `${item.file.name}: ${uploadStatusLabels[item.status]}`),
    ...upload.rejections.map((item) => `${item.file.name}: ${rejectionLabels[item.reason]}`),
    ...(upload.pickFailed ? ['Не удалось открыть выбор файлов'] : []),
  ].join('. ');

  return (
    <div
      {...props}
      ref={root}
      data-ui="upload"
      data-dropzone={dropzone || undefined}
      data-dragging={dragging || undefined}
      data-disabled={upload.disabled || undefined}
      className={[slotClassNames?.root, className].filter(Boolean).join(' ')}
      onFocusCapture={(event) => {
        onFocusCapture?.(event);
        const row = (event.target as HTMLElement).closest<HTMLElement>('[data-upload-id]');
        focused.current = row
          ? {
              element: event.target as HTMLElement,
              index: upload.items.findIndex((item) => item.id === row.dataset.uploadId),
            }
          : null;
      }}
      onDragEnter={(event) => {
        onDragEnter?.(event);
        if (event.defaultPrevented || !dropzone || upload.disabled || !hasFiles(event)) return;
        event.preventDefault();
        depth.current++;
        setDragging(true);
      }}
      onDragLeave={(event) => {
        onDragLeave?.(event);
        if (event.defaultPrevented || !dropzone || upload.disabled) return;
        depth.current = Math.max(0, depth.current - 1);
        if (!depth.current) setDragging(false);
      }}
      onDragOver={(event) => {
        onDragOver?.(event);
        if (event.defaultPrevented || !dropzone || upload.disabled || !hasFiles(event)) return;
        event.preventDefault();
        event.dataTransfer.dropEffect = 'copy';
      }}
      onDrop={(event) => {
        onDrop?.(event);
        resetDrag();
        if (event.defaultPrevented || !dropzone || upload.disabled || !hasFiles(event)) return;
        event.preventDefault();
        upload.add(droppedFiles(event.dataTransfer));
      }}
    >
      <div
        data-slot="dropzone"
        className={slotClassNames?.dropzone}
        aria-busy={upload.picking || undefined}
      >
        {dropzone && <span>Перетащите файлы сюда или выберите их кнопкой</span>}
        <span data-action="pick">
          {renderAction ? (
            renderAction(pickerProps)
          ) : (
            <button type="button" onClick={pickerProps.onClick} disabled={pickerProps.disabled}>
              {label}
            </button>
          )}
        </span>
      </div>
      {upload.items.length > 0 && (
        <ul data-slot="list" className={slotClassNames?.list} aria-label="Выбранные файлы">
          {upload.items.map((item) => (
            <UploadItemAdapter
              key={item.id}
              item={item}
              upload={upload}
              slotClassNames={slotClassNames}
              renderAction={renderAction}
              renderProgress={renderProgress}
            />
          ))}
        </ul>
      )}
      {upload.rejections.length > 0 && (
        <div data-slot="rejections" className={slotClassNames?.rejections}>
          {upload.rejections.map((item, index) => (
            <p key={index}>
              {item.file.name}: {rejectionLabels[item.reason]}
            </p>
          ))}
        </div>
      )}
      {upload.pickFailed && <p data-slot="rejections">Не удалось открыть выбор файлов</p>}
      <span
        role="status"
        aria-live="polite"
        aria-atomic="true"
        style={{
          position: 'absolute',
          width: 1,
          height: 1,
          padding: 0,
          margin: -1,
          overflow: 'hidden',
          clipPath: 'inset(50%)',
          whiteSpace: 'nowrap',
          border: 0,
        }}
      >
        {announcements}
      </span>
    </div>
  );
}
