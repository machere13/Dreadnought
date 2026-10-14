import { Accordion, Input } from '@dreadnought/ui/react';

export function AccordionLifecycleDemo() {
  return (
    <Accordion>
      {(['eager', 'lazy', 'unmount'] as const).map((policy) => (
        <Accordion.Item key={policy} value={policy}>
          <Accordion.Trigger>{policy}</Accordion.Trigger>
          <Accordion.Panel mountPolicy={policy}>
            <Input aria-label={`Текст ${policy}`} placeholder="Введите черновик" />
          </Accordion.Panel>
        </Accordion.Item>
      ))}
    </Accordion>
  );
}
