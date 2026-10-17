import { Button, Icon } from '@dreadnought/ui/react';

export function ButtonLinkDemo() {
  return (
    <div>
      <Button href="#button-link-target" variant="outlined" icon={<Icon name="link" />}>
        Перейти к цели ссылки
      </Button>
      <p id="button-link-target">Цель ссылки. В адресе страницы появится #button-link-target.</p>
    </div>
  );
}
