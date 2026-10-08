import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, expect, it } from 'vitest';
import { IconAdapter } from '../../../src/DataDisplay/Icon/IconAdapter.tsx';

afterEach(cleanup);

it('hides decorative graphics and names meaningful icons', () => {
  const { container } = render(
    <>
      <IconAdapter>
        <svg />
      </IconAdapter>
      <IconAdapter aria-label="Search">
        <svg />
      </IconAdapter>
    </>,
  );
  expect(container.querySelector('[data-ui="icon"][aria-hidden="true"]')).not.toBeNull();
  expect(screen.getByRole('img', { name: 'Search' }).querySelector('svg')).not.toBeNull();
});
