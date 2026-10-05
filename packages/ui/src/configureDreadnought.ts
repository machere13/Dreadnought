export interface DreadnoughtSettings {
  wideTypography?: boolean;
}

export function configureDreadnought({ wideTypography }: DreadnoughtSettings): void {
  if (wideTypography === undefined) return;
  if (typeof wideTypography !== 'boolean') throw new TypeError('wideTypography must be a boolean.');
  if (typeof document === 'undefined') return;
  document.documentElement.setAttribute('data-dreadnought-wide-typography', String(wideTypography));
}
