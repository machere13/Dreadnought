import { useAccordion } from '../../../src/Navigation/Accordion/useAccordion.ts';
import { AccordionAdapter } from '@dreadnought/react/unstyled';

<AccordionAdapter.Panel mountPolicy="eager">Keep</AccordionAdapter.Panel>;
<AccordionAdapter.Panel mountPolicy="lazy">Lazy</AccordionAdapter.Panel>;
// @ts-expect-error Only the three supported mount policies are accepted.
<AccordionAdapter.Panel mountPolicy="destroy">Invalid</AccordionAdapter.Panel>;

useAccordion({});
useAccordion({ multiple: true, value: ['a'] });
useAccordion({ value: null });

// @ts-expect-error Controlled and uncontrolled values cannot be combined.
useAccordion({ value: 'a', defaultValue: 'b' });
// @ts-expect-error Multiple mode accepts arrays, not a string.
useAccordion({ multiple: true, value: 'a' });
// @ts-expect-error Single mode accepts a string or null, not an array.
useAccordion({ value: ['a'] });
