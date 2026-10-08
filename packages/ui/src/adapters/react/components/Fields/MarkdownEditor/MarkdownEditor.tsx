import { MarkdownEditorAdapter } from '@dreadnought/react/unstyled';
import type {
  MarkdownEditorAdapterProps,
  MarkdownEditorControls,
} from '@dreadnought/react/unstyled';
import { useToolbarItem } from '@dreadnought/react/logic';
import type { TooltipTriggerProps } from '@dreadnought/react/logic';
import type { CSSProperties } from 'react';
import type { IconName } from '@dreadnought/ui';
import { markdownEditorPresentation } from '#presentation/Fields/MarkdownEditor/markdownEditorPresentation.ts';
import { textAreaPresentation } from '#presentation/Fields/TextArea/textAreaPresentation.ts';
import { Button } from '../../Controls/Button/index.ts';
import { Toolbar } from '../../Controls/Toolbar/index.ts';
import { Icon } from '../../DataDisplay/Icon/index.ts';
import { MarkdownPreview } from '../../DataDisplay/MarkdownPreview/index.ts';
import { Alert } from '../../Feedback/Alert/index.ts';
import { Tooltip } from '../../Overlays/Tooltip/index.ts';

const actions = [
  { id: 'bold', label: 'Жирный', icon: 'bold', command: { type: 'bold' } },
  { id: 'italic', label: 'Курсив', icon: 'italic', command: { type: 'italic' } },
  {
    id: 'strikethrough',
    label: 'Зачёркнутый',
    icon: 'strikethrough',
    command: { type: 'strikethrough' },
  },
  { id: 'heading', label: 'Заголовок H2', icon: 'heading', command: { type: 'heading', level: 2 } },
  { id: 'quote', label: 'Цитата', icon: 'quote', command: { type: 'quote' } },
  {
    id: 'unorderedList',
    label: 'Маркированный список',
    icon: 'unordered-list',
    command: { type: 'list', style: 'unordered' },
  },
  {
    id: 'orderedList',
    label: 'Нумерованный список',
    icon: 'ordered-list',
    command: { type: 'list', style: 'ordered' },
  },
  { id: 'inlineCode', label: 'Код в строке', icon: 'code', command: { type: 'inlineCode' } },
  { id: 'codeBlock', label: 'Блок кода', icon: 'code-block', command: { type: 'codeBlock' } },
  { id: 'link', label: 'Ссылка', icon: 'link', command: { type: 'link' } },
  { id: 'image', label: 'Изображение', icon: 'image', command: { type: 'image' } },
  { id: 'table', label: 'Таблица', icon: 'table', command: { type: 'table' } },
] as const satisfies readonly {
  id: string;
  label: string;
  icon: IconName;
  command: Parameters<MarkdownEditorControls['execute']>[0];
}[];

export type MarkdownEditorLabels = Record<
  | (typeof actions)[number]['id']
  | 'toolbar'
  | 'undo'
  | 'redo'
  | 'edit'
  | 'preview'
  | 'live'
  | 'cancelUpload'
  | 'uploadError',
  string
>;
export type MarkdownEditorProps = MarkdownEditorAdapterProps & {
  toolbar?: boolean;
  labels?: Partial<MarkdownEditorLabels>;
};

type ToolbarButtonProps = {
  id: string;
  label: string;
  icon: IconName;
  onClick: () => void;
  disabled?: boolean;
  loading?: boolean;
  pressed?: boolean;
};

function ToolbarButton(props: ToolbarButtonProps) {
  return (
    <Tooltip content={props.label} placement="top">
      {(trigger) => <ToolbarButtonContent {...props} trigger={trigger} />}
    </Tooltip>
  );
}

function ToolbarButtonContent({
  id,
  label,
  icon,
  onClick,
  disabled = false,
  loading = false,
  pressed,
  trigger,
}: ToolbarButtonProps & { trigger: TooltipTriggerProps }) {
  const { itemProps } = useToolbarItem<HTMLButtonElement>({
    value: id,
    disabled: disabled || loading,
    ref: trigger.ref,
    onFocus: trigger.onFocus,
    onKeyDown: trigger.onKeyDown,
  });
  return (
    <Button
      {...trigger}
      {...itemProps}
      type="button"
      size="compact"
      variant="ghosted"
      aria-label={label}
      icon={<Icon name={icon} />}
      disabled={disabled}
      loading={loading}
      aria-pressed={pressed}
      onClick={onClick}
    />
  );
}

export function MarkdownEditor({
  toolbar = true,
  labels,
  renderToolbar,
  renderPreview,
  className,
  style,
  rows = 8,
  ...props
}: MarkdownEditorProps) {
  const bounds = {
    ...style,
    '--dreadnought-text-area-min-rows':
      !props.autoSize && (props.minRows !== undefined || props.maxRows !== undefined)
        ? Math.min(props.minRows ?? 1, props.maxRows ?? Infinity)
        : undefined,
    '--dreadnought-text-area-max-rows': props.autoSize ? undefined : props.maxRows,
  } as CSSProperties;
  return (
    <div className={markdownEditorPresentation.root} data-invalid={props.invalid || undefined}>
      <MarkdownEditorAdapter
        {...props}
        rows={rows}
        style={bounds}
        className={[textAreaPresentation.root, markdownEditorPresentation.field, className]
          .filter(Boolean)
          .join(' ')}
        renderPreview={renderPreview ?? ((value) => <MarkdownPreview value={value} />)}
        renderToolbar={
          !toolbar
            ? undefined
            : (renderToolbar ??
              ((controls) => (
                <>
                  <Toolbar
                    className={markdownEditorPresentation.toolbar}
                    aria-label={labels?.toolbar ?? 'Форматирование Markdown'}
                  >
                    <div role="group" className={markdownEditorPresentation.toolbarGroup}>
                      {actions.map((action) => (
                        <ToolbarButton
                          key={action.id}
                          id={action.id}
                          label={labels?.[action.id] ?? action.label}
                          icon={action.icon}
                          onClick={() => {
                            if (action.id === 'image') {
                              void controls.insertImage();
                            } else {
                              controls.execute(action.command);
                            }
                          }}
                          loading={
                            action.id === 'image' &&
                            (controls.imageUploadState === 'selecting' ||
                              controls.imageUploadState === 'uploading')
                          }
                          disabled={
                            controls.disabled || controls.readOnly || controls.preview === 'preview'
                          }
                        />
                      ))}
                    </div>
                    <div role="group" className={markdownEditorPresentation.toolbarGroup}>
                      <ToolbarButton
                        id="undo"
                        label={labels?.undo ?? 'Отменить'}
                        icon="undo"
                        onClick={controls.undo}
                        disabled={!controls.canUndo}
                      />
                      <ToolbarButton
                        id="redo"
                        label={labels?.redo ?? 'Повторить'}
                        icon="redo"
                        onClick={controls.redo}
                        disabled={!controls.canRedo}
                      />
                      {(controls.imageUploadState === 'selecting' ||
                        controls.imageUploadState === 'uploading') && (
                        <ToolbarButton
                          id="cancelUpload"
                          label={labels?.cancelUpload ?? 'Отменить загрузку изображения'}
                          icon="close"
                          onClick={controls.cancelImageUpload}
                        />
                      )}
                      <ToolbarButton
                        id="edit"
                        label={labels?.edit ?? 'Редактирование'}
                        icon="code"
                        onClick={() => controls.setPreview('edit')}
                        pressed={controls.preview === 'edit'}
                      />
                      <ToolbarButton
                        id="live"
                        label={labels?.live ?? 'Текст и предпросмотр'}
                        icon="columns"
                        onClick={() => controls.setPreview('live')}
                        pressed={controls.preview === 'live'}
                      />
                      <ToolbarButton
                        id="preview"
                        label={labels?.preview ?? 'Предпросмотр'}
                        icon="eye"
                        onClick={() => controls.setPreview('preview')}
                        pressed={controls.preview === 'preview'}
                      />
                    </div>
                  </Toolbar>
                  {controls.imageUploadState === 'error' && (
                    <Alert
                      type="error"
                      showIcon
                      title={
                        labels?.uploadError ??
                        'Не удалось загрузить изображение. Попробуйте ещё раз.'
                      }
                    />
                  )}
                </>
              )))
        }
      />
    </div>
  );
}
