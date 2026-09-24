import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { Button } from '../../src/Button/Button.js';

afterEach(cleanup);

describe('Button', () => {
  it('uses the primary theme variant by default', () => {
    render(<Button>Continue</Button>);
    expect(screen.getByRole('button', { name: 'Continue' }).getAttribute('data-variant')).toBe('primary');
  });

  it('applies its visual variant without changing button behavior', () => {
    const onClick = vi.fn();
    render(<Button variant="secondary" onClick={onClick}>Continue</Button>);

    const button = screen.getByRole('button', { name: 'Continue' });
    expect(button.getAttribute('data-ui')).toBe('button');
    expect(button.getAttribute('data-variant')).toBe('secondary');
    expect(button.getAttribute('type')).toBe('button');
    fireEvent.click(button);
    expect(onClick).toHaveBeenCalledOnce();
  });
});
