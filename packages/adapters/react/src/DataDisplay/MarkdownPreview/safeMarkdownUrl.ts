export function safeMarkdownUrl(url: string, key: string) {
  if (/[\u0000-\u001f\u007f-\u009f]/.test(url)) return undefined;
  const value = url.trim();
  const protocol = /^([^/?#]*):/.exec(value)?.[1]?.toLowerCase();
  return protocol && protocol !== 'http' && protocol !== 'https' && !(key === 'href' && protocol === 'mailto') ? undefined : value;
}
