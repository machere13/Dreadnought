import { useEffect, useId, useLayoutEffect, useRef, useState } from 'react';
import { getNavigationDirection, getNextEnabledValue } from '@dreadnought/core';

export function ReorderProbe({ disabled = false }: { disabled?: boolean } = {}) {
  const [order, setOrder] = useState(['Alpha', 'Beta', 'Gamma']);
  const [session, setSession] = useState<{
    source: string;
    target: string;
    mode: 'keyboard' | 'pointer';
  } | null>(null);
  const [message, setMessage] = useState('Ready');
  const instructions = useId();
  const handles = useRef(new Map<string, HTMLButtonElement>());
  const focusAfter = useRef<string | null>(null);
  useLayoutEffect(() => {
    if (focusAfter.current === null) {
      return;
    }
    handles.current.get(focusAfter.current)?.focus();
    focusAfter.current = null;
  }, [order, session]);
  useEffect(() => {
    if (disabled && session) {
      setMessage(`Cancelled move of ${session.source}.`);
      setSession(null);
    }
  }, [disabled, session]);
  function finish(target?: string, restoreFocus = true) {
    if (!session) {
      return;
    }
    if (target !== undefined) {
      const next = [...order];
      const from = next.indexOf(session.source);
      const to = next.indexOf(target);
      next.splice(from, 1);
      next.splice(to, 0, session.source);
      setOrder(next);
      setMessage(`Moved ${session.source} to position ${to + 1} of ${next.length}.`);
    } else {
      setMessage(`Cancelled move of ${session.source}.`);
    }
    if (restoreFocus) {
      focusAfter.current = session.source;
    }
    setSession(null);
  }
  return (
    <>
      <p id={instructions}>
        Space or Enter starts a move. Arrows, Home and End choose a position. Space or Enter
        confirms; Escape cancels. Or drag a handle onto another row.
      </p>
      <ol aria-label="Tasks">
        {order.map((value) => (
          <li
            key={value}
            onDragOver={(event) => {
              if (disabled || event.defaultPrevented || session?.mode !== 'pointer') {
                return;
              }
              event.preventDefault();
              event.dataTransfer.dropEffect = 'move';
              setSession({ ...session, target: value });
            }}
            onDrop={(event) => {
              if (disabled || event.defaultPrevented || session?.mode !== 'pointer') {
                return;
              }
              event.preventDefault();
              finish(value);
            }}
          >
            <button
              type="button"
              disabled={disabled}
              draggable={!disabled}
              aria-describedby={instructions}
              ref={(node) => {
                if (node) {
                  handles.current.set(value, node);
                } else {
                  handles.current.delete(value);
                }
              }}
              onDragStart={(event) => {
                if (disabled || event.defaultPrevented || session || !event.dataTransfer) {
                  event.preventDefault();
                  return;
                }
                event.dataTransfer.setData('application/x-dreadnought-reorder-probe', value);
                event.dataTransfer.effectAllowed = 'move';
                setSession({ source: value, target: value, mode: 'pointer' });
              }}
              onDragEnd={() => {
                if (session?.mode === 'pointer') {
                  finish();
                }
              }}
              onBlur={() => {
                if (session?.mode === 'keyboard' && session.source === value) {
                  finish(undefined, false);
                }
              }}
              onKeyDown={(event) => {
                if (
                  disabled ||
                  event.defaultPrevented ||
                  event.nativeEvent.isComposing ||
                  event.ctrlKey ||
                  event.altKey ||
                  event.metaKey
                ) {
                  return;
                }
                if (
                  session?.mode === 'keyboard' &&
                  session.source === value &&
                  event.key === 'Tab'
                ) {
                  finish(undefined, false);
                  return;
                }
                if (
                  event.shiftKey ||
                  session?.mode === 'pointer' ||
                  (session && session.source !== value)
                ) {
                  return;
                }
                if (event.key === ' ' || event.key === 'Enter') {
                  event.preventDefault();
                  if (event.repeat) {
                    return;
                  }
                  if (session) {
                    finish(session.target);
                  } else {
                    setSession({ source: value, target: value, mode: 'keyboard' });
                  }
                  return;
                }
                if (!session) {
                  return;
                }
                if (event.key === 'Escape') {
                  event.preventDefault();
                  finish();
                  return;
                }
                const direction = getNavigationDirection(event.key);
                if (!direction) {
                  return;
                }
                const target = getNextEnabledValue(
                  order.map((item) => ({ value: item })),
                  session.target,
                  direction,
                  { loop: false },
                );
                if (target !== undefined) {
                  event.preventDefault();
                  setSession({ ...session, target });
                }
              }}
            >
              Move {value}
            </button>
          </li>
        ))}
      </ol>
      <p role="status">
        {session
          ? `Moving ${session.source}: position ${order.indexOf(session.target) + 1} of ${order.length}.`
          : message}
      </p>
    </>
  );
}
