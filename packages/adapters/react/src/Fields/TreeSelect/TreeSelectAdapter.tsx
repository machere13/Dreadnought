import {
  useContext,
  useEffect,
  useId,
  useImperativeHandle,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
import type { TreeKey } from '@dreadnought/core';
import { OverlayVisibilityContext } from '../../shared/OverlayVisibilityContext.ts';
import { useAnchoredPopover } from '../../shared/useAnchoredPopover.ts';
import { usePickerForm } from '../../shared/usePickerForm.ts';
import { CheckboxAdapter } from '../Checkbox/CheckboxAdapter.tsx';
import { useTreeSelect } from './useTreeSelect.ts';
import { TreeSelectPanel } from './TreeSelectPanel.tsx';
import { useTreeSelectViewport } from './useTreeSelectViewport.ts';
import type { TreeSelectAdapterProps, UseTreeSelectOptions } from './treeSelect.types.ts';

export function TreeSelectAdapter<RecordType, Key extends TreeKey>({
  records,
  getKey,
  getChildren,
  getLabel,
  getDisabled,
  getCheckDisabled,
  getSelectable,
  value,
  defaultValue,
  onValueChange,
  multiple,
  checkStrictly,
  expandedKeys,
  defaultExpandedKeys,
  onExpandedKeysChange,
  showSearch,
  open,
  defaultOpen,
  onOpenChange,
  disabled,
  readOnly,
  required,
  invalid,
  allowClear = true,
  placement = 'bottomLeft',
  autoAdjustOverflow = true,
  emptyContent,
  tagRender,
  slotClassNames = {},
  renderField = (props) => <input {...props} />,
  renderAction = ({ action, ...props }) => <button {...props} />,
  renderCheckbox = (props) => <CheckboxAdapter {...props} />,
  renderLabel,
  className,
  style,
  ref,
  id,
  name,
  onKeyDown,
  onBlur,
  onClick,
  onInvalid,
  ...native
}: TreeSelectAdapterProps<RecordType, Key>) {
  const visible = useContext(OverlayVisibilityContext);
  const model = useTreeSelect({
    records,
    getKey,
    getChildren,
    getLabel,
    getDisabled,
    getCheckDisabled,
    getSelectable,
    value,
    defaultValue,
    onValueChange,
    multiple,
    checkStrictly,
    expandedKeys,
    defaultExpandedKeys,
    onExpandedKeysChange,
    showSearch,
    open,
    defaultOpen,
    onOpenChange,
    disabled: disabled || !visible,
    readOnly,
    required,
    invalid,
    allowClear,
  } as UseTreeSelectOptions<RecordType, Key>);
  const generated = useId();
  const fieldId = id ?? generated;
  const popupId = `${fieldId}-tree`;
  const root = useRef<HTMLDivElement>(null);
  const field = useRef<HTMLInputElement>(null);
  const popup = useRef<HTMLDivElement>(null);
  const tree = useRef<HTMLUListElement>(null);
  const focusRequested = useRef(false);
  const revision = useRef(0);
  const current = useRef(model);
  const removedFocus = useRef<Element | null>(null);
  const [nativeInvalid, setNativeInvalid] = useState(false);
  const [nativeLabel, setNativeLabel] = useState('Выбор значения');
  current.current = model;
  useImperativeHandle(ref, () => field.current!);
  useLayoutEffect(() => {
    if (!model.open || native['aria-label'] !== undefined || native['aria-labelledby']) return;
    setNativeLabel(field.current?.labels?.[0]?.textContent ?? 'Выбор значения');
  });
  useLayoutEffect(() => {
    const previous = removedFocus.current;
    removedFocus.current = null;
    if (
      previous &&
      !previous.isConnected &&
      !model.disabled &&
      visible &&
      previous.ownerDocument.activeElement === previous.ownerDocument.body
    )
      field.current?.focus({ preventScroll: true });
  });
  useTreeSelectViewport(model.open && visible, root, popup, autoAdjustOverflow);
  useAnchoredPopover(model.open && visible, root, popup, root.current, true, {
    placement,
    autoAdjustOverflow,
    pointAtCenter: false,
    arrow: false,
  });
  usePickerForm(field, root, {
    form: native.form,
    isDirty: () => false,
    confirm: () => {},
    reset: () => {
      revision.current++;
      focusRequested.current = false;
      setNativeInvalid(false);
      model.reset();
    },
  });
  useLayoutEffect(() => {
    revision.current++;
  }, [model.value, model.open, model.disabled, native.form]);
  useEffect(() => {
    if (model.values.length || !required || model.disabled) setNativeInvalid(false);
  }, [model.values.length, required, model.disabled]);
  useEffect(() => {
    if (!model.open) return;
    const doc = root.current?.ownerDocument;
    const outside = (event: PointerEvent) => {
      if (!root.current?.contains(event.target as Node)) current.current.setOpen(false);
    };
    doc?.addEventListener('pointerdown', outside);
    return () => doc?.removeEventListener('pointerdown', outside);
  }, [model.open]);

  function close() {
    revision.current++;
    model.setOpen(false);
    field.current?.focus({ preventScroll: true });
  }
  function choose(key: Key) {
    model.select(key);
    if (
      !model.readOnly &&
      getSelectable?.(model.allRows.find((row) => row.key === key)!.record) !== false
    )
      field.current?.focus({ preventScroll: true });
  }
  function openTree() {
    focusRequested.current = false;
    field.current?.focus({ preventScroll: true });
    model.setOpen(true);
  }
  function remove(key: Key) {
    const active = root.current?.ownerDocument.activeElement;
    removedFocus.current = active && root.current?.contains(active) ? active : null;
    model.remove(key);
  }

  const panelOptions = {
    records,
    getKey,
    getChildren,
    getLabel,
    getDisabled,
    getCheckDisabled,
    getSelectable,
    renderAction,
    renderCheckbox,
    renderLabel,
    emptyContent,
    slotClassNames,
    'aria-label': native['aria-label'] ?? (native['aria-labelledby'] ? undefined : nativeLabel),
    'aria-labelledby': native['aria-labelledby'],
  } as TreeSelectAdapterProps<RecordType, Key>;
  return (
    <div
      ref={root}
      data-ui="tree-select"
      data-disabled={model.disabled || undefined}
      data-invalid={
        model.invalid ||
        nativeInvalid ||
        (native['aria-invalid'] !== undefined &&
          native['aria-invalid'] !== false &&
          native['aria-invalid'] !== 'false') ||
        undefined
      }
      className={[className, slotClassNames.root].filter(Boolean).join(' ')}
      style={style}
      onKeyDown={(event) => {
        if (
          event.defaultPrevented ||
          event.nativeEvent.isComposing ||
          event.key !== 'Escape' ||
          !model.open
        )
          return;
        event.preventDefault();
        event.stopPropagation();
        close();
      }}
      onBlur={(event) => {
        if (event.defaultPrevented || root.current?.contains(event.relatedTarget as Node | null))
          return;
        removedFocus.current = null;
        const version = revision.current;
        queueMicrotask(() => {
          const node = root.current;
          if (
            node &&
            version === revision.current &&
            !node.contains(node.ownerDocument.activeElement)
          )
            current.current.setOpen(false);
        });
      }}
    >
      <div data-slot="field" className={slotClassNames.field}>
        <div data-slot="selection" className={slotClassNames.selection}>
          {model.multiple &&
            model.tags.map((tag) => (
              <span
                key={`${typeof tag.key}:${tag.key}`}
                data-slot="tag"
                className={slotClassNames.tag}
              >
                {tagRender ? (
                  tagRender(tag, {
                    disabled:
                      model.disabled ||
                      model.readOnly ||
                      Boolean(
                        tag.record && (getDisabled?.(tag.record) || getCheckDisabled?.(tag.record)),
                      ),
                    onRemove: () => remove(tag.key),
                    removeLabel: `Удалить ${tag.label}`,
                  })
                ) : (
                  <>
                    <span className={slotClassNames.tagLabel}>{tag.label}</span>
                    {!model.readOnly &&
                      renderAction({
                        action: 'remove',
                        type: 'button',
                        'aria-label': `Удалить ${tag.label}`,
                        disabled:
                          model.disabled ||
                          Boolean(
                            tag.record &&
                            (getDisabled?.(tag.record) || getCheckDisabled?.(tag.record)),
                          ),
                        onClick: () => remove(tag.key),
                        children: '×',
                      })}
                  </>
                )}
              </span>
            ))}
          {renderField({
            ...native,
            placeholder: model.multiple && model.tags.length > 0 ? undefined : native.placeholder,
            id: fieldId,
            ref: (node) => {
              field.current = node;
            },
            type: 'text',
            role: 'combobox',
            autoComplete: native.autoComplete ?? 'off',
            value:
              showSearch && model.open && !model.readOnly
                ? model.searchValue
                : model.multiple
                  ? ''
                  : (model.tags[0]?.label ?? ''),
            disabled: model.disabled,
            readOnly: model.readOnly || !showSearch,
            'aria-expanded': model.open,
            'aria-haspopup': 'tree',
            'aria-controls': model.open ? popupId : undefined,
            'aria-required': required || native['aria-required'],
            'aria-invalid': model.invalid || nativeInvalid || native['aria-invalid'],
            onChange: (event) => model.setSearch(event.target.value),
            onBlur,
            onClick: (event) => {
              onClick?.(event);
              if (!event.defaultPrevented) openTree();
            },
            onKeyDown: (event) => {
              onKeyDown?.(event);
              if (event.defaultPrevented || event.nativeEvent.isComposing || model.disabled) return;
              if (event.key !== 'ArrowDown' || event.ctrlKey || event.metaKey || event.shiftKey)
                return;
              event.preventDefault();
              if (model.open) {
                const first = tree.current?.querySelector<HTMLElement>(
                  '[role="treeitem"][tabindex="0"]',
                );
                (first ?? tree.current)?.focus({ preventScroll: true });
              } else {
                focusRequested.current = true;
                model.setOpen(true);
              }
            },
          })}
        </div>
        <div data-slot="actions" className={slotClassNames.actions}>
          {allowClear &&
            model.values.length > 0 &&
            !model.readOnly &&
            renderAction({
              action: 'clear',
              type: 'button',
              'aria-label': 'Очистить выбор',
              disabled: model.disabled,
              onClick: () => {
                model.clear();
                field.current?.focus({ preventScroll: true });
              },
              children: '×',
            })}
          {renderAction({
            action: 'toggle',
            type: 'button',
            'aria-label': 'Открыть дерево',
            'aria-expanded': model.open,
            'aria-haspopup': 'tree',
            disabled: model.disabled,
            onClick: () => {
              if (model.open) close();
              else openTree();
            },
            children: '⌄',
          })}
        </div>
      </div>
      <select
        aria-hidden="true"
        tabIndex={-1}
        form={native.form}
        required={required && !readOnly}
        disabled={model.disabled}
        value={model.values.length ? 'selected' : ''}
        onChange={() => {}}
        style={{ position: 'absolute', width: 1, height: 1, opacity: 0, pointerEvents: 'none' }}
        onInvalid={(event) => {
          event.preventDefault();
          setNativeInvalid(true);
          field.current?.focus({ preventScroll: true });
          if (field.current) {
            const forwarded = { ...event, currentTarget: field.current, target: field.current };
            onInvalid?.(forwarded);
          }
        }}
      >
        <option value="" />
        <option value="selected" />
      </select>
      {name !== undefined &&
        model.values.map((key) => (
          <input
            key={`${typeof key}:${key}`}
            type="hidden"
            name={name}
            form={native.form}
            value={String(key)}
            disabled={model.disabled}
          />
        ))}
      {model.open && visible && (
        <div
          ref={popup}
          id={popupId}
          popover="manual"
          data-slot="popup"
          className={slotClassNames.popup}
          style={{ position: 'fixed', inset: 'auto', margin: 0, boxSizing: 'border-box' }}
        >
          <div data-slot="viewport" className={slotClassNames.viewport}>
            <TreeSelectPanel
              model={model}
              options={panelOptions}
              tree={tree}
              focusRequested={focusRequested}
              choose={choose}
            />
          </div>
        </div>
      )}
    </div>
  );
}
