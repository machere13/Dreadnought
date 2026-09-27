import { Breadcrumb } from '@dreadnought/ui/react';

<Breadcrumb items={[{ label: 'Home', href: '/' }, { label: 'Current' }]} />;
// @ts-expect-error items are required
<Breadcrumb />;
