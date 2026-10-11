import { Input, Select, TextArea } from '@dreadnought/ui/react';

<Input controlSize="compact" variant="filled" size={12} />;
<TextArea controlSize="default" variant="borderless" autoSize />;
<Select controlSize="compact" variant="outlined" options={[]} />;

// @ts-expect-error Native input size remains numeric.
<Input size="compact" />;
// @ts-expect-error Only the documented visual sizes are supported.
<TextArea controlSize="large" />;
// @ts-expect-error Only the documented variants are supported.
<Select variant="ghosted" options={[]} />;
