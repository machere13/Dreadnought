import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { DocsPage } from '../src/components/DocsPage';

afterEach(cleanup);

describe('documentation pages', () => {
  it('offers a real route from the overview to Button', () => {
    render(<DocsPage section="overview" />);

    expect(screen.getByRole('heading', { name: 'Начните с готового компонента' })).toBeTruthy();
    expect(screen.getByRole('link', { name: 'Посмотреть Button' }).getAttribute('href')).toBe('/components/button/');
  });

  it('renders Button API and updates the live example', () => {
    render(<DocsPage section="button" />);

    expect(screen.getByRole('heading', { name: 'Button', level: 1 })).toBeTruthy();
    expect(screen.getByText('Нажатий: 0')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Нажать' }));
    expect(screen.getByText('Нажатий: 1')).toBeTruthy();
    expect(screen.getByRole('rowheader', { name: 'loading' })).toBeTruthy();
  });
});
