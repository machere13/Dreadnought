import { CardAdapter } from '@dreadnought/react/unstyled';
import type { CardAdapterProps } from '@dreadnought/react/unstyled';
import { cardPresentation } from '#presentation/Surfaces/Card/cardPresentation.ts';

export type CardProps = CardAdapterProps & {
  variant?: 'outlined' | 'borderless';
  size?: 'default' | 'compact';
};

export function Card({
  className,
  slotClassNames,
  variant = 'outlined',
  size = 'default',
  ...props
}: CardProps) {
  const classes = [cardPresentation.root, className].filter(Boolean).join(' ');
  const slots = {
    header: [cardPresentation.header, slotClassNames?.header].filter(Boolean).join(' '),
    title: [cardPresentation.title, slotClassNames?.title].filter(Boolean).join(' '),
    extra: [cardPresentation.extra, slotClassNames?.extra].filter(Boolean).join(' '),
    body: [cardPresentation.body, slotClassNames?.body].filter(Boolean).join(' '),
  };
  return (
    <CardAdapter
      {...props}
      className={classes}
      slotClassNames={slots}
      data-variant={variant}
      data-size={size}
    />
  );
}
