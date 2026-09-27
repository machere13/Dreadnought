import { AlertAdapter } from '@dreadnought/react/unstyled';
import type { AlertAdapterProps, AlertType } from '@dreadnought/react/unstyled';
import { alertPresentation } from '#presentation/Feedback/Alert/alertPresentation.ts';
import { Icon } from '../../DataDisplay/Icon/Icon.tsx';

const statusIcons: Record<AlertType, 'info-circle' | 'check-circle' | 'warning' | 'close-circle'> = {
  info: 'info-circle',
  success: 'check-circle',
  warning: 'warning',
  error: 'close-circle',
};

export type AlertProps = AlertAdapterProps & { variant?: 'outlined' | 'filled' };

export function Alert({
  type = 'info', variant = 'outlined', showIcon = false, icon, closable,
  slotClassNames, className, ...props
}: AlertProps) {
  const graphic = showIcon ? (icon ?? <Icon name={statusIcons[type]} />) : undefined;
  const styledClosable = closable === true
    ? { closeIcon: <Icon name="close" /> }
    : closable && typeof closable === 'object'
      ? { ...closable, closeIcon: closable.closeIcon ?? <Icon name="close" /> }
      : false;
  const slots = {
    icon: [alertPresentation.icon, slotClassNames?.icon].filter(Boolean).join(' '),
    title: [alertPresentation.title, slotClassNames?.title].filter(Boolean).join(' '),
    description: [alertPresentation.description, slotClassNames?.description].filter(Boolean).join(' '),
    actions: [alertPresentation.actions, slotClassNames?.actions].filter(Boolean).join(' '),
    close: [alertPresentation.close, slotClassNames?.close].filter(Boolean).join(' '),
  };
  return <AlertAdapter {...props} type={type} showIcon={showIcon} icon={graphic} closable={styledClosable}
    data-variant={variant} slotClassNames={slots}
    className={[alertPresentation.root, className].filter(Boolean).join(' ')} />;
}
