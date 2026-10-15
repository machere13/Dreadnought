import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import {
  assertCalendarDate,
  getCalendarGrid,
  getCalendarRange,
  getDraftTransition,
  searchCalendarDate,
  isCalendarDateAllowed,
  parseCalendarDate,
} from '@dreadnought/core';
import type { CalendarDate, CalendarNavigation, DraftAction } from '@dreadnought/core';
import type {
  DatePickerValue,
  UseDatePickerOptions,
  UseDatePickerResult,
  DatePickerEndpoint,
} from './datePicker.types.ts';
import {
  clampDatePickerMonth,
  datePickerModel,
  datePickerDraftErrors,
  datePickerText,
  firstDatePickerDay,
  localCalendarToday,
  validateDatePickerValue,
} from './datePickerState.ts';
import type { DatePickerModel } from './datePickerState.ts';

export function useDatePicker(options: UseDatePickerOptions = {}): UseDatePickerResult {
  const mode = options.mode ?? 'single';
  const limits = {
    minDate: options.minDate,
    maxDate: options.maxDate,
    disabledDate: options.disabledDate,
  };
  const weekStartsOn = options.weekStartsOn ?? 1;
  const locale = options.locale ?? 'en-US';
  const initial = options.value !== undefined ? options.value : (options.defaultValue ?? null);
  validateDatePickerValue(initial, mode === 'range');
  isCalendarDateAllowed('2000-01-01', { minDate: limits.minDate, maxDate: limits.maxDate });
  getCalendarGrid('2000-01-01', weekStartsOn);
  new Intl.DateTimeFormat(locale);
  const [view, setView] = useState(() =>
    datePickerModel(
      initial,
      clampDatePickerMonth(datePickerText(initial)[0] || '2000-01-01', limits),
      options.defaultOpen ?? false,
    ),
  );
  const current = useRef(view);
  const mounted = useRef(true);
  const navigation = useRef<{
    iterator: Generator<void, CalendarDate>;
    timer?: ReturnType<typeof setTimeout>;
  } | null>(null);
  const previous = useRef({
    mode,
    value: JSON.stringify(options.value),
    disabled: options.disabled,
    open: options.open,
  });
  const value = options.value !== undefined ? options.value : view.value;
  const blocked = Boolean(options.disabled || options.readOnly);
  const from = view.range.start !== null && view.range.end === null ? view.range.start : undefined;

  function stopNavigation() {
    if (navigation.current?.timer !== undefined) clearTimeout(navigation.current.timer);
    navigation.current = null;
  }
  function update(patch: Partial<DatePickerModel>) {
    if (!mounted.current) return;
    stopNavigation();
    current.current = { ...current.current, ...patch };
    setView(current.current);
  }
  function published(): DatePickerValue {
    return options.value !== undefined ? options.value : current.current.value;
  }
  function updateDraft(action: DraftAction<DatePickerValue, [string, string]>) {
    const next = getDraftTransition(published(), action, {
      format: datePickerText,
      controlled: options.value !== undefined,
      isEqual: (left, right) => JSON.stringify(left) === JSON.stringify(right),
    });
    update({
      ...(action.type === 'confirm' && options.value === undefined ? { value: next.value } : {}),
      draft: next.draft,
      errors: [null, null],
      range: { start: null, end: null },
      ...(action.type !== 'edit' ? { hoveredDate: null } : {}),
    });
    return next.changed;
  }
  function restore() {
    updateDraft({ type: 'cancel' });
  }
  function setOpen(next: boolean) {
    if (!mounted.current) return;
    next = next && !options.disabled;
    const oldOpen = options.open ?? current.current.open;
    if (next) {
      const selected = datePickerText(published())[0];
      const today = localCalendarToday();
      const month = clampDatePickerMonth(selected || today, limits);
      update({
        month,
        activeDate: firstDatePickerDay(month, selected || today, limits, weekStartsOn),
        range: { start: null, end: null },
        hoveredDate: null,
      });
    } else {
      update({ range: { start: null, end: null }, hoveredDate: null });
    }
    if (options.open === undefined) update({ open: next });
    if (next !== oldOpen) options.onOpenChange?.(next);
  }
  function publish(next: DatePickerValue) {
    if (!mounted.current || blocked) return;
    if (!updateDraft({ type: 'confirm', value: next })) return;
    if (options.mode === 'range') {
      options.onChange?.(next as readonly [CalendarDate, CalendarDate] | null);
    } else {
      options.onChange?.(next as CalendarDate | null);
    }
  }
  function choose(date: CalendarDate) {
    if (!mounted.current || blocked) return;
    assertCalendarDate(date);
    if (mode === 'single') {
      if (!isCalendarDateAllowed(date, limits)) return;
      publish(date);
      setOpen(false);
      return;
    }
    const range = getCalendarRange(current.current.range, date, limits);
    if (range === current.current.range) return;
    update({ range, activeDate: date });
    if (range.start !== null && range.end !== null) {
      publish([range.start, range.end]);
      setOpen(false);
    }
  }
  function setDraft(index: DatePickerEndpoint, text: string) {
    if (!mounted.current || blocked || (mode === 'single' && index !== 0)) return;
    const draft: [string, string] = [...current.current.draft];
    draft[index] = text;
    updateDraft({ type: 'edit', draft });
  }
  function confirm() {
    if (!mounted.current || blocked) return;
    const draft = current.current.draft;
    if (draft[0] === '' && (mode === 'single' || draft[1] === '')) {
      publish(null);
      return;
    }
    const errors = datePickerDraftErrors(draft, mode === 'range', limits);
    if (errors.some(Boolean)) {
      update({ errors });
      return;
    }
    if (mode === 'single') {
      publish(draft[0]);
      return;
    }
    const range = getCalendarRange({ start: draft[0], end: null }, draft[1], limits);
    if (range.end === null) {
      update({ errors: [null, 'disabled'] });
      return;
    }
    publish([range.start!, range.end]);
  }
  function clear() {
    if (blocked || options.allowClear === false) return;
    publish(null);
  }
  function cancel() {
    restore();
    setOpen(false);
  }
  function reset() {
    if (!mounted.current) return;
    const next = options.value !== undefined ? options.value : (options.defaultValue ?? null);
    update(
      datePickerModel(next, clampDatePickerMonth(datePickerText(next)[0] || '2000-01-01', limits)),
    );
  }
  function setMonth(date: CalendarDate) {
    if (!mounted.current || options.disabled) return;
    const month = clampDatePickerMonth(date, limits);
    const preferred = current.current.activeDate ?? month;
    const candidate = `${month.slice(0, 7)}-${preferred.slice(8)}`;
    update({
      month,
      activeDate: firstDatePickerDay(
        month,
        parseCalendarDate(candidate) ? candidate : month,
        limits,
        weekStartsOn,
        from,
      ),
    });
  }
  function move(action: CalendarNavigation) {
    stopNavigation();
    if (options.disabled || current.current.activeDate === null) return;
    const pending = {
      iterator: searchCalendarDate(
        current.current.activeDate,
        action,
        limits,
        weekStartsOn,
        current.current.range.start ?? undefined,
      ),
      timer: undefined as ReturnType<typeof setTimeout> | undefined,
    };
    navigation.current = pending;
    function resume() {
      if (!mounted.current || navigation.current !== pending) return;
      for (let index = 0; index < 512; index++) {
        const step = pending.iterator.next();
        if (step.done) {
          update({ activeDate: step.value, month: `${step.value.slice(0, 7)}-01` });
          return;
        }
      }
      pending.timer = setTimeout(resume, 0);
    }
    resume();
  }
  function hover(date: CalendarDate | null) {
    if (blocked) return;
    if (date !== null) assertCalendarDate(date);
    update({ hoveredDate: date });
  }
  useLayoutEffect(stopNavigation, [
    mode,
    options.disabled,
    options.open,
    JSON.stringify(options.value),
    limits.minDate,
    limits.maxDate,
    limits.disabledDate,
    weekStartsOn,
  ]);
  useLayoutEffect(() => {
    const key = JSON.stringify(options.value);
    if (previous.current.mode !== mode || previous.current.value !== key) {
      const next =
        options.value !== undefined
          ? options.value
          : previous.current.mode !== mode
            ? (options.defaultValue ?? null)
            : current.current.value;
      update(
        datePickerModel(
          next,
          clampDatePickerMonth(datePickerText(next)[0] || '2000-01-01', limits),
          options.open ?? current.current.open,
        ),
      );
    }
    if (options.open && !previous.current.open) setOpen(true);
    if (options.disabled && !previous.current.disabled) {
      const wasOpen = options.open ?? current.current.open;
      restore();
      update({ open: false });
      if (wasOpen) options.onOpenChange?.(false);
    }
    if (!options.disabled && (options.open ?? current.current.open)) {
      const state = current.current;
      const month = clampDatePickerMonth(state.month, limits);
      const rangeStart = state.range.end === null ? (state.range.start ?? undefined) : undefined;
      const activeDate = firstDatePickerDay(
        month,
        state.activeDate ?? month,
        limits,
        weekStartsOn,
        rangeStart,
      );
      if (month !== state.month || activeDate !== state.activeDate) update({ month, activeDate });
    }
    previous.current = { mode, value: key, disabled: options.disabled, open: options.open };
  });
  useEffect(() => {
    mounted.current = true;
    if (options.open ?? options.defaultOpen) setOpen(true);
    return () => {
      mounted.current = false;
      stopNavigation();
    };
  }, []);
  const dates = datePickerText(value).filter(Boolean);
  const invalid = Boolean(
    options.invalid ||
    view.errors.some(Boolean) ||
    dates.some((date) => !isCalendarDateAllowed(date, limits)),
  );
  return {
    ...view,
    mode,
    value,
    open: !options.disabled && (options.open ?? view.open),
    invalid,
    disabled: Boolean(options.disabled),
    readOnly: Boolean(options.readOnly),
    locale,
    weekStartsOn,
    constraints: limits,
    setOpen,
    setDraft,
    confirm,
    choose,
    clear,
    cancel,
    reset,
    setMonth,
    move,
    hover,
  } as UseDatePickerResult;
}
