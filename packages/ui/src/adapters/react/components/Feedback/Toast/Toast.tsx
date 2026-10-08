import {
  ToastAdapter,
  ToastViewportAdapter,
  type ToastAdapterProps,
  type ToastViewportAdapterProps,
  type ToastType,
} from '@dreadnought/react/unstyled';
import { toastPresentation } from '#presentation/Feedback/Toast/toastPresentation.ts';
import { Icon } from '../../DataDisplay/Icon/Icon.tsx';

const icons: Record<ToastType, 'info-circle' | 'check-circle' | 'warning' | 'close-circle'> = {
  info: 'info-circle',
  success: 'check-circle',
  warning: 'warning',
  error: 'close-circle',
};
export type ToastProps = ToastAdapterProps;
export type ToastViewportProps = ToastViewportAdapterProps;

export function Toast({
  type = 'info',
  icon,
  closeIcon,
  slotClassNames,
  className,
  ...props
}: ToastProps) {
  const slots = {
    icon: [toastPresentation.icon, slotClassNames?.icon].filter(Boolean).join(' '),
    content: [toastPresentation.content, slotClassNames?.content].filter(Boolean).join(' '),
    title: [toastPresentation.title, slotClassNames?.title].filter(Boolean).join(' '),
    description: [toastPresentation.description, slotClassNames?.description]
      .filter(Boolean)
      .join(' '),
    action: [toastPresentation.action, slotClassNames?.action].filter(Boolean).join(' '),
    close: [toastPresentation.close, slotClassNames?.close].filter(Boolean).join(' '),
  };
  return (
    <ToastAdapter
      {...props}
      type={type}
      icon={icon === undefined ? <Icon name={icons[type]} /> : icon}
      closeIcon={closeIcon ?? <Icon name="close" />}
      slotClassNames={slots}
      className={[toastPresentation.root, className].filter(Boolean).join(' ')}
    />
  );
}

export function ToastViewport({ className, ...props }: ToastViewportProps) {
  return (
    <ToastViewportAdapter
      {...props}
      className={[toastPresentation.viewport, className].filter(Boolean).join(' ')}
    />
  );
}
