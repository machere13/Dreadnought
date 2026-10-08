import { createRef } from 'react';
import { Menu, type MenuProps } from '@dreadnought/ui/react';
const props: MenuProps = { mode: 'navigation', ref: createRef<HTMLDivElement>(), openKeys: ['export'],
  onOpenKeysChange: keys => { const values: string[] = keys; void values; },
  items: [{ value: 'docs', label: 'Docs', href: '/docs' }, { value: 'group', type: 'group', label: 'Group', children: [] },
    { value: 'separator', type: 'divider' }], slotProps: { link: { target: '_blank' }, group: { className: 'group' } } };
const menu = <Menu {...props} />;
void menu;
