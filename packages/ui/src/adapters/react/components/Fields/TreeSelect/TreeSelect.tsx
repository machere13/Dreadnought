import { TreeSelectAdapter } from '@dreadnought/react/unstyled';
import type { TreeSelectAdapterProps, TreeSelectActionProps } from '@dreadnought/react/unstyled';
import { treeSelectPresentation } from '#presentation/Fields/TreeSelect/treeSelectPresentation.ts';
import { Button } from '../../Controls/Button/Button.tsx';
import { Icon } from '../../DataDisplay/Icon/Icon.tsx';
import { Input } from '../Input/Input.tsx';
import { Checkbox } from '../Checkbox/Checkbox.tsx';

type Presented<Props> = Props extends unknown
  ? Omit<Props, 'renderField' | 'renderAction' | 'renderCheckbox'>
  : never;
export type TreeSelectProps<RecordType, Key extends string | number = string | number> = Presented<
  TreeSelectAdapterProps<RecordType, Key>
>;

function TreeAction({ action, children, ...props }: TreeSelectActionProps) {
  return (
    <Button
      {...props}
      variant="ghosted"
      size="compact"
      icon={<Icon name={action === 'toggle' || action === 'expand' ? 'down' : 'close'} />}
    />
  );
}

export function TreeSelect<RecordType, Key extends string | number>({
  className,
  slotClassNames,
  ...props
}: TreeSelectProps<RecordType, Key>) {
  const slots = Object.fromEntries(
    Object.entries(treeSelectPresentation.slots).map(([key, value]) => [
      key,
      [value, slotClassNames?.[key as keyof typeof slotClassNames]].filter(Boolean).join(' '),
    ]),
  );
  return (
    <TreeSelectAdapter
      {...props}
      className={[treeSelectPresentation.root, className].filter(Boolean).join(' ')}
      slotClassNames={{ ...slotClassNames, ...slots }}
      renderField={(field) => <Input {...field} type="text" variant="borderless" />}
      renderAction={(action) => <TreeAction {...action} />}
      renderCheckbox={(checkbox) => <Checkbox {...checkbox} />}
    />
  );
}
