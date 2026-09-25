import { forwardRef } from 'react';
import type { Ref } from 'react';
import { ButtonActionAdapter } from './ButtonActionAdapter.js';
import type { ButtonActionAdapterProps } from './ButtonActionAdapter.js';
import { ButtonLinkAdapter } from './ButtonLinkAdapter.js';
import type { ButtonLinkAdapterProps } from './ButtonLinkAdapter.js';

export type ButtonAdapterProps =
  | (ButtonActionAdapterProps & { href?: undefined })
  | ButtonLinkAdapterProps;

export const ButtonAdapter = forwardRef<HTMLButtonElement | HTMLAnchorElement, ButtonAdapterProps>(
  function ButtonAdapter(props, ref) {
    if (typeof props.href === 'string') {
      return <ButtonLinkAdapter {...props} ref={ref as Ref<HTMLAnchorElement>} />;
    }

    const { href: _href, ...actionProps } = props;
    return <ButtonActionAdapter {...actionProps} ref={ref as Ref<HTMLButtonElement>} />;
  },
);
