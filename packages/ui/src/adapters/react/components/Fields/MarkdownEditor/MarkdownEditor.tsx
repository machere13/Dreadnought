import { MarkdownEditorAdapter } from '@dreadnought/react/unstyled';
import type { MarkdownEditorAdapterProps, MarkdownEditorControls } from '@dreadnought/react/unstyled';
import { useToolbarItem } from '@dreadnought/react/logic';
import type { CSSProperties } from 'react';
import type { IconName } from '@dreadnought/ui';
import { markdownEditorPresentation } from '#presentation/Fields/MarkdownEditor/markdownEditorPresentation.ts';
import { textAreaPresentation } from '#presentation/Fields/TextArea/textAreaPresentation.ts';
import { Button } from '../../Controls/Button/index.ts';
import { Toolbar } from '../../Controls/Toolbar/index.ts';
import { Icon } from '../../DataDisplay/Icon/index.ts';

const actions = [
  { id: 'bold', label: 'Жирный', icon: 'bold', command: { type: 'bold' } },
  { id: 'italic', label: 'Курсив', icon: 'italic', command: { type: 'italic' } },
  { id: 'strikethrough', label: 'Зачёркнутый', icon: 'strikethrough', command: { type: 'strikethrough' } },
  { id: 'heading', label: 'Заголовок H2', icon: 'heading', command: { type: 'heading', level: 2 } },
  { id: 'quote', label: 'Цитата', icon: 'quote', command: { type: 'quote' } },
  { id: 'unorderedList', label: 'Маркированный список', icon: 'unordered-list', command: { type: 'list', style: 'unordered' } },
  { id: 'orderedList', label: 'Нумерованный список', icon: 'ordered-list', command: { type: 'list', style: 'ordered' } },
  { id: 'inlineCode', label: 'Код в строке', icon: 'code', command: { type: 'inlineCode' } },
  { id: 'codeBlock', label: 'Блок кода', icon: 'code-block', command: { type: 'codeBlock' } },
  { id: 'link', label: 'Ссылка', icon: 'link', command: { type: 'link' } },
  { id: 'image', label: 'Изображение', icon: 'image', command: { type: 'image' } },
  { id: 'table', label: 'Таблица', icon: 'table', command: { type: 'table' } },
] as const satisfies readonly { id: string; label: string; icon: IconName; command: Parameters<MarkdownEditorControls['execute']>[0] }[];

export type MarkdownEditorLabels = Record<typeof actions[number]['id'] | 'toolbar', string>;
export type MarkdownEditorProps = MarkdownEditorAdapterProps & {
  toolbar?: boolean;
  labels?: Partial<MarkdownEditorLabels>;
};

function CommandButton({ action, label, execute, disabled }: { action: typeof actions[number]; label: string; execute: MarkdownEditorControls['execute']; disabled: boolean }) {
  const { itemProps } = useToolbarItem<HTMLButtonElement>({ value: action.id, disabled });
  return <Button {...itemProps} type="button" size="compact" variant="ghosted" aria-label={label} title={label}
    icon={<Icon name={action.icon} />} disabled={disabled} onClick={() => execute(action.command)} />;
}

export function MarkdownEditor({ toolbar = true, labels, renderToolbar, className, style, rows = 8, ...props }: MarkdownEditorProps) {
  const bounds = {
    ...style,
    '--dreadnought-text-area-min-rows': !props.autoSize && (props.minRows !== undefined || props.maxRows !== undefined)
      ? Math.min(props.minRows ?? 1, props.maxRows ?? Infinity) : undefined,
    '--dreadnought-text-area-max-rows': props.autoSize ? undefined : props.maxRows,
  } as CSSProperties;
  return <div className={markdownEditorPresentation.root} data-invalid={props.invalid || undefined}>
    <MarkdownEditorAdapter {...props} rows={rows} style={bounds}
      className={[textAreaPresentation.root, markdownEditorPresentation.field, className].filter(Boolean).join(' ')}
      renderToolbar={!toolbar ? undefined : renderToolbar ?? (({ execute, disabled, readOnly }) =>
        <Toolbar className={markdownEditorPresentation.toolbar} aria-label={labels?.toolbar ?? 'Форматирование Markdown'}>
          {actions.map(action => <CommandButton key={action.id} action={action} label={labels?.[action.id] ?? action.label}
            execute={execute} disabled={disabled || readOnly} />)}
        </Toolbar>)} />
  </div>;
}
