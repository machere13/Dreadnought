import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { TabsAdapter } from '@dreadnought/react/unstyled';
import { Tabs } from '@dreadnought/ui/react';

afterEach(cleanup);

describe('Tabs', () => {
  it('styles every ready part without styling an adapter on the same page', () => {
    render(
      <>
        <Tabs defaultValue="a" className="own-root">
          <Tabs.List aria-label="Ready" className="own-list">
            <Tabs.Tab value="a" className="own-tab">
              A
            </Tabs.Tab>
          </Tabs.List>
          <Tabs.Panel value="a" className="own-panel">
            Ready panel
          </Tabs.Panel>
        </Tabs>
        <TabsAdapter defaultValue="b">
          <TabsAdapter.List aria-label="Plain">
            <TabsAdapter.Tab value="b">B</TabsAdapter.Tab>
          </TabsAdapter.List>
          <TabsAdapter.Panel value="b">Plain panel</TabsAdapter.Panel>
        </TabsAdapter>
      </>,
    );

    const ready = screen.getByRole('tab', { name: 'A' });
    const plain = screen.getByRole('tab', { name: 'B' });
    expect(ready.className).toContain('own-tab');
    expect(ready.className).not.toBe('own-tab');
    expect(plain.className).toBe('');
    expect(screen.getByRole('tablist', { name: 'Ready' }).className).toContain('own-list');
    expect(screen.getByRole('tabpanel', { name: 'A' }).className).toContain('own-panel');
    expect(screen.getByRole('tabpanel', { name: 'A' }).className).toContain(
      'dreadnought-text-tabs-panel',
    );
    expect(screen.getByRole('tab', { name: 'A' }).closest('[data-ui="tabs"]')?.className).toContain(
      'own-root',
    );
    expect(screen.getByRole('tab', { name: 'B' }).closest('[data-ui="tabs"]')?.className).toBe('');
  });
});
