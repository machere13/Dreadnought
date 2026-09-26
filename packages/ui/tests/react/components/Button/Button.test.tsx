import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { Button } from '@dreadnought/ui/react';

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

  it('passes icon placement through to the adapter', () => {
    render(<Button icon={<svg />} iconPosition="end">Search</Button>);

    const button = screen.getByRole('button', { name: 'Search' });
    expect(button.children[0]?.getAttribute('data-slot')).toBe('label');
    expect(button.children[1]?.getAttribute('data-slot')).toBe('icon');
  });

  it('renders a styled native link when href is provided', () => {
    render(<Button href="/docs" variant="secondary">Docs</Button>);

    const link = screen.getByRole('link', { name: 'Docs' });
    expect(link.tagName).toBe('A');
    expect(link.getAttribute('href')).toBe('/docs');
    expect(link.getAttribute('data-variant')).toBe('secondary');
  });

  it('composes library and consumer classes on a button', () => {
    render(<Button className="custom" variant="secondary">Save</Button>);

    const button = screen.getByRole('button', { name: 'Save' });
    expect(button.classList.contains('custom')).toBe(true);
    expect(button.classList.contains('dreadnought-text-button')).toBe(true);
    expect(button.classList.length).toBe(4);
  });

  it('composes library and consumer classes on a link', () => {
    render(<Button href="/docs" className="custom" variant="secondary">Docs</Button>);

    const link = screen.getByRole('link', { name: 'Docs' });
    expect(link.classList.contains('custom')).toBe(true);
    expect(link.classList.contains('dreadnought-text-button')).toBe(true);
    expect(link.classList.length).toBe(4);
  });

  it('keeps loading action blocked and focusable while styled', () => {
    const onClick = vi.fn();
    render(<Button loading onClick={onClick}>Save</Button>);

    const button = screen.getByRole('button', { name: 'Save' });
    expect(button.getAttribute('aria-busy')).toBe('true');
    expect(button.getAttribute('aria-disabled')).toBe('true');
    expect(button.hasAttribute('disabled')).toBe(false);
    fireEvent.click(button);
    expect(onClick).not.toHaveBeenCalled();
  });
});
