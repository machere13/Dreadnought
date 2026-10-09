import { DocsShell } from '../app/DocsShell.tsx';
import type { ComponentSection } from '../app/navigation.ts';
import { ComponentDocumentation } from './ComponentDocumentation.tsx';
import type { ComponentDoc } from './types.ts';

export function ComponentPage({ component, doc }: { component: ComponentSection; doc: ComponentDoc }) {
  return <DocsShell section={component}><ComponentDocumentation component={component} doc={doc} /></DocsShell>;
}
