import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { CardAdapter } from '@dreadnought/react/unstyled';
import { Card } from '@dreadnought/ui/react';

afterEach(cleanup);

describe('Card', () => {
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
