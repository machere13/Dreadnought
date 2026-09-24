export function download(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.append(link);

  try {
    link.click();
  } finally {
    link.remove();
    // TODO: Replace this arbitrary delay with an explicit blob URL lifecycle strategy.
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
}
