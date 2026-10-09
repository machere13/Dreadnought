import { ModalAdapter } from '@dreadnought/react/unstyled';
import type { ModalAdapterProps } from '@dreadnought/react/unstyled';
import { useId } from 'react';
import type { ReactNode } from 'react';
import { modalPresentation } from '#presentation/Overlays/Modal/modalPresentation.ts';
import { Button } from '../../Controls/Button/Button.tsx';
import { Icon } from '../../DataDisplay/Icon/Icon.tsx';

export type ModalProps = Omit<ModalAdapterProps, 'title'> & {
  title?: ReactNode;
  footer?: ModalAdapterProps['content'];
  closable?: boolean;
  closeIcon?: ReactNode;
  closeLabel?: string;
};

export function Modal({
  closable = true,
  closeIcon = <Icon name="close" />,
  closeLabel = 'Закрыть окно',
  title,
  content,
  footer,
  className,
  ...props
}: ModalProps) {
  const titleId = useId();
  const hasTitle = title != null && title !== false;
  return (
    <ModalAdapter
      {...props}
      className={[modalPresentation.root, className].filter(Boolean).join(' ')}
      aria-labelledby={
        props['aria-labelledby'] ?? (!props['aria-label'] && hasTitle ? titleId : undefined)
      }
      content={(controls) => {
        const footerContent = typeof footer === 'function' ? footer(controls) : footer;
        const hasFooter = footerContent != null && footerContent !== false;
        return (
          <>
            {(hasTitle || closable) && (
              <div className={modalPresentation.header} data-slot="header">
                {hasTitle && (
                  <h2 id={titleId} className={modalPresentation.title} data-slot="title">
                    {title}
                  </h2>
                )}
                {closable && (
                  <Button
                    type="button"
                    variant="ghosted"
                    size="compact"
                    className={modalPresentation.close}
                    data-slot="close"
                    disabled={props.disabled}
                    aria-label={closeLabel}
                    icon={closeIcon}
                    onClick={controls.close}
                  />
                )}
              </div>
            )}
            <div className={modalPresentation.body} data-slot="body">
              {typeof content === 'function' ? content(controls) : content}
            </div>
            {hasFooter && (
              <div className={modalPresentation.footer} data-slot="footer">
                {footerContent}
              </div>
            )}
          </>
        );
      }}
    />
  );
}
