import { useEffect, useId, useRef, useState } from 'react';
import { getDisclosureOpen, getNextEnabledValue } from '@dreadnought/core';

export function DialogProbe({ saveDisabled = false, preventCancel = false }: {
  saveDisabled?: boolean;
  preventCancel?: boolean;
} = {}) {
  const [open, setOpen] = useState(false);
  const titleId = useId();
  const dialog = useRef<HTMLDialogElement>(null);
  const field = useRef<HTMLInputElement>(null);
  const save = useRef<HTMLButtonElement>(null);
  const close = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (!open) return;
    const node = dialog.current!;
    const opener = node.ownerDocument.activeElement;
    node.showModal();
    field.current?.focus();
    return () => {
      if (node.open) node.close();
      if (opener instanceof HTMLElement && opener.isConnected) opener.focus({ preventScroll: true });
    };
  }, [open]);
  function dismiss() { setOpen(current => getDisclosureOpen(current, 'close')); }
  return <>
    <button type="button" onClick={() => setOpen(current => getDisclosureOpen(current, 'open'))}>Open dialog</button>
    <dialog ref={dialog} aria-labelledby={titleId} onCancel={event => {
      event.preventDefault();
      if (!preventCancel) dismiss();
    }} onClose={event => { if (!event.currentTarget.open) dismiss(); }} onKeyDown={event => {
      if (event.key !== 'Tab' || event.defaultPrevented || event.nativeEvent.isComposing || event.ctrlKey || event.altKey || event.metaKey) return;
      const nodes = [field.current!, save.current!, close.current!].filter(node => !node.matches(':disabled'));
      const current = nodes.indexOf(event.currentTarget.ownerDocument.activeElement as HTMLInputElement | HTMLButtonElement);
      if (current !== (event.shiftKey ? 0 : nodes.length - 1)) return;
      const next = getNextEnabledValue(nodes.map((_, index) => ({ value: String(index) })), String(current), event.shiftKey ? 'previous' : 'next');
      if (next === undefined) return;
      event.preventDefault();
      nodes[Number(next)]!.focus();
    }}>
      <h2 id={titleId}>Edit profile</h2>
      <label>Name <input ref={field} /></label>
      <button ref={save} type="button" disabled={saveDisabled} onClick={dismiss}>Save</button>
      <button ref={close} type="button" onClick={dismiss}>Close</button>
    </dialog>
  </>;
}
