export interface VirtualWindowOptions {
  count: number;
  itemHeight: number;
  height: number;
  scrollTop: number;
  overscan?: number;
  activeIndex?: number;
}

export function getVirtualWindow(options: VirtualWindowOptions) {
  const { count, itemHeight, height, overscan = 3, activeIndex } = options;
  if (!Number.isSafeInteger(count) || count < 0) {
    throw new RangeError('Virtual count must be a nonnegative safe integer.');
  }
  if (!Number.isSafeInteger(overscan) || overscan < 0) {
    throw new RangeError('Virtual overscan must be a nonnegative safe integer.');
  }
  if (![itemHeight, height, options.scrollTop, count * itemHeight].every(Number.isFinite)) {
    throw new TypeError('Virtual geometry must be finite.');
  }
  if (itemHeight <= 0 || height <= 0) {
    throw new RangeError('Virtual row and viewport heights must be positive.');
  }
  if (
    activeIndex !== undefined &&
    (!Number.isSafeInteger(activeIndex) || activeIndex < 0 || activeIndex >= count)
  ) {
    throw new RangeError('Virtual active index must refer to a row.');
  }
  const totalHeight = count * itemHeight;
  const limit = Math.max(0, totalHeight - height);
  let scrollTop = Math.max(0, Math.min(limit, options.scrollTop));
  if (activeIndex !== undefined) {
    const top = activeIndex * itemHeight;
    const bottom = top + itemHeight;
    if (top < scrollTop) scrollTop = top;
    else if (bottom > scrollTop + height) scrollTop = Math.min(limit, bottom - height);
  }
  const start = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
  const end = Math.min(count, Math.ceil((scrollTop + height) / itemHeight) + overscan);
  return { start, end, offset: start * itemHeight, totalHeight, scrollTop };
}
