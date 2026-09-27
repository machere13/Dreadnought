import { BreadcrumbAdapter } from '@dreadnought/react/unstyled';
import type { BreadcrumbAdapterProps } from '@dreadnought/react/unstyled';
import { breadcrumbPresentation } from '#presentation/Navigation/Breadcrumb/breadcrumbPresentation.ts';

export type BreadcrumbProps = BreadcrumbAdapterProps;

function classes(library: string, consumer?: string) {
  return [library, consumer].filter(Boolean).join(' ');
}

export function Breadcrumb({ className, slotClassNames, ...props }: BreadcrumbProps) {
  return <BreadcrumbAdapter {...props} className={classes(breadcrumbPresentation.root, className)}
    slotClassNames={{
      list: classes(breadcrumbPresentation.list, slotClassNames?.list),
      item: classes(breadcrumbPresentation.item, slotClassNames?.item),
      link: classes(breadcrumbPresentation.link, slotClassNames?.link),
      current: classes(breadcrumbPresentation.current, slotClassNames?.current),
    }} />;
}
