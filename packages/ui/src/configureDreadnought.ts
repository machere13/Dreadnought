export interface DreadnoughtSettings {
  /** Use the wide font axis for headings and buttons. Enabled by default. */
  wideTypography?: boolean;
}

/** Configure all styled components on the current page, independently of its framework. */
export function configureDreadnought({ wideTypography }: DreadnoughtSettings): void {
  if (wideTypography === undefined) return;
  if (typeof wideTypography !== 'boolean') throw new TypeError('wideTypography must be a boolean.');
  // SSR has no page root; call this in the browser entrypoint to apply settings.
  if (typeof document === 'undefined') return;
  document.documentElement.setAttribute('data-dreadnought-wide-typography', String(wideTypography));
}
