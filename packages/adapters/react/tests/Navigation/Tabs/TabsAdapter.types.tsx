import { TabsAdapter } from '@dreadnought/react/unstyled';

<TabsAdapter defaultValue="a">
  <TabsAdapter.List aria-label="Sections">
    <TabsAdapter.Tab value="a">A</TabsAdapter.Tab>
  </TabsAdapter.List>
  <TabsAdapter.Panel value="a">Alpha</TabsAdapter.Panel>
</TabsAdapter>;
<TabsAdapter value="a">
  <TabsAdapter.List aria-label="Sections">
    <TabsAdapter.Tab value="a">A</TabsAdapter.Tab>
  </TabsAdapter.List>
  <TabsAdapter.Panel value="a">Alpha</TabsAdapter.Panel>
</TabsAdapter>;

// @ts-expect-error Controlled and uncontrolled selection cannot be combined.
<TabsAdapter value="a" defaultValue="a" />;

// @ts-expect-error A tab requires a value.
<TabsAdapter.Tab>Missing value</TabsAdapter.Tab>;
