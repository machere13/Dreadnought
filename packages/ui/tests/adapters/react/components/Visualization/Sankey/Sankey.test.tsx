import { afterEach, expect, it } from 'vitest';
import { cleanup, render } from '@testing-library/react';
import * as ui from '@dreadnought/ui/react';
import * as adapters from '@dreadnought/react/unstyled';

afterEach(cleanup);
it('themes the public component while preserving consumer classes and the unstyled adapter', () => {
  const nodes = [
    { id: 'a', label: 'A' },
    { id: 'b', label: 'B' },
  ];
  const links = [{ id: 'ab', source: 'a', target: 'b', value: 5 }];
  const { container } = render(
    <>
      <ui.Sankey
        nodes={nodes}
        links={links}
        label="UI"
        className="custom"
        slotProps={{ item: () => ({ className: 'custom-item' }) }}
      />
      <adapters.SankeyAdapter nodes={nodes} links={links} label="Adapter" />
    </>,
  );
  const figures = container.querySelectorAll('figure');
  expect(figures[0].className).toContain('custom');
  const item = figures[0].querySelector('[data-ui="sankey-item"]');
  expect(item?.className).toContain('custom-item');
  expect(item?.className).not.toBe('custom-item');
  expect(figures[1].className).toBe('');
  expect(figures[1].querySelector('[data-ui="sankey-item"]')?.className).toBe('');
});
