import { useEffect, useId, useRef, useState } from 'react';
import { getNavigationDirection, getNextEnabledValue, getSelectState, getSelectionValue } from '@dreadnought/core';
import type { SelectValue, SelectionAction } from '@dreadnought/core';
import type { KeyboardEvent } from 'react';
import type { SelectAdapterProps } from './SelectAdapter.types.ts';
import { useFieldValue } from '../../shared/useFieldValue.ts';
import { useAnchoredPopover } from '../../shared/useAnchoredPopover.ts';

const empty: string[] = [];
export function useSelect(props: SelectAdapterProps) {
  const id = useId();
  const control = useRef<HTMLInputElement>(null);
  const native = useRef<HTMLSelectElement>(null);
  const root = useRef<HTMLDivElement>(null);
  const popup = useRef<HTMLDivElement>(null);
  const [expanded, setExpanded] = useState(false);
  const [query, setQuery] = useState('');
  const [active, setActive] = useState('');
  const [validationInvalid, setValidationInvalid] = useState(false);
  const [value, setValue] = useFieldValue<SelectValue>(props.value, props.defaultValue ?? (props.multiple ? empty : null), next => {
    if (props.multiple) props.onValueChange?.(next as string[]);
    else props.onValueChange?.(next as string | null);
  }, native);
  const open = expanded && !props.disabled;
  const state = getSelectState({ ...props, value, query: open ? query : '', invalid: props.invalid || validationInvalid });
  const activeValue = state.filteredOptions.find(option => option.value === active && !option.disabled)?.value
    ?? state.filteredOptions.find(option => state.values.includes(option.value) && !option.disabled)?.value
    ?? state.filteredOptions.find(option => !option.disabled)?.value;
  const optionId = (v: string) => `${id}-option-${encodeURIComponent(v)}`;

  function close() { setExpanded(false); setQuery(''); }
  function changeSelection(action: SelectionAction<string>) {
    setValue(getSelectionValue(props.multiple ? state.values : state.values[0] ?? null, action, {
      disabled: props.disabled || control.current?.matches(':disabled'), required: props.required,
      disabledValues: props.options.filter(option => option.disabled).map(option => option.value),
    }));
  }
  function choose(v: string) {
    const option = props.options.find(option => option.value === v);
    if (props.disabled || !option || option.disabled || control.current?.matches(':disabled')) return;
    changeSelection({ type: props.multiple ? 'toggle' : 'select', value: v });
    setQuery('');
    setValidationInvalid(false);
    if (!props.multiple) close();
    control.current?.focus();
  }
  function clear() { changeSelection({ type: 'clear' }); setQuery(''); setValidationInvalid(false); close(); control.current?.focus(); }
  function onKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    props.onKeyDown?.(event);
    props.slotProps?.control?.onKeyDown?.(event);
    if (event.defaultPrevented || event.nativeEvent.isComposing || props.disabled) return;
    if (event.key === 'Escape') { if (open) { event.preventDefault(); close(); } return; }
    if (event.key === 'Tab') { close(); return; }
    if (event.key === 'Enter' || (!props.searchable && event.key === ' ')) {
      event.preventDefault();
      if (!open) setExpanded(true); else if (activeValue) choose(activeValue);
      return;
    }
    const direction = getNavigationDirection(event.key, { homeEnd: !props.searchable });
    if (!direction) return;
    event.preventDefault();
    if (!open) {
      setExpanded(true);
      setActive(getNextEnabledValue(state.filteredOptions, '', direction === 'previous' ? 'last' : 'first') ?? '');
    } else setActive(getNextEnabledValue(state.filteredOptions, activeValue ?? '', direction, { loop: false }) ?? '');
  }
  useAnchoredPopover(open, root, popup);
  useEffect(() => {
    if (props.disabled) close();
  }, [props.disabled]);
  useEffect(() => {
    if (open && activeValue) popup.current?.ownerDocument.getElementById(optionId(activeValue))?.scrollIntoView?.({ block: 'nearest' });
  }, [open, activeValue, id]);
  useEffect(() => {
    const form = native.current?.form;
    function reset() { close(); setValidationInvalid(false); }
    form?.addEventListener('reset', reset);
    return () => form?.removeEventListener('reset', reset);
  }, []);
  return { id, control, native, root, popup, state, open, query, activeValue, optionId, choose, clear, close, setValue, setExpanded, setQuery, setActive, setValidationInvalid, onKeyDown };
}
