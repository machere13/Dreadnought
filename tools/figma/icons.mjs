import { createRequire } from 'node:module';
import { resolve } from 'node:path';

const require = createRequire(resolve('packages/ui/package.json'));
const iconRequire = createRequire(require.resolve('@ant-design/icons/package.json'));
const definitions = {
  check: 'CheckOutlined',
  down: 'DownOutlined',
  close: 'CloseOutlined',
  plus: 'PlusOutlined',
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
