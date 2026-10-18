import { useState, type ReactNode } from 'react';
import { Alert, Button, Input, Loader, Menu } from '@dreadnought/ui/react';
import { searchKnowledge } from '../../data/knowledge/search.ts';
import type { useKnowledge } from '../../data/knowledge/useKnowledge.ts';
import styles from './DocsSearch.module.css';

export function DocsSearch({
  knowledge,
  children,
}: {
  knowledge: ReturnType<typeof useKnowledge>;
  children: ReactNode;
}) {
  const [query, setQuery] = useState('');
  const results = searchKnowledge(knowledge.entries, query);
  return (
    <>
      <div role="search" className={styles.search}>
        <Input
          type="search"
          aria-label="Поиск по документации"
          placeholder="Поиск по документации"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
      </div>
      {query.trim() ? (
        <div className={styles.searchResults}>
          {knowledge.loading ? (
            <Loader size="small" label="Загрузка поиска…" showLabel />
          ) : (
            <span className={styles.navigationGroup} role="status">
              Результаты поиска: {results.length}
            </span>
          )}
          {knowledge.error ? (
            <Alert
              type="error"
              description={knowledge.error}
              action={
                <Button size="compact" variant="secondary" onClick={knowledge.retry}>
                  Повторить
                </Button>
              }
            />
          ) : results.length ? (
            <Menu
              className={styles.resultsMenu}
              mode="navigation"
              aria-label="Результаты поиска"
              items={results.map((result) => ({
                value: result.id,
                href: result.url,
                ariaLabel: result.title,
                label: (
                  <div className={styles.resultText}>
                    <strong>{result.title}</strong>
                    <span>{result.text.slice(0, 150)}</span>
                  </div>
                ),
              }))}
            />
          ) : (
            !knowledge.loading && <p className={styles.searchEmpty}>Ничего не найдено</p>
          )}
        </div>
      ) : (
        children
      )}
    </>
  );
}
