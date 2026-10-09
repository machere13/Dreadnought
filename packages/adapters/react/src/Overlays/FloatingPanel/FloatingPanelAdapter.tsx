import { useCallback, useEffect, useState } from 'react';
import type { ComponentPropsWithoutRef, CSSProperties, ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { useFloatingPanel } from './useFloatingPanel.ts';
import type { FloatingPanelTriggerProps, UseFloatingPanelOptions } from './useFloatingPanel.ts';

export interface FloatingPanelControls { close: () => void }
export type FloatingPanelAdapterProps = UseFloatingPanelOptions &
  Omit<ComponentPropsWithoutRef<'div'>,
    'children' | 'content' | 'id' | 'role' | 'hidden' | 'tabIndex' | 'aria-modal' | 'dangerouslySetInnerHTML'
  > & {
    content: ReactNode | ((controls: FloatingPanelControls) => ReactNode);
    children: (trigger: FloatingPanelTriggerProps) => ReactNode;
    rootClassName?: string;
    rootStyle?: CSSProperties;
  };

export function FloatingPanelAdapter({
  open, defaultOpen, disabled, onOpenChange,
  content, children, rootClassName, rootStyle,
  onKeyDown, onFocusCapture, onBlurCapture,
  'aria-labelledby': labelledBy, ...native
}: FloatingPanelAdapterProps) {
  const panel = useFloatingPanel({ open, defaultOpen, disabled, onOpenChange });
  const [target, setTarget] = useState<Document | null>(null);
  useEffect(() => { setTarget(document); }, []);
  const attachTrigger = useCallback((node: HTMLButtonElement | null) => {
    panel.triggerProps.ref(node);
    if (node) setTarget(node.ownerDocument);
  }, [panel.triggerProps.ref]);
  if (!target) return null;
  return createPortal(
    <div data-ui="floating-panel-root" className={rootClassName} style={rootStyle}>
      <div
        {...native}
        {...panel.contentProps}
        data-ui="floating-panel"
        aria-labelledby={native['aria-label'] ? labelledBy : labelledBy ?? panel.contentProps['aria-labelledby']}
        onKeyDown={event => { onKeyDown?.(event); panel.contentProps.onKeyDown(event); }}
        onFocusCapture={event => { panel.contentProps.onFocusCapture(); onFocusCapture?.(event); }}
        onBlurCapture={event => { panel.contentProps.onBlurCapture(event); onBlurCapture?.(event); }}
      >
        {typeof content === 'function' ? content({ close: panel.close }) : content}
      </div>
      {children({ ...panel.triggerProps, ref: attachTrigger })}
    </div>,
    target.body,
  );
}
