import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { CardAdapter } from '@dreadnought/react/unstyled';
import { Card } from '@dreadnought/ui/react';

afterEach(cleanup);

describe('Card', () => {
  it('defaults to an outlined card and exposes compact borderless presentation without native prop leakage', () => {
    const { rerender } = render(<Card aria-label="Проект" title="Шапка">Содержимое</Card>);
    const root = screen.getByLabelText('Проект');
    expect(root.getAttribute('data-variant')).toBe('outlined');
    expect(root.getAttribute('data-size')).toBe('default');
    expect(screen.getByText('Шапка').closest('[data-slot="header"]')?.className).toBeTruthy();
    rerender(<Card aria-label="Проект" variant="borderless" size="compact">Содержимое</Card>);
    expect(root.getAttribute('data-variant')).toBe('borderless');
    expect(root.getAttribute('data-size')).toBe('compact');
    expect(root.getAttribute('size')).toBeNull();
    expect(root.getAttribute('variant')).toBeNull();
  });

  it('styles only the ready card while preserving its consumer class', () => {
    render(
      <>
        <Card className="consumer-card">Готовая карточка</Card>
        <CardAdapter>Карточка без оформления</CardAdapter>
      </>,
    );

    const styled = screen.getByText('Готовая карточка');
    const plain = screen.getByText('Карточка без оформления');
    expect(styled.className).toContain('consumer-card');
    expect(styled.className).not.toBe('consumer-card');
    expect(plain.className).toBe('');
  });
});
