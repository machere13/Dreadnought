import { SwitchAdapter } from '@dreadnought/react/unstyled';
import type { SwitchAdapterProps } from '@dreadnought/react/unstyled';
import { switchPresentation } from '#presentation/Fields/Switch/switchPresentation.ts';

export type SwitchProps = SwitchAdapterProps;
export function Switch({ className, ...props }: SwitchProps) {
  return <SwitchAdapter {...props} className={[switchPresentation.root, className].filter(Boolean).join(' ')} />;
}
