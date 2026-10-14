import { useEffect, useState } from 'react';
import { Button } from '@dreadnought/ui/react';

export function ButtonLoadingDemo() {
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(0);
  useEffect(() => {
    if (!loading) return;
    const timer = setTimeout(() => {
      setSaved((value) => value + 1);
      setLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, [loading]);
  return (
    <div>
      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
        <Button loading={loading} onClick={() => setLoading(true)}>
          Сохранить изменения
        </Button>
        <Button disabled variant="secondary">
          Недоступное действие
        </Button>
      </div>
      <p role="status">{loading ? 'Сохраняем…' : `Успешных сохранений: ${saved}`}</p>
    </div>
  );
}
