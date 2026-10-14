import { Icon, Loader } from '@dreadnought/ui/react';

export function LoaderCustomDemo() {
  return <Loader indicator={<Icon name="clock" />} label="Ожидание ответа" showLabel />;
}
