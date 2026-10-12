import { useContext, useEffect, useId, useImperativeHandle, useRef } from 'react';
import type { FocusEvent, KeyboardEvent } from 'react';
import { OverlayVisibilityContext } from '../../shared/OverlayVisibilityContext.ts';
import { useAnchoredPopover } from '../../shared/useAnchoredPopover.ts';
import { usePickerForm } from '../../shared/usePickerForm.ts';
import { CalendarPanel, nativeDatePickerAction } from './CalendarPanel.tsx';
import { useDatePicker } from './useDatePicker.ts';
import { datePickerDraftErrors, datePickerText } from './datePickerState.ts';
import type { DatePickerAdapterProps, DatePickerFieldProps } from './datePicker.types.ts';
import type { CalendarDate } from '@dreadnought/core';

const inputErrors = {
  format: 'Enter a valid date in YYYY-MM-DD format',
  disabled: 'This date is not available',
  incomplete: 'Enter both dates in YYYY-MM-DD format',
};

export function DatePickerAdapter({
  mode,
  value,
  defaultValue,
  onChange,
  placeholder,
  minDate,
  maxDate,
  disabledDate,
  open,
  defaultOpen,
  onOpenChange,
  disabled,
  readOnly,
  required,
  invalid,
  allowClear = true,
  locale,
  weekStartsOn,
  placement = 'bottomLeft',
  slotClassNames = {},
  className,
  style,
  ref,
  renderField = (props) => <input {...props} />,
  renderAction = nativeDatePickerAction,
  renderMonthSelect,
  onKeyDown,
  onBlur,
  id,
  name,
  ...native
}: DatePickerAdapterProps) {
  const visible = useContext(OverlayVisibilityContext);
  const selection =
    mode === 'range'
      ? { mode, value, defaultValue, onChange, placeholder }
      : { mode: 'single' as const, value, defaultValue, onChange, placeholder };
  const picker = useDatePicker({
    ...selection,
    minDate,
    maxDate,
    disabledDate,
    open,
    defaultOpen,
    onOpenChange,
    disabled: disabled || !visible,
    readOnly,
    required,
    invalid,
    allowClear,
    locale,
    weekStartsOn,
  } as DatePickerAdapterProps);
  const generatedId = useId();
  const fieldId = id ?? generatedId;
  const popupId = `${fieldId}-calendar`;
  const root = useRef<HTMLDivElement>(null);
  const input = useRef<HTMLInputElement>(null);
  const popup = useRef<HTMLDivElement>(null);
  const initiator = useRef<HTMLElement | null>(null);
  const focusRequested = useRef(false);
  const current = useRef(picker);
  current.current = picker;
  useImperativeHandle(ref, () => input.current!);
  useAnchoredPopover(picker.open && visible, root, popup, root.current, false, {
    placement,
    autoAdjustOverflow: true,
    pointAtCenter: false,
    arrow: false,
  });
  const text = datePickerText(picker.value);
  const draftErrors = datePickerDraftErrors(
    picker.draft,
    picker.mode === 'range',
    picker.constraints,
  );
  const baseLabel = native['aria-label'] ?? 'Date';

  function openCalendar(target: HTMLElement) {
    initiator.current = target;
    focusRequested.current = true;
    picker.setOpen(!picker.open);
  }
  function cancel() {
    picker.cancel();
    initiator.current?.focus({ preventScroll: true });
  }
  function choose(date: CalendarDate) {
    if (picker.readOnly) return;
    focusRequested.current = true;
    picker.choose(date);
    if (picker.mode === 'single' || picker.range.start !== null) {
      initiator.current?.focus({ preventScroll: true });
    }
  }
  function keyDown(event: KeyboardEvent<HTMLInputElement>) {
    onKeyDown?.(event);
    if (event.defaultPrevented || event.nativeEvent.isComposing || picker.disabled) return;
    if (event.key === 'Escape') {
      event.preventDefault();
      cancel();
      return;
    }
    if (event.key === 'ArrowDown' && event.altKey) {
      event.preventDefault();
      openCalendar(event.currentTarget);
      return;
    }
    if (event.key === 'Enter' && !event.altKey && !event.ctrlKey && !event.metaKey) {
      event.preventDefault();
      picker.confirm();
    }
  }
  function blur(event: FocusEvent<HTMLDivElement>) {
    if (event.defaultPrevented || root.current?.contains(event.relatedTarget as Node | null))
      return;
    queueMicrotask(() => {
      const node = root.current;
      if (!node || node.contains(node.ownerDocument.activeElement)) return;
      current.current.confirm();
      current.current.setOpen(false);
    });
  }
  usePickerForm(input, root, {
    form: native.form,
    isDirty: () => picker.draft.some((draft, index) => draft !== text[index]),
    confirm: picker.confirm,
    reset: picker.reset,
  });
  useEffect(() => {
    if (!picker.open) return;
    const doc = root.current?.ownerDocument;
    const outside = (event: PointerEvent) => {
      if (root.current?.contains(event.target as Node)) return;
      current.current.confirm();
      current.current.setOpen(false);
    };
    doc?.addEventListener('pointerdown', outside);
    return () => doc?.removeEventListener('pointerdown', outside);
  }, [picker.open]);

  return (
    <div
      ref={root}
      data-ui="date-picker"
      data-disabled={picker.disabled || undefined}
      data-invalid={picker.invalid || undefined}
      className={[className, slotClassNames.root].filter(Boolean).join(' ')}
      style={style}
      onBlur={blur}
    >
      <div className={slotClassNames.fields} data-slot="fields">
        {(picker.mode === 'range' ? ([0, 1] as const) : ([0] as const)).map((index) => {
          const error = picker.errors[index];
          const errorId = `${fieldId}-${index}-error`;
          const endpointId = `${fieldId}-${index}-label`;
          const props: DatePickerFieldProps = {
            ...native,
            id: index === 0 ? fieldId : `${fieldId}-end`,
            ref: (node) => {
              if (index === 0) input.current = node;
              node?.setCustomValidity(draftErrors[index] ? inputErrors[draftErrors[index]] : '');
            },
            type: 'text',
            autoComplete: native.autoComplete ?? 'off',
            value: picker.draft[index],
            disabled: picker.disabled,
            readOnly: picker.readOnly,
            required,
            placeholder:
              mode === 'range' ? placeholder?.[index] : (placeholder as string | undefined),
            'aria-label':
              picker.mode === 'range'
                ? `${baseLabel} ${index === 0 ? 'start' : 'end'}`
                : native['aria-label'],
            'aria-labelledby':
              picker.mode === 'range' && native['aria-labelledby']
                ? `${native['aria-labelledby']} ${endpointId}`
                : native['aria-labelledby'],
            'aria-invalid': error || picker.invalid ? true : native['aria-invalid'],
            'aria-describedby':
              [native['aria-describedby'], error ? errorId : null].filter(Boolean).join(' ') ||
              undefined,
            className: slotClassNames.field,
            onKeyDown: keyDown,
            onBlur,
            onInvalid: (event) => {
              native.onInvalid?.(event);
              if (!event.defaultPrevented) picker.confirm();
            },
            onChange: (event) => picker.setDraft(index, event.target.value),
          };
          return (
            <div key={index} data-slot="field">
              {picker.mode === 'range' && native['aria-labelledby'] && (
                <span id={endpointId} hidden>
                  {index === 0 ? 'start' : 'end'}
                </span>
              )}
              {renderField(props)}
              {error && (
                <span id={errorId} className={slotClassNames.error} role="alert">
                  {inputErrors[error]}
                </span>
              )}
            </div>
          );
        })}
        <div className={slotClassNames.actions} data-slot="actions">
          {renderAction({
            action: 'calendar',
            type: 'button',
            'aria-label': 'Open calendar',
            'aria-expanded': picker.open,
            'aria-controls': picker.open ? popupId : undefined,
            'aria-haspopup': 'dialog',
            disabled: picker.disabled,
            onClick: (event) => openCalendar(event.currentTarget),
            children: 'Calendar',
          })}
          {allowClear &&
            text.some(Boolean) &&
            !picker.readOnly &&
            renderAction({
              action: 'clear',
              type: 'button',
              'aria-label': 'Clear date',
              disabled: picker.disabled,
              onClick: () => {
                picker.clear();
                input.current?.focus({ preventScroll: true });
              },
              children: 'Clear',
            })}
        </div>
      </div>
      {name &&
        text.map(
          (date, index) =>
            date && (
              <input
                key={index}
                type="hidden"
                form={native.form}
                disabled={picker.disabled}
                name={picker.mode === 'range' ? `${name}.${index === 0 ? 'start' : 'end'}` : name}
                value={date}
              />
            ),
        )}
      {picker.open && visible && (
        <div
          ref={popup}
          id={popupId}
          role="dialog"
          aria-modal="false"
          aria-label={`${baseLabel} calendar`}
          popover="manual"
          className={slotClassNames.popup}
          data-slot="popup"
          style={{ position: 'fixed', inset: 'auto', margin: 0 }}
        >
          <CalendarPanel
            picker={picker}
            slotClassNames={slotClassNames}
            focusRequested={focusRequested}
            choose={choose}
            cancel={cancel}
            renderField={renderField}
            renderAction={renderAction}
            renderMonthSelect={renderMonthSelect}
          />
        </div>
      )}
    </div>
  );
}
