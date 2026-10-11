import { Loader } from '@dreadnought/ui/react';
import { LoaderAdapter } from '@dreadnought/react/unstyled';

<Loader loading delay={200} size="small">
  <button>Save</button>
</Loader>;
<LoaderAdapter delay={0} indicator={<span>Loading</span>} />;

// @ts-expect-error Delay is expressed as a number of milliseconds.
<Loader delay="200ms" />;
