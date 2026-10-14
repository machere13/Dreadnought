import { useId, useState } from 'react';
import { Button, Icon } from '@dreadnought/ui/react';

export function IconAccessibilityDemo() {
  const [expanded, setExpanded] = useState(false);
  const detailsId = useId();
  return (
    <div style={{ display: 'grid', gap: 16, justifyItems: 'start' }}>
      <span style={{ display: 'inline-flex', gap: 8, alignItems: 'center' }}>
        <Icon name="check" />
        Готово — иконка декоративная
      </span>
      <span style={{ display: 'inline-flex', gap: 8, alignItems: 'center' }}>
        Самостоятельная смысловая иконка: <Icon name="check" aria-label="Успешно" />
      </span>
      <Button
        icon={<Icon name={expanded ? 'eye-off' : 'eye'} />}
        aria-label={expanded ? 'Скрыть подробности' : 'Показать подробности'}
        aria-expanded={expanded}
        aria-controls={detailsId}
        onClick={() => setExpanded((value) => !value)}
      />
      <p id={detailsId} hidden={!expanded}>
        Подробности доступны по нажатию на кнопку, а не на саму иконку.
      </p>
    </div>
  );
}
