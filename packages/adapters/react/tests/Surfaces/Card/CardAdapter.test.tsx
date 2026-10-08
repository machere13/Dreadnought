import { createRef } from 'react';
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { CardAdapter } from '../../../src/Surfaces/Card/CardAdapter.tsx';

afterEach(cleanup);

describe('CardAdapter', () => {
  it('keeps arbitrary content and forwards native div properties without library styling', () => {
    const root = createRef<HTMLDivElement>();
    render(
      <CardAdapter ref={root} className="custom" aria-label="Возможность" data-test-id="card">
        <strong>Три слоя</strong>
        <span>Готовое оформление или своя реализация</span>
      </CardAdapter>,
    );

    expect(root.current?.tagName).toBe('DIV');
    expect(root.current?.className).toBe('custom');
    expect(root.current?.getAttribute('data-test-id')).toBe('card');
    expect(screen.getByText('Три слоя').closest('[aria-label="Возможность"]')).toBe(root.current);
    expect(screen.getByText('Готовое оформление или своя реализация')).not.toBeNull();
  });
});
