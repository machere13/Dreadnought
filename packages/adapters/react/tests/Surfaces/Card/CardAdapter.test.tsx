import { createRef } from 'react';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { CardAdapter } from '../../../src/Surfaces/Card/CardAdapter.tsx';

afterEach(cleanup);

describe('CardAdapter', () => {
  it('renders a header and extra action without leaking the title into a native tooltip', () => {
    const onClick = vi.fn();
    render(<CardAdapter title={<h3>Проект</h3>}
      extra={<button onClick={onClick}>Открыть</button>}
      slotClassNames={{ header: 'custom-header', body: 'custom-body' }}>
      <p>Описание</p>
    </CardAdapter>);
    const heading = screen.getByRole('heading', { name: 'Проект' });
    expect(heading.closest('[data-slot="header"]')?.className).toBe('custom-header');
    expect(heading.closest('[data-ui="card"]')?.getAttribute('title')).toBeNull();
    expect(screen.getByText('Описание').parentElement?.className).toBe('custom-body');
    fireEvent.click(screen.getByRole('button', { name: 'Открыть' }));
    expect(onClick).toHaveBeenCalledOnce();
  });

  it('renders zero as a title and supports an extra-only header', () => {
    const { rerender } = render(<CardAdapter title={0}>Тело</CardAdapter>);
    expect(screen.getByText('0').getAttribute('data-slot')).toBe('title');
    rerender(<CardAdapter extra={<button>Действие</button>}>Тело</CardAdapter>);
    expect(screen.getByRole('button').closest('[data-slot="header"]')).toBeTruthy();
    rerender(<CardAdapter title={false} extra={null}>Тело</CardAdapter>);
    expect(document.querySelector('[data-slot="header"]')).toBeNull();
    expect(screen.getByText('Тело').children.length).toBe(0);
  });

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
