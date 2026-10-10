import { Fragment, useImperativeHandle } from 'react';
import type { ChangeEvent, FocusEvent, FormEvent, MouseEvent } from 'react';
import { useSelect } from './useSelect.ts';
import type { SelectAdapterProps } from './SelectAdapter.types.ts';

export function SelectAdapter(props: SelectAdapterProps) {
  const select = useSelect(props);
  const {
    options,
    value,
    defaultValue,
    onValueChange,
    multiple,
    searchable: legacySearchable,
    showSearch,
    allowClear,
    invalid,
    emptyContent = 'Нет вариантов',
    clearLabel = 'Очистить выбор',
    indicator = '▾',
    clearContent = '×',
    removeLabel = (option) => `Удалить ${option.label}`,
    removeContent = '×',
    maxTagCount,
    maxCount,
    tagRender,
    open,
    defaultOpen,
    onOpenChange,
    searchValue,
    defaultSearchValue,
    onSearch,
    filterOption,
    loading = false,
    loadingContent = 'Загрузка…',
    optionRender,
    className,
    style,
    ref,
    name,
    required,
    disabled,
    slotProps = {},
    onKeyDown,
    onClick,
    onBlur,
    ...inputProps
  } = props;
  const { searchable } = select;
  useImperativeHandle(ref, () => select.control.current!);
  const display = select.state.selectedOptions.map((option) => option.label).join(', ');
  const visibleTags = select.state.selectedOptions.slice(
    0,
    maxTagCount === undefined || !Number.isFinite(maxTagCount)
      ? undefined
      : Math.max(0, Math.trunc(maxTagCount)),
  );
  const hiddenTagCount = select.state.selectedOptions.length - visibleTags.length;
  const additional = select.state.selectedOptions.filter(
    (option) => !select.state.options.some((item) => item.value === option.value),
  );
  const indices = new Map(
    select.state.filteredOptions.map((option, index) => [option.value, index]),
  );

  function handleRootClick(event: MouseEvent<HTMLDivElement>) {
    slotProps.root?.onClick?.(event);
    if (
      !event.defaultPrevented &&
      event.target !== select.control.current &&
      !select.control.current?.matches(':disabled') &&
      !(event.target as Element).closest('button, [data-slot="popup"]')
    ) {
      select.control.current?.focus();
      select.setExpanded(true);
    }
  }

  function handleRootBlur(event: FocusEvent<HTMLDivElement>) {
    slotProps.root?.onBlur?.(event);
    if (!event.defaultPrevented && !event.currentTarget.contains(event.relatedTarget)) {
      select.close();
    }
  }

  function handleControlInvalid(event: FormEvent<HTMLInputElement>) {
    props.onInvalid?.(event);
    slotProps.control?.onInvalid?.(event);
    select.setValidationInvalid(true);
    if (!event.defaultPrevented) {
      event.currentTarget.focus();
    }
  }

  function handleControlChange(event: ChangeEvent<HTMLInputElement>) {
    slotProps.control?.onChange?.(event);
    if (!event.defaultPrevented && searchable) {
      select.setQuery(event.currentTarget.value);
      select.setActive('');
      select.setExpanded(true);
    }
  }

  function handleControlClick(event: MouseEvent<HTMLInputElement>) {
    onClick?.(event);
    slotProps.control?.onClick?.(event);
    if (!event.defaultPrevented) {
      select.setExpanded(true);
    }
  }

  function handleControlBlur(event: FocusEvent<HTMLInputElement>) {
    onBlur?.(event);
    slotProps.control?.onBlur?.(event);
  }

  function handleClearClick(event: MouseEvent<HTMLButtonElement>) {
    slotProps.clear?.onClick?.(event);
    if (!event.defaultPrevented) {
      select.clear();
    }
  }

  function handleNativeChange(event: ChangeEvent<HTMLSelectElement>) {
    select.setValue(
      multiple
        ? Array.from(event.currentTarget.selectedOptions, (option) => option.value)
        : event.currentTarget.value || null,
    );
  }

  function handleNativeInvalid(event: FormEvent<HTMLSelectElement>) {
    event.preventDefault();
    event.stopPropagation();
    const control = select.control.current;
    if (control) {
      control.dispatchEvent(
        new control.ownerDocument.defaultView!.Event('invalid', { cancelable: true }),
      );
    }
  }

  function handlePopupMouseDown(event: MouseEvent<HTMLDivElement>) {
    slotProps.popup?.onMouseDown?.(event);
    event.preventDefault();
  }

  function handleOptionClick(event: MouseEvent<HTMLDivElement>, value: string) {
    slotProps.option?.onClick?.(event);
    if (!event.defaultPrevented) {
      select.choose(value);
    }
  }

  const renderOption = (option: (typeof select.state.options)[number]) => (
    <div
      {...slotProps.option}
      key={option.value}
      id={select.optionId(option.value)}
      aria-label={option.label}
      role="option"
      aria-selected={select.state.values.includes(option.value)}
      aria-disabled={option.disabled || undefined}
      data-slot="option"
      data-active={option.value === select.activeValue ? '' : undefined}
      onClick={(event) => handleOptionClick(event, option.value)}
    >
      {optionRender
        ? optionRender(option, {
            active: option.value === select.activeValue,
            selected: select.state.values.includes(option.value),
            index: indices.get(option.value)!,
          })
        : option.label}
    </div>
  );
  const nativeOption = (option: (typeof select.state.options)[number]) => (
    <option key={option.value} value={option.value} disabled={option.disabled}>
      {option.label}
    </option>
  );
  const control = (
    <input
      {...inputProps}
      {...slotProps.control}
      ref={select.control}
      type="text"
      data-slot="control"
      disabled={disabled}
      role="combobox"
      readOnly={!searchable}
      autoComplete="off"
      aria-haspopup="listbox"
      aria-expanded={select.open}
      aria-controls={`${select.id}-listbox`}
      aria-autocomplete={searchable ? 'list' : 'none'}
      aria-activedescendant={
        select.open && select.activeValue ? select.optionId(select.activeValue) : undefined
      }
      aria-required={required || undefined}
      aria-invalid={select.state.invalid || inputProps['aria-invalid'] || undefined}
      value={searchable && select.open ? select.query : multiple ? '' : display}
      placeholder={
        multiple && select.state.values.length > 0
          ? undefined
          : searchable && select.open && display
            ? display
            : inputProps.placeholder
      }
      onInvalid={handleControlInvalid}
      onChange={handleControlChange}
      onClick={handleControlClick}
      onBlur={handleControlBlur}
      onKeyDown={select.onKeyDown}
    />
  );
  return (
    <div
      {...slotProps.root}
      ref={select.root}
      data-ui="select"
      data-disabled={disabled ? '' : undefined}
      data-invalid={select.state.invalid ? '' : undefined}
      data-open={select.open ? '' : undefined}
      data-loading={loading ? '' : undefined}
      className={[className, slotProps.root?.className].filter(Boolean).join(' ')}
      style={style ?? slotProps.root?.style}
      onClick={handleRootClick}
      onBlur={handleRootBlur}
    >
      {multiple ? (
        <div {...slotProps.selection} data-slot="selection">
          {visibleTags.map((option) => {
            const tagDisabled = Boolean(
              disabled || option.disabled || (required && select.state.values.length === 1),
            );
            if (tagRender) {
              return (
                <Fragment key={option.value}>
                  {tagRender(option, {
                    disabled: tagDisabled,
                    removeLabel: removeLabel(option),
                    onRemove: () => {
                      if (!tagDisabled) select.remove(option.value);
                    },
                  })}
                </Fragment>
              );
            }
            return (
              <span {...slotProps.tag} key={option.value} data-slot="tag">
                <span {...slotProps.tagLabel} data-slot="tag-label">
                  {option.label}
                </span>
                <button
                  {...slotProps.remove}
                  type="button"
                  data-slot="remove"
                  aria-label={removeLabel(option)}
                  disabled={tagDisabled}
                  onClick={(event) => {
                    slotProps.remove?.onClick?.(event);
                    if (!event.defaultPrevented) select.remove(option.value);
                  }}
                >
                  {removeContent}
                </button>
              </span>
            );
          })}
          {hiddenTagCount > 0 && (
            <span {...slotProps.tag} data-slot="tag" data-summary="">
              +{hiddenTagCount}
            </span>
          )}
          {control}
        </div>
      ) : (
        control
      )}
      {allowClear && select.state.values.length > 0 && (
        <button
          {...slotProps.clear}
          type="button"
          data-slot="clear"
          disabled={disabled}
          aria-label={clearLabel}
          onClick={handleClearClick}
        >
          {clearContent}
        </button>
      )}
      <span data-slot="indicator" aria-hidden="true">
        {indicator}
      </span>
      <select
        ref={select.native}
        hidden
        data-slot="native"
        name={name}
        form={inputProps.form}
        disabled={disabled}
        required={required}
        aria-hidden="true"
        tabIndex={-1}
        multiple={multiple}
        value={multiple ? [...select.state.values] : (select.state.values[0] ?? '')}
        onChange={handleNativeChange}
        onInvalid={handleNativeInvalid}
      >
        {!multiple && <option value="" />}
        {select.state.groups.map((group, index) =>
          group.label === undefined ? (
            group.options.map(nativeOption)
          ) : (
            <optgroup key={index} label={group.label} disabled={group.disabled}>
              {group.options.map(nativeOption)}
            </optgroup>
          ),
        )}
        {additional.map(nativeOption)}
      </select>
      <div
        {...slotProps.popup}
        ref={select.popup}
        id={`${select.id}-listbox`}
        role="listbox"
        popover="manual"
        hidden={!select.open}
        aria-busy={loading || undefined}
        data-slot="popup"
        aria-label={slotProps.popup?.['aria-label'] ?? props['aria-label'] ?? 'Варианты'}
        aria-labelledby={
          slotProps.popup?.['aria-labelledby'] ??
          (slotProps.popup?.['aria-label'] ? undefined : props['aria-labelledby'])
        }
        aria-multiselectable={multiple || undefined}
        onMouseDown={handlePopupMouseDown}
      >
        {loading && (
          <div data-slot="loading" role="status">
            {loadingContent}
          </div>
        )}
        {select.state.filteredGroups.map((group, index) =>
          group.label === undefined ? (
            group.options.map(renderOption)
          ) : (
            <div
              {...slotProps.group}
              key={index}
              role="group"
              aria-labelledby={`${select.id}-group-${index}`}
              data-slot="group"
            >
              <div
                {...slotProps.groupLabel}
                id={`${select.id}-group-${index}`}
                data-slot="group-label"
              >
                {group.label}
              </div>
              {group.options.map(renderOption)}
            </div>
          ),
        )}
        {!loading && select.state.filteredOptions.length === 0 && (
          <div data-slot="empty" role="status">
            {emptyContent}
          </div>
        )}
      </div>
    </div>
  );
}
