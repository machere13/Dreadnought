import { useEffect, useState, useCallback } from 'react';
import { loadKnowledge } from './load';
import type { KnowledgeEntry } from './types';

export function useKnowledge() {
  const [entries, setEntries] = useState<KnowledgeEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);
  const retry = useCallback(() => setAttempt(value => value + 1), []);
  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);
    setEntries([]);
    loadKnowledge().then(result => { if (active) setEntries(result.entries); })
      .catch(reason => { if (active) setError(reason instanceof Error ? reason.message : 'Поиск временно недоступен.'); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [attempt]);
  return { entries, loading, error, retry };
}
