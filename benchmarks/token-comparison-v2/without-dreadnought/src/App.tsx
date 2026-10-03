import { useState, type FormEvent } from 'react';

type Status = 'К выполнению' | 'В работе' | 'Готово';
type Priority = 'Высокий' | 'Средний' | 'Низкий';
type Task = { id: number; title: string; assignee: string; status: Status; priority: Priority };

const initialTasks: Task[] = [
  { id: 1, title: 'Собрать требования', assignee: 'Анна', status: 'Готово', priority: 'Высокий' },
  { id: 2, title: 'Нарисовать макет', assignee: 'Максим', status: 'В работе', priority: 'Средний' },
  { id: 3, title: 'Проверить доступность', assignee: 'Ирина', status: 'К выполнению', priority: 'Высокий' },
  { id: 4, title: 'Подключить API', assignee: 'Павел', status: 'В работе', priority: 'Высокий' },
  { id: 5, title: 'Написать тесты', assignee: 'Ольга', status: 'К выполнению', priority: 'Средний' },
  { id: 6, title: 'Подготовить релиз', assignee: 'Анна', status: 'К выполнению', priority: 'Низкий' },
];
const filters = ['Все', 'В работе', 'Готово'] as const;
type Filter = (typeof filters)[number];

export default function App() {
  const [tasks, setTasks] = useState(initialTasks);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<Filter>('Все');
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [assignee, setAssignee] = useState('');
  const visibleTasks = tasks.filter(task =>
    (filter === 'Все' || task.status === filter) &&
    `${task.title} ${task.assignee}`.toLocaleLowerCase().includes(search.trim().toLocaleLowerCase())
  );

  function addTask(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const name = title.trim();
    const person = assignee.trim();
    if (!name || !person) return;
    setTasks(current => [...current, { id: Date.now(), title: name, assignee: person, status: 'К выполнению', priority: 'Средний' }]);
    setTitle('');
    setAssignee('');
    setShowForm(false);
  }

  return (
    <main className="board">
      <header className="page-header">
        <div>
          <div className="eyebrow"><span className="eyebrow-mark" aria-hidden="true" /> РАБОЧЕЕ ПРОСТРАНСТВО</div>
          <h1>Командная доска</h1>
          <p>Задачи команды в одном месте</p>
        </div>
        <button className="primary-button" type="button" onClick={() => setShowForm(current => !current)} aria-expanded={showForm} aria-controls="new-task-form">
          <span aria-hidden="true">＋</span> Новая задача
        </button>
      </header>

      {showForm && (
        <form id="new-task-form" className="new-task-form" onSubmit={addTask}>
          <div className="form-field">
            <label htmlFor="task-title">Название</label>
            <input id="task-title" value={title} onChange={event => setTitle(event.target.value)} required autoFocus />
          </div>
          <div className="form-field">
            <label htmlFor="task-assignee">Исполнитель</label>
            <input id="task-assignee" value={assignee} onChange={event => setAssignee(event.target.value)} required />
          </div>
          <div className="form-actions">
            <button className="primary-button" type="submit">Добавить</button>
            <button className="secondary-button" type="button" onClick={() => setShowForm(false)}>Отмена</button>
          </div>
        </form>
      )}

      <section className="metrics" aria-label="Сводка задач">
        <div className="metric"><span>Всего</span><strong>{tasks.length}</strong></div>
        <div className="metric"><span>В работе</span><strong>{tasks.filter(task => task.status === 'В работе').length}</strong></div>
        <div className="metric"><span>Готово</span><strong>{tasks.filter(task => task.status === 'Готово').length}</strong></div>
      </section>

      <section className="task-panel" aria-label="Задачи команды">
        <div className="toolbar">
          <div className="filters" role="group" aria-label="Фильтр по статусу">
            {filters.map(item => <button key={item} className={filter === item ? 'filter active' : 'filter'} type="button" onClick={() => setFilter(item)} aria-pressed={filter === item}>{item}</button>)}
          </div>
          <label className="search-field">
            <span className="sr-only">Поиск по задаче или исполнителю</span>
            <svg aria-hidden="true" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="10.8" cy="10.8" r="6.8"/><path d="m16 16 4.5 4.5"/></svg>
            <input type="search" placeholder="Поиск задач" value={search} onChange={event => setSearch(event.target.value)} />
          </label>
        </div>
        <div className="table-scroll">
          <table>
            <thead><tr><th scope="col">Задача</th><th scope="col">Исполнитель</th><th scope="col">Статус</th><th scope="col">Приоритет</th></tr></thead>
            <tbody>
              {visibleTasks.map(task => (
                <tr key={task.id}>
                  <td className="task-title" data-label="Задача">{task.title}</td>
                  <td data-label="Исполнитель">{task.assignee}</td>
                  <td data-label="Статус"><span className={`status status-${task.status === 'Готово' ? 'done' : task.status === 'В работе' ? 'active' : 'todo'}`}>{task.status}</span></td>
                  <td data-label="Приоритет"><span className={`priority priority-${task.priority === 'Высокий' ? 'high' : task.priority === 'Средний' ? 'medium' : 'low'}`}>{task.priority}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
          {visibleTasks.length === 0 && <p className="empty-state">Задачи не найдены</p>}
        </div>
      </section>
    </main>
  );
}
