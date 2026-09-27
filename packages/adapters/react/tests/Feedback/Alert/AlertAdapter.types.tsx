import { AlertAdapter } from '@dreadnought/react/unstyled';

<AlertAdapter title="Title" />;
<AlertAdapter description="Description" />;
<AlertAdapter title="Title" description="Description" />;
<AlertAdapter title="Closable" closable />;
<AlertAdapter title="Configurable" closable={{ 'aria-label': 'Dismiss', onClose: (event) => { event.preventDefault(); } }} />;
// @ts-expect-error Alert needs title or description
<AlertAdapter />;
