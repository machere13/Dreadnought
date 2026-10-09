import { TabsAdapter } from '@dreadnought/react/unstyled';

<TabsAdapter.Panel value="a" mountPolicy="lazy">
  Lazy
</TabsAdapter.Panel>;
<TabsAdapter.Panel value="a" mountPolicy="unmount">
  Reset
</TabsAdapter.Panel>;
// @ts-expect-error Only the three supported mount policies are accepted.
<TabsAdapter.Panel value="a" mountPolicy="destroy">
  Invalid
</TabsAdapter.Panel>;

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
