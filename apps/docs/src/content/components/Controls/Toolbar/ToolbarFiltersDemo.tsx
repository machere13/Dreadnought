import { useState } from 'react';
import { Button, Input, Select, Toolbar } from '@dreadnought/ui/react';

const documents = [
  { title: 'План проекта', status: 'active' },
  { title: 'Макет интерфейса', status: 'active' },
  { title: 'План прошлого года', status: 'archived' },
];

export function ToolbarFiltersDemo() {
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState<string | null>(null);
  const [applied, setApplied] = useState({ query: '', status: null as string | null });
  const visible = documents.filter(
    (document) =>
      document.title
        .toLocaleLowerCase('ru')
        .includes(applied.query.trim().toLocaleLowerCase('ru')) &&
      (!applied.status || document.status === applied.status),
  );
  return (
    <div>
      <Toolbar navigation="native" aria-label="Фильтры документа" style={{ flexWrap: 'wrap' }}>
        <div>
          <p id="toolbar-search-label">Название документа</p>
          <Input
            aria-labelledby="toolbar-search-label"
            placeholder="Введите План"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </div>
        <div>
          <p id="toolbar-status-label">Статус документа</p>
          <Select
            aria-labelledby="toolbar-status-label"
            placeholder="Все статусы"
            value={status}
            onValueChange={setStatus}
            allowClear
            options={[
              { value: 'active', label: 'Активные' },
              { value: 'archived', label: 'Архив' },
            ]}
          />
        </div>
        <Button size="compact" onClick={() => setApplied({ query, status })}>
          Применить
        </Button>
        <Button
          size="compact"
          variant="secondary"
          onClick={() => {
            setQuery('');
            setStatus(null);
            setApplied({ query: '', status: null });
          }}
        >
          Сбросить фильтры
        </Button>
      </Toolbar>
      <ul aria-label="Найденные документы">
        {visible.map((document) => (
          <li key={document.title}>
            {document.title} — {document.status === 'active' ? 'Активный' : 'Архив'}
          </li>
        ))}
      </ul>
      <p role="status">
        {visible.length ? `Найдено документов: ${visible.length}` : 'Ничего не найдено'}
      </p>
    </div>
  );
}
