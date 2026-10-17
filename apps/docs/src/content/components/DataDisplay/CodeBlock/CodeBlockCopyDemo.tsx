import { useState } from 'react';
import { CodeBlock } from '@dreadnought/ui/react';

export function CodeBlockCopyDemo() {
  const [error, setError] = useState(false);
  return (
    <div style={{ display: 'grid', gap: 16 }}>
      <CodeBlock
        code={'const answer = 42;\n'}
        language="ts"
        copyLabels={{
          copy: 'Копировать пример',
          copied: 'Пример скопирован',
          error: 'Не удалось скопировать пример',
        }}
        onCopy={() => setError(false)}
        onCopyError={() => setError(true)}
      />
      {error && (
        <p role="alert">
          Не удалось скопировать. Повторите попытку или выделите код и скопируйте вручную.
        </p>
      )}
    </div>
  );
}
