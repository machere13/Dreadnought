import { BreadcrumbAdapter } from '@dreadnought/react/unstyled';

<BreadcrumbAdapter items={[{ label: 'Home', href: '/' }, { label: 'Current' }]} />;
// @ts-expect-error items are required
<BreadcrumbAdapter />;
// @ts-expect-error every item needs a label
<BreadcrumbAdapter items={[{ href: '/' }]} />;
