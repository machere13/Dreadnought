import { inputPresentation } from '#presentation/Fields/Input/inputPresentation.ts';
import type { ComponentPropsWithRef } from 'react';
import { InputAdapter } from '@dreadnought/react/unstyled';
import { Icon } from '../../DataDisplay/Icon/Icon.tsx';
import { Button } from '../../Controls/Button/Button.tsx';

export type InputProps = ComponentPropsWithRef<typeof InputAdapter>;

export function Input({ className, ...props }: InputProps) {
  const classes = [inputPresentation.root, className].filter(Boolean).join(' ');
  return <InputAdapter {...props} passwordVisibilityContent={props.passwordVisibilityContent ?? {
    show: <Icon name="eye" />,
    hide: <Icon name="eye-off" />,
  }} renderStepButton={props.renderStepButton ?? (buttonProps => <Button {...buttonProps} variant="ghosted" size="compact"><Icon name="down" data-step-arrow="" /></Button>)} className={classes} />;
}
