import { Input, Tabs } from '@dreadnought/ui/react';

const policies = ['eager', 'lazy', 'unmount'] as const;

export function TabsLifecycleDemo() {
  return (
    <Tabs defaultValue="eager">
      <Tabs.List aria-label="Режим содержимого">
        {policies.map((policy) => (
          <Tabs.Tab key={policy} value={policy}>
            {policy}
          </Tabs.Tab>
        ))}
      </Tabs.List>
      {policies.map((policy) => (
        <Tabs.Panel key={policy} value={policy} mountPolicy={policy}>
          <Input aria-label={`Текст ${policy}`} placeholder="Введите текст" />
        </Tabs.Panel>
      ))}
    </Tabs>
  );
}
