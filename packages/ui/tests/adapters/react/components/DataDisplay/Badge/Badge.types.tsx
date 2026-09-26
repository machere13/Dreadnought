import { createRef } from 'react';
import { Badge } from '@dreadnought/ui/react';

const root = createRef<HTMLSpanElement>();
<Badge ref={root} appearance="outline" icon={<svg />} iconPosition="end">Beta</Badge>;
<Badge target={<button type="button">Inbox</button>}>0</Badge>;
