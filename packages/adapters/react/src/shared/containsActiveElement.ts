export function containsActiveElement(root: HTMLElement | null): boolean {
  if (!root?.contains(root.ownerDocument.activeElement)) return false;
  for (
    let frame = root.ownerDocument.defaultView?.frameElement;
    frame;
    frame = frame.ownerDocument.defaultView?.frameElement
  ) {
    if (frame.ownerDocument.activeElement !== frame) return false;
  }
  return true;
}
