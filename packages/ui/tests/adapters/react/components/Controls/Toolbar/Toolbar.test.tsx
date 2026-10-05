import { createRef } from 'react';
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, expect, it } from 'vitest';
import { useToolbarItem } from '@dreadnought/react/logic';
import { ToolbarAdapter } from '@dreadnought/react/unstyled';
import { Toolbar, Button } from '@dreadnought/ui/react';

afterEach(cleanup);
function Command({ value }: { value: string }) {
  const { itemProps } = useToolbarItem<HTMLButtonElement>({ value });
  return <Button {...itemProps} size="compact">{value}</Button>;
}
it('styles the root without changing native children and forwards consumer properties', () => {
  const ref = createRef<HTMLDivElement>();
  render(<><Toolbar ref={ref} navigation="native" orientation="vertical" aria-label="Filters" className="custom" data-purpose="filters"><input aria-label="Search" /></Toolbar><ToolbarAdapter navigation="native" aria-label="Plain" /></>);
  const root = screen.getByRole('group', { name: 'Filters' });
  expect(root).toBe(ref.current);
  expect(root.className).toContain('custom');
  expect(root.className).not.toBe('custom');
  expect(root.getAttribute('data-purpose')).toBe('filters');
  expect(root.getAttribute('aria-orientation')).toBeNull();
  expect(screen.getByRole('textbox').getAttribute('tabindex')).toBeNull();
  expect(screen.getByRole('group', { name: 'Plain' }).className).toBe('');
});
it('shares the logic hook with styled and custom buttons without affecting an outside button', async () => {
  render(<><Toolbar aria-label="Commands"><Command value="save" /><Command value="copy" /></Toolbar><Button>Outside</Button></>);
  await userEvent.tab();
  await userEvent.keyboard('{ArrowRight}');
  expect(document.activeElement).toBe(screen.getByRole('button', { name: 'copy' }));
  await userEvent.tab();
  expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Outside' }));
});
