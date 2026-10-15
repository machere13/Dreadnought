import { useContext, useEffect, useId, useImperativeHandle, useLayoutEffect, useRef } from 'react';
import type { FocusEvent, KeyboardEvent } from 'react';
import { OverlayVisibilityContext } from '../../shared/OverlayVisibilityContext.ts';
import { useAnchoredPopover } from '../../shared/useAnchoredPopover.ts';
import { usePickerForm } from '../../shared/usePickerForm.ts';
import { TimePanel, nativeTimePickerAction } from './TimePanel.tsx';
import { useTimePicker } from './useTimePicker.ts';
import { timePickerText } from './timePickerState.ts';
import type { TimePickerAdapterProps } from './timePicker.types.ts';

const messages = {
  incomplete: 'Complete the time',
  format: 'Enter a valid time',
  disabled: 'This time is unavailable',
};

export function TimePickerAdapter({
  value,
  defaultValue,
  onChange,
  showSeconds,
  hourStep,
  minuteStep,
  secondStep,
  minTime,
  maxTime,
  disabledTime,
  open,
  defaultOpen,
  onOpenChange,
  disabled,
  readOnly,
  required,
  invalid,
  allowClear = true,
  placement = 'bottomLeft',
  slotClassNames = {},
  renderField = (field) => <input {...field} />,
  renderAction = nativeTimePickerAction,
  className,
  style,
  ref,
  id,
  name,
  onKeyDown,
  onBlur,
  ...native
}: TimePickerAdapterProps) {
  const visible = useContext(OverlayVisibilityContext);
  const picker = useTimePicker({
    value,
    defaultValue,
    onChange,
    showSeconds,
    hourStep,
    minuteStep,
    secondStep,
    minTime,
    maxTime,
    disabledTime,
    open,
    defaultOpen,
    onOpenChange,
    disabled: disabled || !visible,
    readOnly,
    required,
    invalid,
    allowClear,
  });
  const generated = useId();
  const fieldId = id ?? generated;
  const popupId = `${fieldId}-time`;
  const errorId = `${fieldId}-error`;
  const root = useRef<HTMLDivElement>(null);
  const field = useRef<HTMLInputElement>(null);
  const popup = useRef<HTMLDivElement>(null);
  const initiator = useRef<HTMLElement | null>(null);
  const focusRequested = useRef(false);
  const revision = useRef(0);
  const current = useRef(picker);
  current.current = picker;
  useImperativeHandle(ref, () => field.current!);
  useAnchoredPopover(picker.open && visible, root, popup, root.current, false, {
    placement,
    autoAdjustOverflow: true,
    pointAtCenter: false,
    arrow: false,
  });
  usePickerForm(field, root, {
    form: native.form,
    isDirty: () => picker.draft !== timePickerText(picker.value, picker.showSeconds),
    confirm: picker.confirm,
    reset: () => {
      revision.current++;
      picker.reset();
    },
  });
  useLayoutEffect(() => {
    revision.current++;
  }, [picker.value, picker.open, picker.disabled, native.form]);

  function cancel() {
    revision.current++;
    picker.cancel();
    (initiator.current ?? field.current)?.focus({ preventScroll: true });
  }
  function confirm() {
    if (picker.error || picker.readOnly) return;
    picker.confirm();
    picker.setOpen(false);
    (initiator.current ?? field.current)?.focus({ preventScroll: true });
  }
  function toggle(target: HTMLElement) {
    initiator.current = target;
    focusRequested.current = true;
    picker.setOpen(!picker.open);
  }
  function keyDown(event: KeyboardEvent<HTMLInputElement>) {
    onKeyDown?.(event);
    if (event.defaultPrevented || event.nativeEvent.isComposing || picker.disabled) return;
    if (
      event.key === 'Escape' &&
      (picker.open || picker.draft !== timePickerText(picker.value, picker.showSeconds))
    ) {
      event.preventDefault();
      event.stopPropagation();
      cancel();
    } else if (event.altKey && event.key === 'ArrowDown') {
      event.preventDefault();
      toggle(event.currentTarget);
    } else if (event.key === 'Enter' && !event.altKey && !event.ctrlKey && !event.metaKey) {
      event.preventDefault();
      confirm();
    }
  }
  function blur(event: FocusEvent<HTMLDivElement>) {
    if (event.defaultPrevented || root.current?.contains(event.relatedTarget as Node | null))
      return;
    const version = revision.current;
    queueMicrotask(() => {
      const node = root.current;
      if (!node || version !== revision.current || node.contains(node.ownerDocument.activeElement))
        return;
      current.current.confirm();
      current.current.setOpen(false);
    });
  }
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
      data-ui="time-picker"
      data-disabled={picker.disabled || undefined}
      data-invalid={picker.invalid || undefined}
      className={[className, slotClassNames.root].filter(Boolean).join(' ')}
      style={style}
      onBlur={blur}
    >
      <div data-slot="field" className={slotClassNames.field}>
        {renderField({
          ...native,
          id: fieldId,
          type: 'text',
          autoComplete: native.autoComplete ?? 'off',
          value: picker.draft,
          disabled: picker.disabled,
          readOnly: picker.readOnly,
          required,
          'aria-invalid': picker.invalid ? true : native['aria-invalid'],
          'aria-describedby':
            [native['aria-describedby'], picker.error && errorId].filter(Boolean).join(' ') ||
            undefined,
          ref: (node) => {
            field.current = node;
            node?.setCustomValidity(picker.error ? messages[picker.error] : '');
          },
          onChange: (event) => picker.setDraft(event.target.value),
          onKeyDown: keyDown,
          onBlur,
          onInvalid: (event) => {
            native.onInvalid?.(event);
            if (!event.defaultPrevented) picker.confirm();
          },
        })}
        <div data-slot="actions" className={slotClassNames.actions}>
          {allowClear &&
            !picker.readOnly &&
            Boolean(picker.value || picker.draft) &&
            renderAction({
              action: 'clear',
              type: 'button',
              'aria-label': 'Clear time',
              disabled: picker.disabled,
              onClick: () => {
                revision.current++;
                picker.clear();
                field.current?.focus({ preventScroll: true });
              },
              children: 'Clear',
            })}
          {renderAction({
            action: 'clock',
            type: 'button',
            'aria-label': 'Open time picker',
            'aria-expanded': picker.open,
            'aria-controls': picker.open ? popupId : undefined,
            'aria-haspopup': 'dialog',
            disabled: picker.disabled,
            onClick: (event) => toggle(event.currentTarget),
            children: 'Time',
          })}
        </div>
      </div>
      {picker.error && (
        <span id={errorId} role="alert" className={slotClassNames.error}>
          {messages[picker.error]}
        </span>
      )}
      {name !== undefined && (
        <input
          type="hidden"
          name={name}
          form={native.form}
          disabled={picker.disabled}
          value={picker.value ?? ''}
        />
      )}
      {picker.open && visible && (
        <div
          ref={popup}
          id={popupId}
          role="dialog"
          aria-modal="false"
          aria-label={`${native['aria-label'] ?? 'Time'} picker`}
          popover="manual"
          data-slot="popup"
          className={slotClassNames.popup}
          style={{ position: 'fixed', inset: 'auto', margin: 0 }}
          onKeyDown={(event) => {
            if (event.defaultPrevented || event.nativeEvent.isComposing || event.key !== 'Escape')
              return;
            event.preventDefault();
            event.stopPropagation();
            cancel();
          }}
        >
          <TimePanel
            picker={picker}
            slotClassNames={slotClassNames}
            renderAction={renderAction}
            focusRequested={focusRequested}
            confirm={confirm}
          />
        </div>
      )}
    </div>
  );
}
