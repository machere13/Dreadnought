import { useId, useLayoutEffect, useRef, useState } from 'react';
import type { MouseEventHandler } from 'react';
import { getDisclosureOpen, getDisclosureState } from '@dreadnought/core';
import type { DisclosureAction } from '@dreadnought/core';
import styles from '../../shared/Documentation.module.css';

interface DisclosureDemoProps {
  open?: boolean;
  defaultOpen?: boolean;
  disabled?: boolean;
  onOpenChange?: (open: boolean) => void;
  onTriggerClick?: MouseEventHandler<HTMLButtonElement>;
}

export function DisclosureDemo({ open, defaultOpen = false, disabled = false,
  onOpenChange, onTriggerClick }: DisclosureDemoProps) {
  const id = useId();
  const [internal, setInternal] = useState(defaultOpen);
  const effectiveOpen = open === undefined ? internal : open;
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const wasOpen = useRef(effectiveOpen);
  const state = getDisclosureState({ open: effectiveOpen, disabled,
    triggerId: `${id}-trigger`, panelId: `${id}-panel` });

  useLayoutEffect(() => {
    const panel = panelRef.current;
    if (wasOpen.current && !effectiveOpen && panel?.contains(panel.ownerDocument.activeElement)) {
      triggerRef.current?.focus();
    }
    wasOpen.current = effectiveOpen;
  }, [effectiveOpen]);

  function request(action: DisclosureAction) {
    const next = getDisclosureOpen(effectiveOpen, action, { disabled });
    if (next === effectiveOpen) return;
    if (open === undefined) setInternal(next);
    onOpenChange?.(next);
  }

  return <div className={styles.demo}>
    <button {...state.triggerProps} ref={triggerRef} className={styles.coreDemoButton} onClick={event => {
      onTriggerClick?.(event);
      if (!event.defaultPrevented) request('toggle');
    }}>Дополнительные настройки</button>
    <div {...state.panelProps} ref={panelRef}>
      <input aria-label="Примечание" />
      <button type="button" className={styles.coreDemoButton} disabled={disabled}
        onClick={() => request('close')}>Закрыть настройки</button>
    </div>
  </div>;
}
