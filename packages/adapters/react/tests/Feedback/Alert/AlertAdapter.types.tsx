import { AlertAdapter } from '@dreadnought/react/unstyled';

<AlertAdapter title="Title" />;
<AlertAdapter description="Description" />;
<AlertAdapter title="Title" description="Description" />;
// @ts-expect-error Alert needs title or description
<AlertAdapter />;
