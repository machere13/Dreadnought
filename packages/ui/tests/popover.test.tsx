import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, expect, it } from 'vitest';
import * as ui from '../src/adapters/react/index.ts';

afterEach(cleanup);
it('styles the panel and arrow while retaining interactive behavior and consumer attributes', () => {
  expect(ui).toHaveProperty('Popover');
  render(<ui.Popover aria-label="Profile settings" className="custom-panel" data-testid="profile" content={({ close }) => <>
    <ui.Input aria-label="Name" /><ui.Button onClick={close}>Done</ui.Button>
  </>}>{trigger => <ui.Button {...trigger}>Profile</ui.Button>}</ui.Popover>);
  const trigger = screen.getByRole('button', { name: 'Profile' }); fireEvent.click(trigger);
  const dialog = screen.getByRole('dialog', { name: 'Profile settings' });
  expect(dialog.className).toContain('custom-panel'); expect(dialog.className.split(' ')).toHaveLength(2);
  expect(dialog.getAttribute('data-testid')).toBe('profile');
  expect(dialog.querySelector('[data-ui="popover-arrow"]')?.getAttribute('aria-hidden')).toBe('true');
  expect(document.activeElement).toBe(screen.getByRole('textbox'));
  fireEvent.click(screen.getByRole('button', { name: 'Done' }));
  expect(screen.queryByRole('dialog')).toBeNull(); expect(document.activeElement).toBe(trigger);
});
