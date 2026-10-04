import { useImperativeHandle } from 'react';
import { useSelect } from './useSelect.ts';
import type { SelectAdapterProps } from './SelectAdapter.types.ts';

export function SelectAdapter(props: SelectAdapterProps) {
  const select = useSelect(props);
  const { options, value, defaultValue, onValueChange, multiple, searchable = false, allowClear,
    invalid, emptyContent = 'Нет вариантов', clearLabel = 'Очистить выбор', indicator = '▾', clearContent = '×',
    className, style, ref, name, required, disabled, slotProps = {}, onKeyDown, onClick, onBlur, ...inputProps } = props;
  useImperativeHandle(ref, () => select.control.current!);
  const display = select.state.selectedOptions.map(option => option.label).join(', ');
  const additional = select.state.selectedOptions.filter(option => !options.some(item => item.value === option.value));
  return <div {...slotProps.root} ref={select.root} data-ui="select" data-disabled={disabled ? '' : undefined}
    data-invalid={select.state.invalid ? '' : undefined} data-open={select.open ? '' : undefined}
    className={[className, slotProps.root?.className].filter(Boolean).join(' ')} style={style ?? slotProps.root?.style} onClick={event => {
      slotProps.root?.onClick?.(event);
      if (!event.defaultPrevented && !select.control.current?.matches(':disabled') && !(event.target as Element).closest('button, [data-slot="popup"]')) {
        select.control.current?.focus(); select.setExpanded(true);
      }
    }} onBlur={event => {
      slotProps.root?.onBlur?.(event);
      if (!event.defaultPrevented && !event.currentTarget.contains(event.relatedTarget)) select.close();
    }}>
    <input {...inputProps} {...slotProps.control} ref={select.control} type="text" data-slot="control"
      disabled={disabled} role="combobox" readOnly={!searchable} autoComplete="off" aria-haspopup="listbox"
      aria-expanded={select.open} aria-controls={`${select.id}-listbox`} aria-autocomplete={searchable ? 'list' : 'none'}
      aria-activedescendant={select.open && select.activeValue ? select.optionId(select.activeValue) : undefined}
      aria-required={required || undefined} aria-invalid={select.state.invalid || inputProps['aria-invalid'] || undefined}
      value={searchable && select.open ? select.query : display}
      placeholder={searchable && select.open && display ? display : inputProps.placeholder}
      onChange={event => {
        slotProps.control?.onChange?.(event);
        if (!event.defaultPrevented && searchable) { select.setQuery(event.currentTarget.value); select.setActive(''); select.setExpanded(true); }
      }} onClick={event => {
        onClick?.(event); slotProps.control?.onClick?.(event);
        if (!event.defaultPrevented) select.setExpanded(true);
      }} onBlur={event => { onBlur?.(event); slotProps.control?.onBlur?.(event); }} onKeyDown={select.onKeyDown} />
    {allowClear && select.state.values.length > 0 && <button {...slotProps.clear} type="button" data-slot="clear" disabled={disabled}
      aria-label={clearLabel} onClick={event => { slotProps.clear?.onClick?.(event); if (!event.defaultPrevented) select.clear(); }}>{clearContent}</button>}
    <span data-slot="indicator" aria-hidden="true">{indicator}</span>
    <select ref={select.native} hidden data-slot="native" name={name} form={inputProps.form} disabled={disabled} required={required}
      aria-hidden="true" tabIndex={-1} multiple={multiple} value={multiple ? [...select.state.values] : select.state.values[0] ?? ''}
      onChange={event => { select.setValue(multiple ? Array.from(event.currentTarget.selectedOptions, option => option.value) : event.currentTarget.value || null); }}
      onInvalid={event => { event.preventDefault(); select.setValidationInvalid(true); select.control.current?.focus(); }}>
      {!multiple && <option value="" />}
      {[...options, ...additional].map(option => <option key={option.value} value={option.value} disabled={option.disabled}>{option.label}</option>)}
    </select>
    <div {...slotProps.popup} ref={select.popup} id={`${select.id}-listbox`} role="listbox" popover="auto" hidden={!select.open}
      data-slot="popup" aria-label={props['aria-label'] ?? 'Варианты'} aria-labelledby={props['aria-labelledby']}
      aria-multiselectable={multiple || undefined} onToggle={event => {
        slotProps.popup?.onToggle?.(event); if (event.newState === 'closed') select.close();
      }} onMouseDown={event => { slotProps.popup?.onMouseDown?.(event); event.preventDefault(); }}>
      {select.state.filteredOptions.map(option => <div {...slotProps.option} key={option.value} id={select.optionId(option.value)}
        role="option" aria-selected={select.state.values.includes(option.value)} aria-disabled={option.disabled || undefined}
        data-slot="option" data-active={option.value === select.activeValue ? '' : undefined} onClick={event => {
          slotProps.option?.onClick?.(event); if (!event.defaultPrevented) select.choose(option.value);
        }}>{option.label}</div>)}
      {select.state.filteredOptions.length === 0 && <div data-slot="empty" role="status">{emptyContent}</div>}
    </div>
  </div>;
}
