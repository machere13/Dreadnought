import type { Ref } from 'react';
import { ButtonActionAdapter } from './ButtonActionAdapter.js';
import type { ButtonActionAdapterProps } from './ButtonActionAdapter.js';
import { ButtonLinkAdapter } from './ButtonLinkAdapter.js';
import type { ButtonLinkAdapterProps } from './ButtonLinkAdapter.js';

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
