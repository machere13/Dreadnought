import { createRef } from 'react';
import { Toolbar, Button } from '@dreadnought/ui/react';
import { useToolbarItem } from '@dreadnought/react/logic';

function Command() {
  const { itemProps } = useToolbarItem<HTMLButtonElement>({ value: 'save' });
  return <Button {...itemProps} size="compact">Save</Button>;
}
<Toolbar ref={createRef<HTMLDivElement>()} orientation="vertical" loop={false} aria-label="Commands"><Command /></Toolbar>;
<Toolbar navigation="native"><input /></Toolbar>;
// @ts-expect-error No implicit discovery mode.
<Toolbar navigation="auto" />;
