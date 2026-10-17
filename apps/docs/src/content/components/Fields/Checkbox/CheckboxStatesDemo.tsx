import { Checkbox } from '@dreadnought/ui/react';

export function CheckboxStatesDemo() {
  return (
    <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
      <Checkbox disabled>Недоступный пункт</Checkbox>
      <Checkbox disabled defaultChecked>
        Выбранный недоступный пункт
      </Checkbox>
    </div>
  );
}
