import { useCallback, useLayoutEffect, useRef, useState } from 'react';

export function useAccordionParts(value: string) {
  const triggers = useRef(new Set<symbol>());
  const panels = useRef(new Set<symbol>());
  const mounted = useRef(false);
  const [, revalidate] = useState(0);

  const registerPart = useCallback((part: 'trigger' | 'panel', token: symbol) => {
    const tokens = part === 'trigger' ? triggers.current : panels.current;
    tokens.add(token);
    if (mounted.current) revalidate((revision) => revision + 1);
    return () => {
      tokens.delete(token);
      if (mounted.current) revalidate((revision) => revision + 1);
    };
  }, []);

  useLayoutEffect(() => {
    mounted.current = true;
    return () => { mounted.current = false; };
  }, []);

  useLayoutEffect(() => {
    if (triggers.current.size !== 1 || panels.current.size !== 1) {
      throw new Error(`Accordion.Item ${value} needs exactly one Trigger and one Panel.`);
    }
  });

  return registerPart;
}
