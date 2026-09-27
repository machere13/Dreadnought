import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import postcss from 'postcss';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { Button } from '@dreadnought/ui/react';

afterEach(cleanup);

describe('Button', () => {
  it('includes padding in the same minimum height for buttons and links', () => {
    const css = postcss.parse(readFileSync(resolve('packages/ui/src/presentation/Controls/Button/Button.module.css'), 'utf8'));
    const layer = css.nodes.find((node) => node.type === 'atrule');
    const button = layer?.nodes?.find((node) => node.type === 'rule' && node.selector === '.button');
    expect(button?.nodes?.some((node) => node.type === 'decl' && node.prop === 'box-sizing' && node.value === 'border-box')).toBe(true);
  });
  it('supports outlined and ghosted on buttons and links', () => {
    render(<><Button variant="outlined">Edit</Button><Button href="/docs" variant="ghosted">Docs</Button></>);
    const action = screen.getByRole('button', { name: 'Edit' });
    expect(action.getAttribute('data-variant')).toBe('outlined');
    expect(action.getAttribute('type')).toBe('button');
    expect(action.classList.length).toBe(3);
    const link = screen.getByRole('link', { name: 'Docs' });
    expect(link.getAttribute('data-variant')).toBe('ghosted');
    expect(link.classList.length).toBe(3);
  });
  it('uses the primary theme variant by default', () => {
    render(<Button>Continue</Button>);
    expect(screen.getByRole('button', { name: 'Continue' }).getAttribute('data-variant')).toBe('primary');
    expect(screen.getByRole('button', { name: 'Continue' }).getAttribute('data-size')).toBe('default');
  });

  it('gives compact actions and links a separate size without changing their variant', () => {
    render(<>
      <Button size="compact" variant="ghosted">Toolbar action</Button>
      <Button size="compact" variant="secondary" href="/docs">Toolbar link</Button>
    </>);
    const action = screen.getByRole('button', { name: 'Toolbar action' });
    const link = screen.getByRole('link', { name: 'Toolbar link' });
    expect(action.getAttribute('data-size')).toBe('compact');
    expect(link.getAttribute('data-size')).toBe('compact');
    expect(action.getAttribute('data-variant')).toBe('ghosted');
    expect(link.getAttribute('data-variant')).toBe('secondary');
    expect(action.className).toContain('compact');
    expect(link.className).toContain('compact');
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
