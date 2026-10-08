import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, expect, it } from 'vitest';
import { Slider } from '../../../../../../src/adapters/react/components/Fields/Slider/Slider.tsx';

afterEach(cleanup);

it('places a vertical Tooltip to the right by default and permits an explicit override', async () => {
  const { rerender } = render(
    <Slider orientation="vertical" tooltip={{ openDelay: 0, closeDelay: 0 }} />,
  );
  fireEvent.focus(screen.getByRole('slider'));
  const tooltip = await screen.findByRole('tooltip');
  expect(tooltip.getAttribute('data-placement')).toBe('right');
  rerender(
    <Slider orientation="vertical" tooltip={{ placement: 'left', openDelay: 0, closeDelay: 0 }} />,
  );
  await waitFor(() =>
    expect(screen.getByRole('tooltip').getAttribute('data-placement')).toBe('left'),
  );
});

it('shows the accepted value in the shared Tooltip on keyboard focus', async () => {
  const user = userEvent.setup();
  render(
    <Slider aria-label="Volume" defaultValue={25} tooltip={{ openDelay: 0, closeDelay: 0 }} />,
  );
  await user.tab();
  expect((await screen.findByRole('tooltip')).textContent).toBe('25');
  await user.keyboard('{ArrowRight}');
  await waitFor(() => expect(screen.getByRole('tooltip').textContent).toBe('26'));
});

it('omits Tooltip when disabled by the consumer', async () => {
  render(<Slider aria-label="Volume" tooltip={false} />);
  await userEvent.tab();
  expect(screen.queryByRole('tooltip')).toBeNull();
});

it('keeps Tooltip, form and thumb unchanged when a controlled parent refuses', async () => {
  render(
    <form>
      <Slider
        value={25}
        name="volume"
        tooltip={{ formatter: (value) => `${value}%`, openDelay: 0 }}
      />
    </form>,
  );
  await userEvent.tab();
  fireEvent.keyDown(screen.getByRole('slider'), { key: 'ArrowRight' });
  expect((await screen.findByRole('tooltip')).textContent).toBe('25%');
  expect(new FormData(document.querySelector('form')!).get('volume')).toBe('25');
  expect(screen.getByRole('slider').getAttribute('aria-valuenow')).toBe('25');
});

it('preserves custom rendering, descriptions, cancellation and ref cleanup across value changes', async () => {
  const attached: (HTMLDivElement | null)[] = [];
  let cleaned = 0;
  const ref = (node: HTMLDivElement | null) => {
    attached.push(node);
    return () => {
      cleaned++;
    };
  };
  const renderer = (props: React.ComponentPropsWithRef<'div'>) => (
    <div {...props} data-custom="yes" />
  );
  const { rerender, unmount } = render(
    <Slider
      ref={ref}
      value={2}
      aria-describedby="help"
      renderThumb={renderer}
      onKeyDown={(event) => event.preventDefault()}
      tooltip={{ openDelay: 0 }}
    />,
  );
  const thumb = screen.getByRole('slider');
  await userEvent.tab();
  expect(thumb.getAttribute('aria-describedby')?.split(' ')).toContain('help');
  fireEvent.keyDown(thumb, { key: 'ArrowRight' });
  expect(thumb.getAttribute('aria-valuenow')).toBe('2');
  rerender(
    <Slider
      ref={ref}
      value={3}
      aria-describedby="help"
      renderThumb={renderer}
      tooltip={{ openDelay: 0 }}
    />,
  );
  expect((await screen.findByRole('tooltip')).textContent).toBe('3');
  expect(attached).toEqual([thumb]);
  expect(thumb.getAttribute('data-custom')).toBe('yes');
  unmount();
  expect(cleaned).toBe(1);
});

it('forwards placement and adjustable hover delays to Tooltip', async () => {
  const { rerender } = render(
    <Slider tooltip={{ placement: 'bottom', openDelay: 10000, closeDelay: 0 }} />,
  );
  const thumb = screen.getByRole('slider');
  fireEvent.pointerEnter(thumb);
  expect(screen.queryByRole('tooltip')).toBeNull();
  fireEvent.pointerLeave(thumb);
  rerender(<Slider tooltip={{ placement: 'bottom', openDelay: 0, closeDelay: 0 }} />);
  fireEvent.pointerEnter(thumb);
  expect((await screen.findByRole('tooltip')).getAttribute('data-placement')).toBe('bottom');
  fireEvent.pointerLeave(thumb);
  await waitFor(() => expect(screen.queryByRole('tooltip')).toBeNull());
});

it('suppresses Tooltip when disabled, including an ancestor fieldset', async () => {
  const { rerender } = render(<Slider disabled tooltip={{ openDelay: 0 }} />);
  fireEvent.pointerEnter(screen.getByRole('slider'));
  expect(screen.queryByRole('tooltip')).toBeNull();
  rerender(
    <fieldset disabled>
      <Slider tooltip={{ openDelay: 0 }} />
    </fieldset>,
  );
  fireEvent.pointerEnter(screen.getByRole('slider'));
  expect(screen.queryByRole('tooltip')).toBeNull();
});

it('shows each range endpoint in its own shared Tooltip as keyboard focus moves', async () => {
  const user = userEvent.setup();
  render(
    <Slider
      range
      defaultValue={[20, 80]}
      tooltip={{ formatter: (value) => `${value}%`, openDelay: 0, closeDelay: 0 }}
    />,
  );
  await user.tab();
  expect((await screen.findByRole('tooltip')).textContent).toBe('20%');
  await user.keyboard('{ArrowRight}');
  await waitFor(() => expect(screen.getByRole('tooltip').textContent).toBe('21%'));
  await user.tab();
  await waitFor(() =>
    expect(screen.getAllByRole('tooltip').map((node) => node.textContent)).toEqual(['80%']),
  );
  await user.keyboard('{ArrowLeft}');
  await waitFor(() => expect(screen.getByRole('tooltip').textContent).toBe('79%'));
});
