// @vitest-environment node
import { renderToString } from 'react-dom/server';
import { expect, it } from 'vitest';
import { FloatingPanelAdapter } from '../../../src/unstyled.ts';

it('does not access document during server rendering', () => {
  expect(renderToString(<FloatingPanelAdapter defaultOpen content="Текст">
    {p => <button {...p}>Открыть</button>}
  </FloatingPanelAdapter>)).toBe('');
});
