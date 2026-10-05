// Throwaway feasibility probe, not a public component or adapter.
import { useId, useRef, useState } from 'react';
import type { KeyboardEventHandler } from 'react';
import { getComboboxKeyAction, getDisclosureOpen, getNextEnabledValue, getSelectState, getSelectionValue } from '@dreadnought/core';
import type { SelectOption } from '@dreadnought/core';

export function ComboboxProbe({ options, defaultValue = null, disabled = false, onKeyDown }: {
  options: readonly SelectOption[];
  defaultValue?: string | null;
  disabled?: boolean;
  onKeyDown?: KeyboardEventHandler<HTMLInputElement>;
}) {
  const id = useId();
  const control = useRef<HTMLInputElement>(null);
  const [expanded, setExpanded] = useState(false);
  const [value, setValue] = useState(defaultValue);
  const [query, setQuery] = useState('');
  const [active, setActive] = useState('');
  const open = expanded && !disabled;
  const state = getSelectState({ options, value, query, disabled });
  const activeValue = state.filteredOptions.find(option => option.value === active && !option.disabled)?.value
    ?? getNextEnabledValue(state.filteredOptions, '', 'first');
  const optionId = (v: string) => `${id}-option-${encodeURIComponent(v)}`;

  function close() { setExpanded(getDisclosureOpen(expanded, 'close')); setQuery(''); setActive(''); }
  function choose(v: string) {
    const option = state.filteredOptions.find(option => option.value === v);
    if (disabled || !option || option.disabled) return;
    setValue(getSelectionValue(value, { type: 'select', value: v }, {
      disabled, disabledValues: options.filter(item => item.disabled).map(item => item.value),
    }));
    close();
    control.current?.focus();
  }

  return <div onBlur={event => { if (!event.currentTarget.contains(event.relatedTarget)) close(); }}>
    <label htmlFor={`${id}-input`}>Person</label>
    <input id={`${id}-input`} ref={control} role="combobox" disabled={disabled}
      aria-autocomplete="list" aria-expanded={open} aria-controls={`${id}-list`}
      aria-activedescendant={open && activeValue ? optionId(activeValue) : undefined}
      value={open ? query : state.selectedOptions[0]?.label ?? ''}
      onFocus={() => setExpanded(getDisclosureOpen(expanded, 'open', { disabled }))}
      onClick={() => setExpanded(getDisclosureOpen(expanded, 'open', { disabled }))}
      onChange={event => { setQuery(event.target.value); setActive(''); setExpanded(true); }}
      onKeyDown={event => {
        onKeyDown?.(event);
        if (event.defaultPrevented || event.nativeEvent.isComposing || disabled) return;
        const action = getComboboxKeyAction(event.key, { open, openOnEnter: false });
        if (!action) return;
        if (action.preventDefault) event.preventDefault();
        if (action.type === 'close') { close(); return; }
        if (action.type === 'select') { if (activeValue) choose(activeValue); return; }
        setExpanded(getDisclosureOpen(expanded, 'open', { disabled }));
        if (action.type === 'navigate') setActive(getNextEnabledValue(state.filteredOptions, open ? activeValue ?? '' : '', action.direction, { loop: false }) ?? '');
      }} />
    <div id={`${id}-list`} role="listbox" aria-label="People" hidden={!open}>
      {state.filteredOptions.map(option => <button key={option.value} id={optionId(option.value)}
        type="button" role="option" tabIndex={-1} disabled={option.disabled}
        aria-selected={value === option.value} onPointerDown={event => event.preventDefault()}
        onClick={() => choose(option.value)}>{option.label}</button>)}
      {state.filteredOptions.length === 0 && <span>No matches</span>}
    </div>
    <output role="status" aria-label="Committed value">{value}</output>
  </div>;
}
