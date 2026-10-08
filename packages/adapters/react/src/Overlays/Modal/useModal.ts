import { useCallback, useEffect, useId, useLayoutEffect, useRef, useState } from 'react';
import type { ButtonHTMLAttributes, KeyboardEvent, PointerEvent } from 'react';
import { getDisclosureOpen, getModalState, getNextEnabledValue } from '@dreadnought/core';
import { getFocusableElements } from '../../shared/getFocusableElements.ts';

export interface UseModalOptions {
  open?: boolean;
  defaultOpen?: boolean;
  disabled?: boolean;
  onOpenChange?: (open: boolean) => void;
  closeOnEscape?: boolean;
  closeOnBackdrop?: boolean;
}
export type ModalTriggerProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  ref: (node: HTMLButtonElement | null) => void;
};
const scrollLocks = new WeakMap<Document, { count: number; overflow: string; priority: string }>();

export function useModal({
  open: controlled,
  defaultOpen = false,
  disabled = false,
  onOpenChange,
  closeOnEscape = true,
  closeOnBackdrop = true,
}: UseModalOptions = {}) {
  const id = useId();
  const [internal, setInternal] = useState(defaultOpen);
  const dialog = useRef<HTMLDialogElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const closing = useRef(false);
  const opener = useRef<Element | null>(null);
  const backdropPointer = useRef<number | undefined>(undefined);
  const state = getModalState({
    triggerId: `${id}-trigger`,
    panelId: id,
    open: controlled ?? internal,
    disabled,
  });
  const current = useRef({ open: state.open, controlled, disabled, onOpenChange });
  current.current = { open: state.open, controlled, disabled, onOpenChange };
  const attach = useCallback((node: HTMLButtonElement | null) => {
    trigger.current = node;
  }, []);
  function request(next: boolean) {
    const options = current.current;
    next = getDisclosureOpen(options.open, next ? 'open' : 'close', { disabled: options.disabled });
    if (next === options.open) {
      return;
    }
    if (options.controlled === undefined) {
      options.open = next;
      setInternal(next);
    }
    options.onOpenChange?.(next);
  }
  useLayoutEffect(() => {
    const node = dialog.current;
    if (!state.open || !node) {
      return;
    }
    const document = node.ownerDocument;
    opener.current = document.activeElement;
    const style = document.documentElement.style;
    let lock = scrollLocks.get(document);
    if (!lock) {
      lock = {
        count: 0,
        overflow: style.getPropertyValue('overflow'),
        priority: style.getPropertyPriority('overflow'),
      };
      scrollLocks.set(document, lock);
    }
    if (!node.open) {
      node.showModal();
    }
    lock.count++;
    style.setProperty('overflow', 'hidden');
    if (!node.contains(document.activeElement)) {
      node.focus({ preventScroll: true });
    }
    return () => {
      closing.current = true;
      if (node.open) {
        node.close();
      }
      closing.current = false;
      backdropPointer.current = undefined;
      lock.count--;
      if (!lock.count) {
        if (lock.overflow) {
          style.setProperty('overflow', lock.overflow, lock.priority);
        } else {
          style.removeProperty('overflow');
        }
        scrollLocks.delete(document);
      }
    };
  }, [state.open]);
  useEffect(() => {
    const node = dialog.current;
    const target = opener.current;
    if (!state.open || !node) {
      return;
    }
    return () => {
      const document = node.ownerDocument;
      const HTMLElement = document.defaultView?.HTMLElement;
      const active = document.activeElement;
      if (
        (node.contains(active) || active === document.body) &&
        HTMLElement &&
        target instanceof HTMLElement &&
        target.isConnected
      ) {
        target.focus({ preventScroll: true });
      }
    };
  }, [state.open]);
  function outside(event: PointerEvent<HTMLDialogElement>) {
    if (event.target !== event.currentTarget) {
      return false;
    }
    const rect = event.currentTarget.getBoundingClientRect();
    return (
      event.clientX < rect.left ||
      event.clientX > rect.right ||
      event.clientY < rect.top ||
      event.clientY > rect.bottom
    );
  }
  const triggerProps: ModalTriggerProps = {
    ...state.triggerProps,
    ref: attach,
    onClick: () => request(true),
  };
  return {
    open: state.open,
    triggerProps,
    close: () => request(false),
    contentProps: {
      ...state.contentProps,
      ref: dialog,
      onKeyDown: (event: KeyboardEvent<HTMLDialogElement>) => {
        if (
          event.key !== 'Tab' ||
          event.defaultPrevented ||
          event.nativeEvent.isComposing ||
          event.ctrlKey ||
          event.altKey ||
          event.metaKey
        ) {
          return;
        }
        const node = event.currentTarget;
        const candidates = getFocusableElements(node);
        const radioGroups = new Map<HTMLFormElement | null, Map<string, HTMLInputElement>>();
        for (const element of candidates) {
          if (!element.matches('input[type="radio"]')) {
            continue;
          }
          const radio = element as HTMLInputElement;
          if (!radio.name) {
            continue;
          }
          let group = radioGroups.get(radio.form);
          if (!group) {
            group = new Map();
            radioGroups.set(radio.form, group);
          }
          if (!group.has(radio.name) || radio.checked) {
            group.set(radio.name, radio);
          }
        }
        const elements = candidates
          .filter((element) => {
            if (!element.matches('input[type="radio"]')) {
              return true;
            }
            const radio = element as HTMLInputElement;
            return !radio.name || radioGroups.get(radio.form)?.get(radio.name) === radio;
          })
          .sort((a, b) => (a.tabIndex || Infinity) - (b.tabIndex || Infinity));
        if (!elements.length) {
          event.preventDefault();
          node.focus({ preventScroll: true });
          return;
        }
        const active = node.ownerDocument.activeElement;
        const index = elements.findIndex((element) => element === active);
        if (index !== (event.shiftKey ? 0 : elements.length - 1) && active !== node) {
          return;
        }
        const next = getNextEnabledValue(
          elements.map((_, index) => ({ value: String(index) })),
          String(index),
          event.shiftKey ? 'previous' : 'next',
        );
        if (next !== undefined) {
          event.preventDefault();
          elements[Number(next)]!.focus({ preventScroll: true });
        }
      },
      onCancel: (event: { defaultPrevented: boolean; preventDefault(): void }) => {
        const prevented = event.defaultPrevented;
        event.preventDefault();
        if (!prevented && closeOnEscape) {
          request(false);
        }
      },
      onClose: () => {
        const node = dialog.current;
        if (!node || node.open || closing.current || !current.current.open) {
          return;
        }
        request(false);
        if (current.current.open && node.isConnected) {
          node.showModal();
        }
      },
      onPointerDown: (event: PointerEvent<HTMLDialogElement>) => {
        backdropPointer.current =
          !event.defaultPrevented && event.button === 0 && outside(event)
            ? event.pointerId
            : undefined;
      },
      onPointerUp: (event: PointerEvent<HTMLDialogElement>) => {
        const started = backdropPointer.current;
        backdropPointer.current = undefined;
        if (
          started !== undefined &&
          started === event.pointerId &&
          !event.defaultPrevented &&
          closeOnBackdrop &&
          outside(event)
        ) {
          request(false);
        }
      },
      onPointerCancel: () => {
        backdropPointer.current = undefined;
      },
    },
  };
}
