import { Alert } from '@dreadnought/ui/react';

<Alert title="Outlined" variant="outlined" />;
<Alert title="Filled" variant="filled" />;
// @ts-expect-error Only defined variants are supported
<Alert title="Invalid" variant="invalid" />;
