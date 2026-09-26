import { CheckOutlined, CloseOutlined, EyeInvisibleOutlined, EyeOutlined, SearchOutlined } from '@ant-design/icons';
import { IconAdapter } from '@dreadnought/react/unstyled';
import type { IconAdapterProps } from '@dreadnought/react/unstyled';
import type { ComponentType } from 'react';
import { iconPresentation } from '#presentation/DataDisplay/Icon/iconPresentation.ts';
import type { IconName } from '../../../../../presentation/DataDisplay/Icon/iconNames.ts';

const icons = {
  eye: EyeOutlined,
  'eye-off': EyeInvisibleOutlined,
  search: SearchOutlined,
  check: CheckOutlined,
  close: CloseOutlined,
} satisfies Record<IconName, ComponentType>;

export type IconProps = Omit<IconAdapterProps, 'children'> & { name: IconName };

export function Icon({ name, className, ...props }: IconProps) {
  const Graphic = icons[name];
  return <IconAdapter {...props} className={[iconPresentation.root, className].filter(Boolean).join(' ')}><Graphic /></IconAdapter>;
}
