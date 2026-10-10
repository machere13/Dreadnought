import { createRef } from 'react';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { CardAdapter } from '../../../src/Surfaces/Card/CardAdapter.tsx';

afterEach(cleanup);

describe('CardAdapter', () => {
  it('renders cover, header, body, footer and interactive actions in order', () => {
    const action = vi.fn();
    const root = createRef<HTMLDivElement>();
    render(
      <CardAdapter
        ref={root}
        title="Проект"
        cover={<img src="/cover.png" alt="Обложка проекта" />}
        footer="Обновлено сегодня"
        actions={[
          <button key="open" onClick={action}>
            Открыть
          </button>,
        ]}
        slotClassNames={{ cover: 'cover', footer: 'footer', actions: 'actions', action: 'action' }}
      >
        <p>Описание</p>
      </CardAdapter>,
    );
    expect([...root.current!.children].map((element) => element.getAttribute('data-slot'))).toEqual(
      ['cover', 'header', 'body', 'footer', 'actions'],
    );
    expect(screen.getByRole('img').parentElement?.className).toBe('cover');
    expect(screen.getByText('Обновлено сегодня').className).toBe('footer');
    expect(screen.getByRole('list').className).toBe('actions');
    expect(screen.getByRole('listitem').className).toBe('action');
    expect(root.current!.hasAttribute('cover')).toBe(false);
    expect(root.current!.hasAttribute('footer')).toBe(false);
    expect(root.current!.hasAttribute('actions')).toBe(false);
    fireEvent.click(screen.getByRole('button', { name: 'Открыть' }));
    expect(action).toHaveBeenCalledOnce();
  });

  it('creates a body for a footer-only card and renders numeric zero', () => {
    render(
      <CardAdapter footer={0}>
        <p>Описание</p>
      </CardAdapter>,
    );
    expect(screen.getByText('Описание').parentElement?.getAttribute('data-slot')).toBe('body');
    expect(screen.getByText('0').getAttribute('data-slot')).toBe('footer');
    expect(document.querySelector('[data-slot="header"]')).toBeNull();
  });

  it('omits absent zones and empty actions without wrapping plain content', () => {
    const { container, rerender } = render(
      <CardAdapter cover={null} footer={false} actions={[]}>
        <p>Описание</p>
      </CardAdapter>,
    );
    expect(container.querySelector('[data-slot]')).toBeNull();
    expect(screen.getByText('Описание').parentElement?.getAttribute('data-ui')).toBe('card');
    rerender(
      <CardAdapter cover={false} footer={null} actions={[null, false, undefined]}>
        <p>Описание</p>
      </CardAdapter>,
    );
    expect(container.querySelector('[data-slot]')).toBeNull();
  });

  it('preserves keyed action elements and focus when actions are reordered', () => {
    const first = <button key="first">Первый</button>;
    const second = <button key="second">Второй</button>;
    const { rerender } = render(<CardAdapter actions={[first, second]}>Описание</CardAdapter>);
    const button = screen.getByRole('button', { name: 'Первый' });
    button.focus();
    rerender(<CardAdapter actions={[second, null, first]}>Описание</CardAdapter>);
    expect(screen.getAllByRole('button').map((element) => element.textContent)).toEqual([
      'Второй',
      'Первый',
    ]);
    expect(screen.getByRole('button', { name: 'Первый' })).toBe(button);
    expect(document.activeElement).toBe(button);
    expect(screen.getAllByRole('listitem')).toHaveLength(2);
  });

  it('renders a header and extra action without leaking the title into a native tooltip', () => {
    const onClick = vi.fn();
    render(
      <CardAdapter
        title={<h3>Проект</h3>}
        extra={<button onClick={onClick}>Открыть</button>}
        slotClassNames={{ header: 'custom-header', body: 'custom-body' }}
      >
        <p>Описание</p>
      </CardAdapter>,
    );
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
    rerender(
      <CardAdapter title={false} extra={null}>
        Тело
      </CardAdapter>,
    );
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
