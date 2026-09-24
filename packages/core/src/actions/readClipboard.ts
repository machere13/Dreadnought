export function readClipboard(): Promise<string> {
  return navigator.clipboard.readText();
}
