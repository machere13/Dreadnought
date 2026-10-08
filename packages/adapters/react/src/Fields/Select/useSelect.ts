import { useEffect, useId, useRef, useState } from 'react';
import {
  getComboboxKeyAction,
  getDisclosureOpen,
  getNextEnabledValue,
  getSelectState,
  getSelectionValue,
} from '@dreadnought/core';
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
  const [expanded, setLocalExpanded] = useState(props.defaultOpen ?? false);
  const [localQuery, setLocalQuery] = useState(props.defaultSearchValue ?? '');
  const query = props.searchValue ?? localQuery;
  const [active, setActive] = useState('');
  const [validationInvalid, setValidationInvalid] = useState(false);
  const [value, setValue] = useFieldValue<SelectValue>(
    props.value,
    props.defaultValue ?? (props.multiple ? empty : null),
    (next) => {
      if (props.multiple) {
        props.onValueChange?.(next as string[]);
      } else {
        props.onValueChange?.(next as string | null);
      }
    },
    native,
    props.form,
  );
  const open = (props.open ?? expanded) && !props.disabled;
  const current = useRef({ open, query, props });
  current.current = { open, query, props };
  const state = getSelectState({
    ...props,
    value,
    query: open ? query : '',
    invalid: props.invalid || validationInvalid,
  });
  const activeValue =
    state.filteredOptions.find((option) => option.value === active && !option.disabled)?.value ??
    state.filteredOptions.find((option) => state.values.includes(option.value) && !option.disabled)
      ?.value ??
    state.filteredOptions.find((option) => !option.disabled)?.value;
  const optionId = (v: string) => `${id}-option-${encodeURIComponent(v)}`;

  function setExpanded(next: boolean) {
    const snapshot = current.current;
    next = getDisclosureOpen(snapshot.open, next ? 'open' : 'close', {
      disabled: snapshot.props.disabled || control.current?.matches(':disabled'),
    });
    if (next === snapshot.open) {
      return;
    }
    if (snapshot.props.open === undefined) {
      snapshot.open = next;
      setLocalExpanded(next);
    }
    snapshot.props.onOpenChange?.(next);
  }
  function setQuery(next: string) {
    const snapshot = current.current;
    if (next === snapshot.query) {
      return;
    }
    if (snapshot.props.searchValue === undefined) {
      snapshot.query = next;
      setLocalQuery(next);
    }
    snapshot.props.onSearch?.(next);
  }
  function close() {
    setExpanded(false);
    setQuery('');
  }
  function changeSelection(action: SelectionAction<string>) {
    setValue(
      getSelectionValue(props.multiple ? state.values : (state.values[0] ?? null), action, {
        disabled: props.disabled || control.current?.matches(':disabled'),
        required: props.required,
        disabledValues: state.options
          .filter((option) => option.disabled)
          .map((option) => option.value),
      }),
    );
  }
  function choose(v: string) {
    const option = state.options.find((option) => option.value === v);
    if (props.disabled || !option || option.disabled || control.current?.matches(':disabled')) {
      return;
    }
    changeSelection({ type: props.multiple ? 'toggle' : 'select', value: v });
    setValidationInvalid(false);
    if (props.multiple) {
      setQuery('');
    } else {
      close();
    }
    control.current?.focus();
  }
  function clear() {
    changeSelection({ type: 'clear' });
    setValidationInvalid(false);
    close();
    control.current?.focus();
  }
  function onKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    props.onKeyDown?.(event);
    props.slotProps?.control?.onKeyDown?.(event);
    if (event.defaultPrevented || event.nativeEvent.isComposing || props.disabled) {
      return;
    }
    const action = getComboboxKeyAction(event.key, { open, searchable: props.searchable ?? false });
    if (!action) {
      return;
    }
    if (action.preventDefault) {
      event.preventDefault();
    }
    if (action.type === 'close') {
      close();
      return;
    }
    if (action.type === 'open') {
      setExpanded(true);
      return;
    }
    if (action.type === 'select') {
      if (activeValue) {
        choose(activeValue);
      }
      return;
    }
    const direction = action.direction;
    if (!open) {
      setExpanded(true);
      setActive(
        getNextEnabledValue(
          state.filteredOptions,
          '',
          direction === 'previous' ? 'last' : 'first',
        ) ?? '',
      );
    } else {
      setActive(
        getNextEnabledValue(state.filteredOptions, activeValue ?? '', direction, { loop: false }) ??
          '',
      );
    }
  }
  useAnchoredPopover(open, root, popup);
  useEffect(() => {
    const document = root.current?.ownerDocument;
    if (!open || !document) {
      return;
    }
    function outside(event: PointerEvent) {
      const path = event.composedPath();
      if (
        !event.defaultPrevented &&
        !path.includes(root.current!) &&
        !path.includes(popup.current!)
      ) {
        close();
      }
    }
    document.addEventListener('pointerdown', outside);
    return () => document.removeEventListener('pointerdown', outside);
  }, [open]);
  useEffect(() => {
    if (props.disabled) {
      setLocalExpanded(false);
      setQuery('');
    }
  }, [props.disabled]);
  useEffect(() => {
    if (open && activeValue) {
      popup.current?.ownerDocument
        .getElementById(optionId(activeValue))
        ?.scrollIntoView?.({ block: 'nearest' });
    }
  }, [open, activeValue, id]);
  useEffect(() => {
    if (native.current?.validity.valid) {
      setValidationInvalid(false);
    }
  }, [value, props.required, props.disabled, props.multiple, props.options]);
  useEffect(() => {
    const form = native.current?.form;
    function reset(event: Event) {
      queueMicrotask(() => {
        if (!event.defaultPrevented) {
          close();
          setValidationInvalid(false);
        }
      });
    }
    form?.addEventListener('reset', reset);
    return () => form?.removeEventListener('reset', reset);
  }, [props.form]);
  return {
    id,
    control,
    native,
    root,
    popup,
    state,
    open,
    query,
    activeValue,
    optionId,
    choose,
    clear,
    close,
    setValue,
    setExpanded,
    setQuery,
    setActive,
    setValidationInvalid,
    onKeyDown,
  };
}
