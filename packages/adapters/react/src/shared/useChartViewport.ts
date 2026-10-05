import { useEffect, useState, type RefObject } from 'react';

export function useChartViewport(width: number | undefined, height: number | undefined, ref: RefObject<HTMLDivElement | null>) {
  const [measurement, setMeasurement] = useState<{ target: HTMLDivElement; width: number }>();
  useEffect(() => {
    setMeasurement(undefined);
    const target = ref.current;
    if (width !== undefined || !target) return;
    const Observer = target.ownerDocument.defaultView?.ResizeObserver ?? globalThis.ResizeObserver;
    if (!Observer) return;
    let active = true;
    const observer = new Observer(entries => {
      const entry = entries.find(item => item.target === target);
      if (active && entry) setMeasurement({ target, width: entry.contentRect.width });
    });
    observer.observe(target);
    return () => { active = false; observer.disconnect(); };
  }, [width, height, ref]);
  if (width !== undefined && height !== undefined) return { width, height };
  const measured = measurement?.target === ref.current ? measurement?.width ?? 0 : 0;
  return Number.isFinite(measured) && measured > 0 ? { width: measured, height: measured * 0.8 } : undefined;
}
