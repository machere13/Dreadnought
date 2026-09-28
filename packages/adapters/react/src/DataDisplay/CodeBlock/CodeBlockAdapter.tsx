import type { ComponentPropsWithRef, ReactNode } from 'react';
import { ButtonAdapter } from '../../Controls/Button/ButtonAdapter.tsx';
import { useCodeBlockCopy } from './useCodeBlockCopy.ts';

export type CodeBlockAdapterProps = Omit<ComponentPropsWithRef<'div'>, 'children' | 'onCopy'> & {
  code: string;
  language?: string;
  copyable?: boolean;
  copyLabels?: { copy: string; copied: string; error: string };
  copyIcons?: Partial<Record<'copy' | 'copied' | 'error', ReactNode>>;
  onCopy?: (code: string) => void;
  onCopyError?: (error: unknown) => void;
  slotClassNames?: { header?: string; pre?: string; code?: string; copyButton?: string };
};

const defaultLabels = { copy: 'Copy', copied: 'Copied', error: 'Copy failed' };

export function CodeBlockAdapter({
  code,
  language,
  copyable = true,
  copyLabels = defaultLabels,
  copyIcons,
  onCopy,
  onCopyError,
  slotClassNames,
  ref,
  ...rootProps
}: CodeBlockAdapterProps) {
  const { status, handleCopy } = useCodeBlockCopy(code, onCopy, onCopyError);
  const label = status === 'copied' ? copyLabels.copied : status === 'error' ? copyLabels.error : copyLabels.copy;
  const icon = copyIcons?.[status === 'copied' || status === 'error' ? status : 'copy'];

  return (
    <div {...rootProps} ref={ref} data-ui="code-block">
      {(language !== undefined || copyable) && (
        <div data-slot="header" className={slotClassNames?.header}>
          {language !== undefined && <span data-slot="language">{language}</span>}
          {copyable && (
            <ButtonAdapter type="button" loading={status === 'pending'} className={slotClassNames?.copyButton}
              icon={icon} aria-label={icon != null ? label : undefined} onClick={handleCopy}>
              {icon == null ? label : null}
            </ButtonAdapter>
          )}
        </div>
      )}
      <pre data-slot="pre" className={slotClassNames?.pre}><code data-slot="code" className={slotClassNames?.code}>{code}</code></pre>
    </div>
  );
}
