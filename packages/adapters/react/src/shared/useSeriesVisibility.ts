import { useLayoutEffect, useMemo, useRef, useState } from 'react';
import { getSelectionValue } from '@dreadnought/core';

export function useSeriesVisibility(series: readonly { id: string }[], controlled: readonly string[] | undefined,
  defaultValue: readonly string[] | undefined, onChange: ((next: string[]) => void) | undefined) {
  const [internal, setInternal] = useState<readonly string[]>(() => [...(defaultValue ?? series.map(item => item.id))]);
  const pending = useRef(internal);
  useLayoutEffect(() => { pending.current = internal; }, [internal]);
  const available = (values: readonly string[]) => values.filter(value => series.some(item => item.id === value));
  const visible = useMemo(() => available(controlled ?? internal), [controlled, internal, series]);
  function toggle(value: string) {
    const next = [...getSelectionValue(available(controlled ?? pending.current), { type: 'toggle', value })];
    if (controlled === undefined) {
      pending.current = next;
      setInternal(next);
    }
    onChange?.([...next]);
  }
  return { visible, toggle };
}
