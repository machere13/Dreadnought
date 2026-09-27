import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { AccordionAdapter } from '@dreadnought/react/unstyled';
import { Accordion } from '@dreadnought/ui/react';

afterEach(cleanup);

describe('Accordion', () => {
  it('styles only ready parts and preserves each consumer class', () => {
    render(<>
      <Accordion className="own-root"><Accordion.Item value="a" className="own-item">
        <Accordion.Trigger className="own-trigger">Ready</Accordion.Trigger>
        <Accordion.Panel className="own-panel">Ready answer</Accordion.Panel>
      </Accordion.Item></Accordion>
      <AccordionAdapter><AccordionAdapter.Item value="b">
        <AccordionAdapter.Trigger>Plain</AccordionAdapter.Trigger>
        <AccordionAdapter.Panel>Plain answer</AccordionAdapter.Panel>
      </AccordionAdapter.Item></AccordionAdapter>
    </>);

    const readyTrigger = screen.getByRole('button', { name: 'Ready' });
    const plainTrigger = screen.getByRole('button', { name: 'Plain' });
    expect(readyTrigger.className).toContain('own-trigger');
    expect(readyTrigger.className).not.toBe('own-trigger');
    expect(plainTrigger.className).toBe('');
    const item = readyTrigger.parentElement?.parentElement;
    expect(item?.className).toContain('own-item');
    expect(item?.className).not.toBe('own-item');
    expect(item?.parentElement?.className).toContain('own-root');
    expect(screen.getByText('Ready answer').className).toContain('own-panel');
    expect(screen.getByText('Ready answer').className).not.toBe('own-panel');
    expect(screen.getByText('Plain answer').className).toBe('');
    expect(readyTrigger.textContent).toBe('Ready');
    expect(readyTrigger.querySelector('[aria-hidden="true"]')).not.toBeNull();
    expect(plainTrigger.querySelector('[aria-hidden="true"]')).toBeNull();
  });
});
