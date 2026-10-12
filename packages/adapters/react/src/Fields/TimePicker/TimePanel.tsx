import { Fragment, useLayoutEffect, useRef, useState } from 'react';
import type { KeyboardEvent, MutableRefObject } from 'react';
import { getNextEnabledValue } from '@dreadnought/core';
import type { NavigationDirection, TimePart } from '@dreadnought/core';
import type {
  TimePickerAdapterProps,
  TimePickerActionProps,
  TimePickerSlotClassNames,
  UseTimePickerResult,
} from './timePicker.types.ts';

const titles = { hour: 'Hours', minute: 'Minutes', second: 'Seconds' };

export function nativeTimePickerAction({ action: _action, ...props }: TimePickerActionProps) {
  return <button {...props} />;
}

interface TimePanelProps {
  picker: UseTimePickerResult;
  slotClassNames: TimePickerSlotClassNames;
  focusRequested: MutableRefObject<boolean>;
  renderAction: NonNullable<TimePickerAdapterProps['renderAction']>;
  confirm(): void;
}

export function TimePanel({
  picker,
  slotClassNames,
  focusRequested,
  renderAction,
  confirm,
}: TimePanelProps) {
  const root = useRef<HTMLDivElement>(null);
  const parts: TimePart[] = picker.showSeconds ? ['hour', 'minute', 'second'] : ['hour', 'minute'];
  const [focused, setFocused] = useState(picker.selection);
  const active = Object.fromEntries(
    parts.map((part) => {
      const options = picker.columns[part];
      const found = [focused[part], picker.selection[part]].find((value) =>
        options.some((option) => option.value === value && !option.disabled),
      );
      return [part, found ?? options.find((option) => !option.disabled)?.value ?? null];
    }),
  ) as Record<TimePart, number | null>;

  function focus(part: TimePart, value: number | null) {
    if (value === null) return;
    root.current
      ?.querySelector<HTMLElement>(`[data-time-part="${part}"][data-time-value="${value}"]`)
      ?.focus({ preventScroll: true });
  }
  useLayoutEffect(() => {
    const node = root.current;
    if (!node) return;
    if (focusRequested.current) {
      focusRequested.current = false;
      if (active.hour !== null && !picker.readOnly) focus('hour', active.hour);
      else node.focus({ preventScroll: true });
      return;
    }
    const target = node.ownerDocument.activeElement as HTMLElement | null;
    const part = target?.dataset.timePart as TimePart | undefined;
    if (part && node.contains(target) && target?.getAttribute('aria-disabled') === 'true') {
      if (active[part] !== null && !picker.readOnly) focus(part, active[part]);
      else node.focus({ preventScroll: true });
    }
  }, [picker.columns, picker.readOnly]);

  function keyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (
      event.defaultPrevented ||
      event.nativeEvent.isComposing ||
      event.altKey ||
      event.ctrlKey ||
      event.metaKey
    )
      return;
    const target = event.target as HTMLElement;
    const part = target.dataset.timePart as TimePart | undefined;
    if (!part || picker.readOnly) return;
    const value = Number(target.dataset.timeValue);
    const direction: Record<string, NavigationDirection> = {
      ArrowUp: 'previous',
      ArrowDown: 'next',
      Home: 'first',
      End: 'last',
    };
    if (direction[event.key]) {
      event.preventDefault();
      const next = getNextEnabledValue(
        picker.columns[part].map((option) => ({
          value: String(option.value),
          disabled: option.disabled,
        })),
        String(value),
        direction[event.key],
        { loop: false },
      );
      if (next !== undefined) focus(part, Number(next));
    } else if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      event.preventDefault();
      const next = parts[parts.indexOf(part) + (event.key === 'ArrowLeft' ? -1 : 1)];
      if (next) focus(next, active[next]);
    } else if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      picker.choose(part, value);
    }
  }

  return (
    <div ref={root} tabIndex={-1} onKeyDown={keyDown}>
      <div data-slot="columns" className={slotClassNames.columns}>
        {parts.map((part) => (
          <div
            key={part}
            role="listbox"
            aria-label={titles[part]}
            aria-readonly={picker.readOnly || undefined}
            data-slot="column"
            className={slotClassNames.column}
          >
            {picker.columns[part].map((option) => (
              <Fragment key={option.value}>
                {renderAction({
                  action: 'option',
                  type: 'button',
                  role: 'option',
                  'aria-label': `${titles[part]} ${option.label}`,
                  'aria-selected': picker.selection[part] === option.value,
                  'aria-disabled': option.disabled || picker.readOnly || undefined,
                  disabled: option.disabled || picker.readOnly,
                  tabIndex: !picker.readOnly && active[part] === option.value ? 0 : -1,
                  'data-time-part': part,
                  'data-time-value': option.value,
                  className: slotClassNames.option,
                  onFocus: (event) => {
                    setFocused((current) => ({ ...current, [part]: option.value }));
                    const item = event.currentTarget;
                    const column = item.closest<HTMLElement>('[data-slot="column"]');
                    if (!column) return;
                    const itemRect = item.getBoundingClientRect();
                    const columnRect = column.getBoundingClientRect();
                    if (itemRect.top < columnRect.top)
                      column.scrollTop += itemRect.top - columnRect.top;
                    else if (itemRect.bottom > columnRect.bottom)
                      column.scrollTop += itemRect.bottom - columnRect.bottom;
                  },
                  onClick: () => picker.choose(part, option.value),
                  children: option.label,
                })}
              </Fragment>
            ))}
          </div>
        ))}
      </div>
      <div data-slot="footer" className={slotClassNames.footer}>
        {renderAction({
          action: 'confirm',
          type: 'button',
          'aria-label': 'Confirm time',
          disabled: picker.readOnly || Boolean(picker.error) || !picker.draft,
          onClick: confirm,
          children: 'Confirm',
        })}
      </div>
    </div>
  );
}
