import { FloatingPanelAdapter } from '@dreadnought/react/unstyled';
import type { FloatingPanelAdapterProps } from '@dreadnought/react/unstyled';
import { useId } from 'react';
import type { ReactNode } from 'react';
import { floatingPanelPresentation as styles } from '#presentation/Overlays/FloatingPanel/floatingPanelPresentation.ts';
import { Button } from '../../Controls/Button/Button.tsx';
import { Icon } from '../../DataDisplay/Icon/Icon.tsx';

export type FloatingPanelProps = Omit<FloatingPanelAdapterProps, 'title'> & {
  title?: ReactNode;
  footer?: FloatingPanelAdapterProps['content'];
  closable?: boolean;
  closeIcon?: ReactNode;
  closeLabel?: string;
  placement?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
};

export function FloatingPanel({
  title,
  content,
  footer,
  children,
  className,
  rootClassName,
  placement = 'bottom-right',
  closable = true,
  closeIcon = <Icon name="close" />,
  closeLabel = 'Закрыть панель',
  ...props
}: FloatingPanelProps) {
  const titleId = useId();
  const hasTitle = title != null && title !== false;
  return (
    <FloatingPanelAdapter
      {...props}
      className={[styles.panel, className].filter(Boolean).join(' ')}
      rootClassName={[styles.root, styles[placement], rootClassName].filter(Boolean).join(' ')}
      aria-labelledby={
        props['aria-labelledby'] ?? (!props['aria-label'] && hasTitle ? titleId : undefined)
      }
      content={(controls) => {
        const footerContent = typeof footer === 'function' ? footer(controls) : footer;
        return (
          <>
            {(hasTitle || closable) && (
              <div className={styles.header} data-slot="header">
                {hasTitle && (
                  <h2 id={titleId} className={styles.title} data-slot="title">
                    {title}
                  </h2>
                )}
                {closable && (
                  <Button
                    type="button"
                    variant="ghosted"
                    size="compact"
                    className={styles.close}
                    data-slot="close"
                    disabled={props.disabled}
                    aria-label={closeLabel}
                    icon={closeIcon}
                    onClick={controls.close}
                  />
                )}
              </div>
            )}
            <div className={styles.body} data-slot="body">
              {typeof content === 'function' ? content(controls) : content}
            </div>
            {footerContent != null && footerContent !== false && (
              <div className={styles.footer} data-slot="footer">
                {footerContent}
              </div>
            )}
          </>
        );
      }}
    >
      {children}
    </FloatingPanelAdapter>
  );
}
