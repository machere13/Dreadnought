import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';

export function useChartAxes(width: number, minimumLeft: number) {
  const ref = useRef<SVGGElement>(null);
  const [left, setLeft] = useState(minimumLeft);
  const [hidden, setHidden] = useState<number[]>([]);
  const measure = useCallback(() => {
    const group = ref.current;
    if (!group || typeof group.getBBox !== 'function') return;
    const yLabels = [...group.querySelectorAll<SVGTextElement>('[data-chart-axis="y"]')];
    const nextLeft = Math.max(
      minimumLeft,
      ...yLabels.map((text) => Math.ceil(text.getBBox().width) + 8),
    );
    if (nextLeft !== left) {
      setLeft(nextLeft);
      return;
    }
    const labels = [...group.querySelectorAll<SVGTextElement>('[data-chart-axis="x"]')];
    const boxes = labels.map((text) => text.getBBox());
    const extent = Math.max(1, width - left - 16);
    const last = boxes
      .map((box) => box.x >= 0 && box.x + box.width <= extent + 1)
      .lastIndexOf(true);
    const nextHidden: number[] = [];
    let end = -Infinity;
    boxes.forEach((box, index) => {
      const fits = box.x >= 0 && box.x + box.width <= extent + 1;
      const beforeLast = index === last || box.x + box.width + 8 <= boxes[last]?.x;
      if (fits && box.x >= end + 8 && beforeLast) {
        end = box.x + box.width;
      } else {
        nextHidden.push(index);
      }
    });
    setHidden((previous) => (previous.join(',') === nextHidden.join(',') ? previous : nextHidden));
  }, [width, minimumLeft, left]);
  useLayoutEffect(measure);
  useEffect(() => {
    const fonts = ref.current?.ownerDocument.fonts;
    fonts?.addEventListener('loadingdone', measure);
    return () => fonts?.removeEventListener('loadingdone', measure);
  }, [measure]);
  return { ref, left, hidden };
}
