import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import type { KeyboardEvent, MutableRefObject } from 'react';
import {
  addCalendarMonths,
  assertCalendarDate,
  getCalendarGrid,
  isCalendarDateAllowed,
} from '@dreadnought/core';
import type { CalendarDate, CalendarNavigation } from '@dreadnought/core';
import type {
  DatePickerActionProps,
  DatePickerRenderers,
  DatePickerSlotClassNames,
  UseDatePickerResult,
} from './datePicker.types.ts';
import { firstDatePickerDay, localCalendarToday } from './datePickerState.ts';

export function calendarDateLabel(
  date: CalendarDate,
  locale: string,
  options: Intl.DateTimeFormatOptions,
) {
  const parts = assertCalendarDate(date);
  const value = new Date(0);
  value.setUTCFullYear(parts.year, parts.month - 1, parts.day);
  return new Intl.DateTimeFormat(locale, {
    ...options,
    calendar: 'gregory',
    timeZone: 'UTC',
  }).format(value);
}

export function nativeDatePickerAction({ action: _action, ...props }: DatePickerActionProps) {
  return <button {...props} />;
}

interface CalendarPanelProps extends DatePickerRenderers {
  picker: UseDatePickerResult;
  slotClassNames: DatePickerSlotClassNames;
  focusRequested: MutableRefObject<boolean>;
  choose(date: CalendarDate): void;
  cancel(): void;
}

export function CalendarPanel({
  picker,
  slotClassNames,
  focusRequested,
  choose,
  cancel,
  renderAction = nativeDatePickerAction,
  renderField = (props) => <input {...props} />,
  renderMonthSelect = ({ onChange, options, ...props }) => (
    <select {...props} onChange={(event) => onChange(event.target.value)}>
      {options.map((option) => (
        <option key={option.value} value={option.value} disabled={option.disabled}>
          {option.label}
        </option>
      ))}
    </select>
  ),
}: CalendarPanelProps) {
  const root = useRef<HTMLDivElement>(null);
  const cells = getCalendarGrid(picker.month, picker.weekStartsOn);
  const from =
    picker.range.start !== null && picker.range.end === null ? picker.range.start : undefined;
  const active = firstDatePickerDay(
    picker.month,
    picker.activeDate ?? picker.month,
    picker.constraints,
    picker.weekStartsOn,
    from,
  );
  const parts = assertCalendarDate(picker.month);
  const [yearText, setYearText] = useState(String(parts.year));
  useLayoutEffect(() => {
    setYearText(String(parts.year));
  }, [picker.month]);
  const title = calendarDateLabel(picker.month, picker.locale, { year: 'numeric', month: 'long' });
  const today = localCalendarToday();
  const lower = picker.constraints.minDate?.slice(0, 7) ?? '0001-01';
  const upper = picker.constraints.maxDate?.slice(0, 7) ?? '9999-12';
  const previous = addCalendarMonths(picker.month, -1);
  const next = addCalendarMonths(picker.month, 1);
  const selected =
    picker.value === null ? [] : typeof picker.value === 'string' ? [picker.value] : picker.value;
  const preview =
    picker.range.start &&
    picker.hoveredDate &&
    isCalendarDateAllowed(picker.hoveredDate, picker.constraints, picker.range.start)
      ? [picker.range.start, picker.hoveredDate].sort()
      : null;

  useEffect(() => {
    const node = root.current;
    if (!node) return;
    const focused = node.ownerDocument.activeElement;
    if (!focusRequested.current && !focused?.hasAttribute('data-date')) return;
    const target = active ? node.querySelector<HTMLButtonElement>(`[data-date="${active}"]`) : null;
    (target ?? node.querySelector<HTMLElement>('select, input, button:not(:disabled)'))?.focus({
      preventScroll: true,
    });
    focusRequested.current = false;
  }, [active, picker.month]);

  function keyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.defaultPrevented || event.nativeEvent.isComposing) return;
    if (event.key === 'Escape') {
      event.preventDefault();
      cancel();
      return;
    }
    if (
      !(event.target as HTMLElement).hasAttribute('data-date') ||
      event.altKey ||
      event.ctrlKey ||
      event.metaKey
    )
      return;
    const actions: Record<string, CalendarNavigation> = {
      ArrowLeft: 'previousDay',
      ArrowRight: 'nextDay',
      ArrowUp: 'previousWeek',
      ArrowDown: 'nextWeek',
      Home: 'weekStart',
      End: 'weekEnd',
      PageUp: event.shiftKey ? 'previousYear' : 'previousMonth',
      PageDown: event.shiftKey ? 'nextYear' : 'nextMonth',
    };
    const action = actions[event.key];
    if (action) {
      event.preventDefault();
      picker.move(action);
    }
  }
  function changeMonth(month: string) {
    picker.setMonth(`${parts.year.toString().padStart(4, '0')}-${month.padStart(2, '0')}-01`);
  }
  function confirmYear(text: string) {
    const year = Number(text);
    if (!/^\d{1,4}$/.test(text) || !Number.isInteger(year) || year < 1 || year > 9999) {
      setYearText(String(parts.year));
      return;
    }
    picker.setMonth(`${String(year).padStart(4, '0')}-${String(parts.month).padStart(2, '0')}-01`);
  }

  return (
    <div ref={root} onKeyDown={keyDown} data-ui="calendar-panel">
      <div className={slotClassNames.header} data-slot="header">
        {renderAction({
          action: 'previous',
          type: 'button',
          'aria-label': 'Previous month',
          disabled: previous === null || previous.slice(0, 7) < lower,
          onClick: () => previous && picker.setMonth(previous),
          children: '‹',
        })}
        {renderMonthSelect({
          value: String(parts.month),
          'aria-label': 'Month',
          disabled: picker.disabled,
          onChange: changeMonth,
          options: Array.from({ length: 12 }, (_, index) => {
            const date = `${parts.year.toString().padStart(4, '0')}-${String(index + 1).padStart(2, '0')}-01`;
            return {
              value: String(index + 1),
              label: calendarDateLabel(date, picker.locale, { month: 'long' }),
              disabled: date.slice(0, 7) < lower || date.slice(0, 7) > upper,
            };
          }),
        })}
        {renderField({
          type: 'number',
          'aria-label': 'Year',
          value: yearText,
          min: Number(lower.slice(0, 4)),
          max: Number(upper.slice(0, 4)),
          disabled: picker.disabled,
          onChange: (event) => {
            const text = event.target.value;
            setYearText(text);
            if (/^\d{4}$/.test(text)) confirmYear(text);
          },
          onBlur: () => confirmYear(yearText),
          onKeyDown: (event) => {
            if (event.key === 'Enter' && !event.nativeEvent.isComposing) {
              event.preventDefault();
              confirmYear(yearText);
            }
          },
        })}
        {renderAction({
          action: 'next',
          type: 'button',
          'aria-label': 'Next month',
          disabled: next === null || next.slice(0, 7) > upper,
          onClick: () => next && picker.setMonth(next),
          children: '›',
        })}
      </div>
      <span role="status" aria-live="polite" data-slot="month-status">
        {title}
      </span>
      <div role="grid" aria-label={title} className={slotClassNames.grid} data-slot="grid">
        <div role="row" data-slot="weekdays">
          {cells.slice(0, 7).map((cell) => (
            <span key={cell.weekday} role="columnheader">
              {calendarDateLabel(
                `2026-11-${String(cell.weekday + 1).padStart(2, '0')}`,
                picker.locale,
                { weekday: 'short' },
              )}
            </span>
          ))}
        </div>
        {Array.from({ length: 6 }, (_, row) => (
          <div role="row" key={row} data-slot="week">
            {cells.slice(row * 7, row * 7 + 7).map((cell, index) => {
              const date = cell.date;
              const disabled =
                date === null || !isCalendarDateAllowed(date, picker.constraints, from);
              const isSelected = date !== null && selected.includes(date);
              const inRange =
                date !== null &&
                selected.length === 2 &&
                date >= selected[0] &&
                date <= selected[1];
              const inPreview =
                date !== null && preview !== null && date >= preview[0] && date <= preview[1];
              return (
                <div
                  role="gridcell"
                  key={index}
                  aria-selected={isSelected}
                  aria-disabled={disabled || undefined}
                  data-selected={isSelected || undefined}
                  data-range={inRange || undefined}
                  data-preview={inPreview || undefined}
                  data-outside={!cell.inMonth || undefined}
                  data-today={date === today || undefined}
                >
                  {date !== null &&
                    renderAction({
                      action: 'day',
                      type: 'button',
                      className: slotClassNames.day,
                      'data-date': date,
                      'aria-label': calendarDateLabel(date, picker.locale, {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      }),
                      'aria-current': date === today ? 'date' : undefined,
                      tabIndex: date === active && !disabled ? 0 : -1,
                      disabled,
                      'aria-disabled': picker.readOnly || undefined,
                      onClick: () => choose(date),
                      onMouseEnter: () => picker.hover(date),
                      onMouseLeave: () => picker.hover(null),
                      children: String(Number(date.slice(8))),
                    })}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
