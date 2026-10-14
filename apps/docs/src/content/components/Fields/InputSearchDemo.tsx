import { useId, useState } from 'react';
import { Input, Icon } from '@dreadnought/ui/react';

const documents = ['Начало работы', 'Токены темы', 'Компоненты'];

export function InputSearchDemo() {
  const id = useId();
  const [query, setQuery] = useState('');
  const matches = documents.filter((title) =>
    title.toLocaleLowerCase('ru-RU').includes(query.trim().toLocaleLowerCase('ru-RU')),
  );
  return (
    <div style={{ display: 'grid', gap: 12 }}>
      <label htmlFor={id}>Поиск</label>
      <Input
        id={id}
        prefix={<Icon name="search" aria-hidden />}
        allowClear
        clearLabel="Очистить поиск"
        value={query}
        onChange={(event) => setQuery(event.currentTarget.value)}
        placeholder="Поиск документов"
      />
      <p role="status">Найдено документов: {matches.length}</p>
      {matches.length ? (
        <ul>
          {matches.map((title) => (
            <li key={title}>{title}</li>
          ))}
        </ul>
      ) : (
        <p>Ничего не найдено</p>
      )}
    </div>
  );
}
