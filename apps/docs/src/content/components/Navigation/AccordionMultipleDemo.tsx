import { useState } from 'react';
import { Accordion, Button } from '@dreadnought/ui/react';

export function AccordionMultipleDemo() {
  const [value, setValue] = useState<string[]>([]);
  return (
    <div style={{ display: 'grid', gap: 16 }}>
      <Accordion multiple value={value} onValueChange={setValue}>
        <Accordion.Item value="delivery">
          <Accordion.Trigger>Доставка</Accordion.Trigger>
          <Accordion.Panel>Курьер доставит заказ в течение двух рабочих дней.</Accordion.Panel>
        </Accordion.Item>
        <Accordion.Item value="payment">
          <Accordion.Trigger>Оплата</Accordion.Trigger>
          <Accordion.Panel>Заказ можно оплатить картой при оформлении.</Accordion.Panel>
        </Accordion.Item>
      </Accordion>
      <div>
        <Button
          size="compact"
          variant="secondary"
          onClick={() => setValue([])}
          disabled={value.length === 0}
        >
          Закрыть все разделы
        </Button>
      </div>
    </div>
  );
}
