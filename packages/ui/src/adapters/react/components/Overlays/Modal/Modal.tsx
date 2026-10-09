import { ModalAdapter } from '@dreadnought/react/unstyled';
import type { ModalAdapterProps } from '@dreadnought/react/unstyled';
import type { ReactNode } from 'react';
import { modalPresentation } from '#presentation/Overlays/Modal/modalPresentation.ts';
import { Button } from '../../Controls/Button/Button.tsx';
import { Icon } from '../../DataDisplay/Icon/Icon.tsx';

export type ModalProps = ModalAdapterProps & {
  closable?: boolean;
  closeIcon?: ReactNode;
  closeLabel?: string;
};

export function Modal({
  closable = true,
  closeIcon = <Icon name="close" />,
  closeLabel = 'Закрыть окно',
  content,
  className,
  ...props
}: ModalProps) {
  return (
    <ModalAdapter
      {...props}
      className={[modalPresentation.root, className].filter(Boolean).join(' ')}
      content={(controls) => (
        <>
          {closable && (
            <div className={modalPresentation.actions} data-slot="close">
              <Button
                type="button"
                variant="ghosted"
                size="compact"
                disabled={props.disabled}
                aria-label={closeLabel}
                icon={closeIcon}
                onClick={controls.close}
              />
            </div>
          )}
          {typeof content === 'function' ? content(controls) : content}
        </>
      )}
    />
  );
}
