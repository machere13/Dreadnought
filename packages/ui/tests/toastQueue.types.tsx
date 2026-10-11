import {
  useToastQueue,
  type ToastQueueOptions,
  type ToastQueueItem,
} from '@dreadnought/react/logic';
import { Toast, ToastViewport } from '@dreadnought/ui/react';

const options: ToastQueueOptions = { title: 'Saving', duration: 0, icon: null };

export function Example() {
  const queue = useToastQueue({ maxCount: 3 });
  const id: string = queue.add(options);
  queue.update(id, { title: 'Saved', type: 'success', duration: 1000 });
  queue.remove(id);
  queue.clear();
  const items: ToastQueueItem[] = queue.items;
  return (
    <ToastViewport>
      {items.map((item) => (
        <Toast key={item.id} {...item.props} />
      ))}
    </ToastViewport>
  );
}

// @ts-expect-error Queue owns visibility.
const controlled: ToastQueueOptions = { title: 'Saving', open: false };
// @ts-expect-error Toast title is required.
const missingTitle: ToastQueueOptions = { duration: 0 };
// @ts-expect-error maxCount is numeric.
useToastQueue({ maxCount: '3' });
