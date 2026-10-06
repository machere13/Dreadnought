export function getFocusableElements(root: HTMLElement): HTMLElement[] {
  const elements = root.querySelectorAll<HTMLElement>('button, a[href], input:not([type="hidden"]), select, textarea, [tabindex], [contenteditable="true"]');
  return [...elements].filter(element => {
    if (element.tabIndex < 0 || element.matches(':disabled') || element.closest('[hidden], [inert], [aria-hidden="true"]')) return false;
    for (let parent: HTMLElement | null = element; parent && root.contains(parent); parent = parent.parentElement) {
      const style = root.ownerDocument.defaultView?.getComputedStyle(parent);
      if (style?.display === 'none' || style?.visibility === 'hidden') return false;
    }
    return true;
  });
}
