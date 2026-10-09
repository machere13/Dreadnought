import { useState, type ReactNode } from 'react';
import { Button, Input } from '@dreadnought/ui/react';
import { searchKnowledge } from '../../data/knowledge/search.ts';
import type { useKnowledge } from '../../data/knowledge/useKnowledge.ts';
import styles from './DocsSearch.module.css';

export function DocsSearch({ knowledge, children }: { knowledge: ReturnType<typeof useKnowledge>; children: ReactNode }) {
  const [query, setQuery] = useState('');
  const results = searchKnowledge(knowledge.entries, query);
  return <><div role="search" className={styles.search}>
      <Input type="search" aria-label="Поиск по документации" placeholder="Поиск по документации"
        value={query} onChange={(event) => setQuery(event.target.value)} />
    </div>
    {query.trim() ? <div className={styles.searchResults}>
      <span className={styles.navigationGroup} role="status">{knowledge.loading ? 'Загрузка поиска…' : `Результаты поиска: ${results.length}`}</span>
      {knowledge.error ? <div role="alert"><p>{knowledge.error}</p><Button size="compact" variant="secondary" onClick={knowledge.retry}>Повторить</Button></div> : results.length ? results.map((result) => <a key={result.id} className={styles.searchResult} href={result.url}>
        <strong>{result.title}</strong>
        <span>{result.text.slice(0, 150)}</span>
      </a>) : !knowledge.loading && <p className={styles.searchEmpty}>Ничего не найдено</p>}
    </div> : children}</>;
}
