import { CheckCircleOutlined, CheckOutlined, CloseCircleOutlined, CloseOutlined, CopyOutlined, DownOutlined, EllipsisOutlined, EyeInvisibleOutlined, EyeOutlined, InfoCircleOutlined, MenuOutlined, SearchOutlined, WarningOutlined } from '@ant-design/icons';
import { BoldOutlined, ItalicOutlined, StrikethroughOutlined, FontSizeOutlined, DoubleRightOutlined, UnorderedListOutlined, OrderedListOutlined, CodeOutlined, FileTextOutlined, LinkOutlined, PictureOutlined, TableOutlined } from '@ant-design/icons';
import { IconAdapter } from '@dreadnought/react/unstyled';
import type { IconAdapterProps } from '@dreadnought/react/unstyled';
import type { ComponentType } from 'react';
import { iconPresentation } from '#presentation/DataDisplay/Icon/iconPresentation.ts';
import type { IconName } from '@dreadnought/ui';

const icons = {
  eye: EyeOutlined,
  'eye-off': EyeInvisibleOutlined,
  search: SearchOutlined,
  copy: CopyOutlined,
  check: CheckOutlined,
  close: CloseOutlined,
  down: DownOutlined,
  menu: MenuOutlined,
  ellipsis: EllipsisOutlined,
  'info-circle': InfoCircleOutlined,
  'check-circle': CheckCircleOutlined,
  warning: WarningOutlined,
  'close-circle': CloseCircleOutlined,
  bold: BoldOutlined,
  italic: ItalicOutlined,
  strikethrough: StrikethroughOutlined,
  heading: FontSizeOutlined,
  quote: DoubleRightOutlined,
  'unordered-list': UnorderedListOutlined,
  'ordered-list': OrderedListOutlined,
  code: CodeOutlined,
  'code-block': FileTextOutlined,
  link: LinkOutlined,
  image: PictureOutlined,
  table: TableOutlined,
} satisfies Record<IconName, ComponentType>;

export type IconProps = Omit<IconAdapterProps, 'children'> & { name: IconName };

export function Icon({ name, className, ...props }: IconProps) {
  const Graphic = icons[name];
  return <IconAdapter {...props} className={[iconPresentation.root, className].filter(Boolean).join(' ')}><Graphic /></IconAdapter>;
}
