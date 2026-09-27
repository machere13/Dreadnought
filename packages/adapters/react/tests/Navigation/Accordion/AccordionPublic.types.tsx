import { useAccordion } from '../../../src/Navigation/Accordion/useAccordion.ts';

useAccordion({});
useAccordion({ multiple: true, value: ['a'] });
useAccordion({ value: null });

// @ts-expect-error Controlled and uncontrolled values cannot be combined.
useAccordion({ value: 'a', defaultValue: 'b' });
// @ts-expect-error Multiple mode accepts arrays, not a string.
useAccordion({ multiple: true, value: 'a' });
// @ts-expect-error Single mode accepts a string or null, not an array.
useAccordion({ value: ['a'] });
