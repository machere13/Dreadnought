import type { FormEvent } from 'react';
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, expect, it, vi } from 'vitest';
import { useButton } from '../../../src/Controls/Button/useButton.ts';

afterEach(cleanup);

it('supports custom markup with native keyboard behavior and no implicit submit', async () => {
  const user = userEvent.setup();
  const click = vi.fn();
  const submit = vi.fn((event: FormEvent<HTMLFormElement>) => event.preventDefault());

  function CustomButton() {
    const { buttonProps } = useButton({ onClick: click });
    return <button {...buttonProps}>Custom</button>;
  }

  render(<form onSubmit={submit}><CustomButton /></form>);
  screen.getByRole('button', { name: 'Custom' }).focus();
  await user.keyboard('{Enter} ');

  expect(click).toHaveBeenCalledTimes(2);
  expect(submit).not.toHaveBeenCalled();
});
