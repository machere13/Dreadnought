import { ModalAdapter } from '@dreadnought/react/unstyled';
import type { ModalAdapterProps } from '@dreadnought/react/unstyled';
import { modalPresentation } from '#presentation/Overlays/Modal/modalPresentation.ts';

export type ModalProps = ModalAdapterProps;
export function Modal({ className, ...props }: ModalProps) {
  return (
    <ModalAdapter
      {...props}
      className={[modalPresentation.root, className].filter(Boolean).join(' ')}
    />
  );
}
