import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { AlertAdapter } from '@dreadnought/react/unstyled';
import { Alert } from '@dreadnought/ui/react';

afterEach(cleanup);

describe('Alert', () => {
  it('styles the ready component but not the adapter', () => {
    render(
      <>
        <Alert
          type="success"
          variant="filled"
          title="Saved"
          showIcon
          className="own-alert"
          aria-label="Saved"
        />
        <AlertAdapter title="Plain" aria-label="Plain" />
      </>,
    );
    const ready = screen.getByRole('status', { name: 'Saved' });
    expect(ready.className).toContain('own-alert');
    expect(ready.className).not.toBe('own-alert');
    expect(ready.getAttribute('data-variant')).toBe('filled');
    expect(ready.querySelector('[data-slot="icon"] svg')).not.toBeNull();
    expect(screen.getByRole('status', { name: 'Plain' }).className).toBe('');
  });

  it.each(['info', 'success', 'warning', 'error'] as const)(
    'provides a default %s icon',
    (type) => {
      render(<Alert title={type} type={type} showIcon />);
      expect(
        screen.getByText(type).parentElement?.querySelector('[data-slot="icon"] svg'),
      ).not.toBeNull();
    },
  );

  it('accepts a custom icon and hides icons when showIcon is false', () => {
    render(
      <>
        <Alert title="Custom" showIcon icon={<b data-testid="custom-icon" />} />
        <Alert title="Hidden" showIcon={false} icon={<b />} />
      </>,
    );
    expect(screen.getByTestId('custom-icon')).not.toBeNull();
    expect(
      screen.getByText('Hidden').parentElement?.querySelector('[data-slot="icon"]'),
    ).toBeNull();
  });

  it('provides a styled close icon without losing custom close settings', () => {
    render(<Alert title="Closable" closable={{ 'aria-label': 'Dismiss' }} />);
    expect(screen.getByRole('button', { name: 'Dismiss' }).querySelector('svg')).not.toBeNull();
  });
});
