import { startTransition, Suspense, useState } from 'react';
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import { useSelect } from '../../src/Fields/Select/useSelect.ts';
import { useModal } from '../../src/Overlays/Modal/useModal.ts';
import { useTooltip } from '../../src/Overlays/Tooltip/useTooltip.ts';
import { usePopover } from '../../src/Overlays/Popover/usePopover.ts';
import { useFloatingPanel } from '../../src/Overlays/FloatingPanel/useFloatingPanel.ts';

afterEach(cleanup);

const cases = (['Select', 'Modal', 'Tooltip', 'Popover', 'FloatingPanel'] as const).flatMap(
  (kind) => [
    { kind, future: {}, scenario: 'callback' },
    { kind, future: { disabled: true }, scenario: 'disabled' },
    { kind, future: { open: true }, scenario: 'controlled open' },
  ],
);

it.each(cases)(
  '$kind ignores speculative $scenario while a transition is suspended',
  async ({ kind, future }) => {
    const accepted = vi.fn();
    const speculative = vi.fn();
    const pending = new Promise<void>(() => {});
    let attempted = false;

    function Subject({ proposed }: { proposed: boolean }) {
      const onOpenChange = proposed ? speculative : accepted;
      const options = { onOpenChange, ...(proposed ? future : {}) };
      const select = useSelect({ options: [], ...options });
      const modal = useModal(options);
      const tooltip = useTooltip({ ...options, openDelay: 0 });
      const popover = usePopover(options);
      const panel = useFloatingPanel(options);
      if (proposed) {
        attempted = true;
        throw pending;
      }
      if (kind === 'Select') {
        return <button onClick={() => select.setExpanded(true)}>Target</button>;
      }
      if (kind === 'Modal') {
        return <button {...modal.triggerProps}>Target</button>;
      }
      if (kind === 'Popover') {
        return <button {...popover.triggerProps}>Target</button>;
      }
      if (kind === 'FloatingPanel') {
        return <button {...panel.triggerProps}>Target</button>;
      }
      return <button {...tooltip.triggerProps}>Target</button>;
    }

    function Page() {
      const [proposed, setProposed] = useState(false);
      return (
        <>
          <button onClick={() => startTransition(() => setProposed(true))}>Prepare</button>
          <Suspense fallback={<span>Pending</span>}>
            <Subject proposed={proposed} />
          </Suspense>
        </>
      );
    }

    render(<Page />);
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Prepare' }));
    });
    expect(attempted).toBe(true);
    expect(screen.queryByText('Pending')).toBeNull();
    const target = screen.getByRole('button', { name: 'Target' });
    if (kind === 'Tooltip') fireEvent.focus(target);
    else fireEvent.click(target);
    expect(accepted.mock.calls).toEqual([[true]]);
    expect(speculative).not.toHaveBeenCalled();
  },
);
