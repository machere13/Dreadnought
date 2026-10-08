import { MarkAdapter } from '@dreadnought/react/unstyled';
import type { MarkAdapterProps } from '@dreadnought/react/unstyled';
import type { CSSProperties } from 'react';
import { markPresentation } from '#presentation/DataDisplay/Mark/markPresentation.ts';

export type MarkProps = MarkAdapterProps & { color?: string };

export function Mark({ color, className, style, ...props }: MarkProps) {
  const markStyle = color
    ? ({ ...style, '--dreadnought-mark-color': color } as CSSProperties)
    : style;
  return (
    <MarkAdapter
      {...props}
      className={[markPresentation.root, className].filter(Boolean).join(' ')}
      style={markStyle}
    />
  );
}
