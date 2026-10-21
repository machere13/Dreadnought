import { createRequire } from 'node:module';
import { resolve } from 'node:path';

const require = createRequire(resolve('packages/ui/package.json'));
const iconRequire = createRequire(require.resolve('@ant-design/icons/package.json'));
const definitions = {
  check: 'CheckOutlined',
  down: 'DownOutlined',
  close: 'CloseOutlined',
  plus: 'PlusOutlined',
  info: 'InfoCircleOutlined',
  success: 'CheckCircleOutlined',
  warning: 'WarningOutlined',
  error: 'CloseCircleOutlined',
  ellipsis: 'EllipsisOutlined',
  clock: 'ClockCircleOutlined',
  calendar: 'CalendarOutlined',
  left: 'LeftOutlined',
  right: 'RightOutlined',
  eye: 'EyeOutlined',
  'eye-off': 'EyeInvisibleOutlined',
  search: 'SearchOutlined',
  filter: 'FilterOutlined',
  copy: 'CopyOutlined',
  menu: 'MenuOutlined',
  'info-circle': 'InfoCircleOutlined',
  'check-circle': 'CheckCircleOutlined',
  'close-circle': 'CloseCircleOutlined',
  bold: 'BoldOutlined',
  italic: 'ItalicOutlined',
  strikethrough: 'StrikethroughOutlined',
  heading: 'FontSizeOutlined',
  quote: 'DoubleRightOutlined',
  'unordered-list': 'UnorderedListOutlined',
  'ordered-list': 'OrderedListOutlined',
  code: 'CodeOutlined',
  'code-block': 'FileTextOutlined',
  link: 'LinkOutlined',
  image: 'PictureOutlined',
  table: 'TableOutlined',
  undo: 'UndoOutlined',
  redo: 'RedoOutlined',
  columns: 'LayoutOutlined',
};
function xml(node) {
  const attrs = Object.entries(node.attrs || {})
    .map(
      ([key, value]) =>
        `${key}="${String(value).replaceAll('&', '&amp;').replaceAll('"', '&quot;')}"`,
    )
    .join(' ');
  return `<${node.tag} ${attrs}>${(node.children || []).map(xml).join('')}</${node.tag}>`;
}
export const icons = Object.fromEntries(
  Object.entries(definitions).map(([name, definition]) => {
    const icon = iconRequire(`@ant-design/icons-svg/lib/asn/${definition}`).default.icon;
    return [
      name,
      xml({
        ...icon,
        attrs: { ...icon.attrs, xmlns: 'http://www.w3.org/2000/svg', width: 16, height: 16 },
      }),
    ];
  }),
);
