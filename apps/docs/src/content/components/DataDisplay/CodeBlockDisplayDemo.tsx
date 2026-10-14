import { CodeBlock } from '@dreadnought/ui/react';

export function CodeBlockDisplayDemo() {
  return (
    <div style={{ display: 'grid', gap: 16 }}>
      <CodeBlock
        code={'def greet(name):\n    return f"Hello, {name}"\n'}
        language="python"
        copyable={false}
      />
      <CodeBlock code="npm install @dreadnought/ui" copyable={false} />
    </div>
  );
}
