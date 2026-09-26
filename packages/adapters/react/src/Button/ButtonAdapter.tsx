import type { Ref } from 'react';
import { ButtonActionAdapter } from './ButtonActionAdapter.tsx';
import type { ButtonActionAdapterProps } from './ButtonActionAdapter.tsx';
import { ButtonLinkAdapter } from './ButtonLinkAdapter.tsx';
import type { ButtonLinkAdapterProps } from './ButtonLinkAdapter.tsx';

export type ButtonAdapterProps =
  | (ButtonActionAdapterProps & { href?: undefined; ref?: Ref<HTMLButtonElement> })
  | (ButtonLinkAdapterProps & { ref?: Ref<HTMLAnchorElement> });

export function ButtonAdapter(props: ButtonAdapterProps) {
  if (typeof props.href === 'string') {
    return <ButtonLinkAdapter {...props} />;
  }

  const { href: _href, ...actionProps } = props;
  return <ButtonActionAdapter {...actionProps} />;
}
