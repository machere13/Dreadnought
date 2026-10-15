import { useLayoutEffect, useMemo, useRef, useState } from 'react';
import {
  formatClockTime,
  getDraftTransition,
  getTimeOptions,
  getTimeSelection,
} from '@dreadnought/core';
import type {
  ClockTime,
  ClockTimeParts,
  DraftAction,
  TimeOptions,
  TimePart,
  TimeSelection,
} from '@dreadnought/core';
import type { UseTimePickerOptions, UseTimePickerResult } from './timePicker.types.ts';
import {
  parseTimePickerDraft,
  timePickerDraftError,
  timePickerSelection,
  timePickerText,
} from './timePickerState.ts';

export function useTimePicker(options: UseTimePickerOptions = {}): UseTimePickerResult {
  const showSeconds = options.showSeconds ?? false;
  const settings: TimeOptions = useMemo(
    () => ({
      minTime: options.minTime,
      maxTime: options.maxTime,
      disabledTime: options.disabledTime,
      showSeconds,
      hourStep: options.hourStep,
      minuteStep: options.minuteStep,
      secondStep: options.secondStep,
    }),
    [
      options.minTime,
      options.maxTime,
      options.disabledTime,
      options.disabledTime?.hours,
      options.disabledTime?.minutes,
      options.disabledTime?.seconds,
      showSeconds,
      options.hourStep,
      options.minuteStep,
      options.secondStep,
    ],
  );
  const initial = options.value !== undefined ? options.value : (options.defaultValue ?? null);
  timePickerText(initial, showSeconds);
  const [view, setView] = useState(() => ({
    value: initial,
    draft: timePickerText(initial, showSeconds),
    selection: timePickerSelection(initial),
    open: (options.defaultOpen ?? false) && !options.disabled,
  }));
  const current = useRef(view);
  const mounted = useRef(true);
  const previous = useRef({ value: options.value, showSeconds, disabled: options.disabled });
  const value = options.value !== undefined ? options.value : view.value;
  timePickerText(value, showSeconds);
  const reconcile =
    previous.current.value !== options.value || previous.current.showSeconds !== showSeconds;
  const selection = useMemo(
    () => (reconcile ? timePickerSelection(value) : view.selection),
    [reconcile, value, view.selection],
  );
  const draft = reconcile ? timePickerText(value, showSeconds) : view.draft;
  const open = (options.open ?? view.open) && !options.disabled;
  const blocked = Boolean(options.disabled || options.readOnly);
  const columns = useMemo(
    () => ({
      hour: getTimeOptions('hour', selection, settings),
      minute: getTimeOptions('minute', selection, settings),
      second: getTimeOptions('second', selection, settings),
    }),
    [selection, settings],
  );
  const draftError = timePickerDraftError(draft, showSeconds, settings);

  function update(patch: Partial<typeof view>) {
    if (!mounted.current) return;
    current.current = { ...current.current, ...patch };
    setView(current.current);
  }
  function updateDraft(action: DraftAction<ClockTime | null, string>, value = acceptedValue()) {
    const next = getDraftTransition(value, action, {
      format: (value) => timePickerText(value, showSeconds),
      controlled: options.value !== undefined,
    });
    update({
      value: next.value,
      draft: next.draft,
      selection: timePickerSelection(parseTimePickerDraft(next.draft, showSeconds)),
    });
    return next.changed;
  }
  function restore(next = acceptedValue()) {
    updateDraft({ type: 'cancel' }, next);
  }
  function setOpen(next: boolean) {
    if (!mounted.current || (options.disabled && next)) return;
    const accepted = options.open ?? current.current.open;
    if (next === accepted) return;
    update({ open: next });
    options.onOpenChange?.(next);
  }
  function acceptedValue() {
    return options.value !== undefined ? options.value : current.current.value;
  }
  function publish(next: ClockTime | null) {
    if (!mounted.current || blocked) return;
    if (updateDraft({ type: 'confirm', value: next })) options.onChange?.(next);
  }
  function setDraft(text: string) {
    if (!mounted.current || blocked) return;
    updateDraft({ type: 'edit', draft: text });
  }
  function choose(part: TimePart, next: number) {
    if (!mounted.current || blocked) return;
    const selection = getTimeSelection(current.current.selection, part, next, settings);
    const changed = (['hour', 'minute', 'second'] as const).some(
      (unit) => selection[unit] !== current.current.selection[unit],
    );
    if (!changed) return;
    const complete = (['hour', 'minute', 'second'] as const).every(
      (unit) => selection[unit] !== null,
    );
    if (!complete) return;
    const draft = timePickerText(formatClockTime(selection as ClockTimeParts), showSeconds);
    update({ selection, draft });
  }
  function confirm() {
    if (!mounted.current || blocked) return;
    const text = current.current.draft;
    const error = timePickerDraftError(text, showSeconds, settings);
    if (error) return;
    publish(parseTimePickerDraft(text, showSeconds));
  }
  function clear() {
    if (options.allowClear === false) return;
    publish(null);
  }
  function cancel() {
    if (!mounted.current) return;
    restore(acceptedValue());
    setOpen(false);
  }
  function reset() {
    if (!mounted.current) return;
    restore(options.value !== undefined ? options.value : (options.defaultValue ?? null));
    setOpen(false);
  }
  useLayoutEffect(() => {
    if (previous.current.value !== options.value || previous.current.showSeconds !== showSeconds) {
      restore(value);
    }
    if (!previous.current.disabled && options.disabled) setOpen(false);
    previous.current = { value: options.value, showSeconds, disabled: options.disabled };
  }, [options.value, showSeconds, options.disabled]);
  useLayoutEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);
  return {
    value,
    draft,
    selection,
    error: draftError,
    open,
    disabled: Boolean(options.disabled),
    readOnly: Boolean(options.readOnly),
    invalid: Boolean(options.invalid || draftError),
    showSeconds,
    columns,
    setOpen,
    setDraft,
    choose,
    confirm,
    clear,
    cancel,
    reset,
  };
}
