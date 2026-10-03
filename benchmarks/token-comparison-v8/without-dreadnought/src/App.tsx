import { useRef, useState } from 'react';
import type { FormEvent, KeyboardEvent } from 'react';
import './styles.css';

const statuses = ['К выполнению', 'В работе', 'Готово'] as const;
const priorities = ['Низкий', 'Средний', 'Высокий'] as const;
const tabs = ['Все', ...statuses] as const;
type Status = typeof statuses[number];
type Task = { id: number; title: string; assignee: string; status: Status; priority: typeof priorities[number] };

const initialTasks: Task[] = [
  { id: 1, title: 'Собрать требования', assignee: 'Анна', status: 'В работе', priority: 'Высокий' },
  { id: 2, title: 'Проверить макет', assignee: 'Борис', status: 'К выполнению', priority: 'Средний' },
  { id: 3, title: 'Подготовить релиз', assignee: 'Вера', status: 'Готово', priority: 'Низкий' },
];

export default function App() {
  const [tasks, setTasks] = useState(initialTasks);
  const [search, setSearch] = useState('');
  const [tab, setTab] = useState<typeof tabs[number]>('Все');
  const dialog = useRef<HTMLDialogElement>(null);
  const query = search.trim().toLocaleLowerCase();
  const visibleTasks = tasks.filter(task =>
    (tab === 'Все' || task.status === tab) &&
    `${task.title} ${task.assignee}`.toLocaleLowerCase().includes(query),
  );

  function createTask(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const title = String(data.get('title')).trim();
    const assignee = String(data.get('assignee')).trim();
    if (!title || !assignee) return;
    setTasks(current => [...current, {
      id: Math.max(...current.map(task => task.id), 0) + 1,
      title,
      assignee,
      status: data.get('status') as Status,
      priority: data.get('priority') as Task['priority'],
    }]);
    setSearch('');
    setTab('Все');
    dialog.current?.close();
    form.reset();
  }

  function moveTab(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    let next = index;
    if (event.key === 'ArrowRight') next = (index + 1) % tabs.length;
    else if (event.key === 'ArrowLeft') next = (index + tabs.length - 1) % tabs.length;
    else if (event.key === 'Home') next = 0;
    else if (event.key === 'End') next = tabs.length - 1;
    else return;
    event.preventDefault();
    setTab(tabs[next]);
    document.getElementById(`tab-${next}`)?.focus();
  }

  return (
    <div className="workspace">
      <aside className="sidebar">
        <a className="brand" href="#main"><span className="brand-mark" aria-hidden="true">к</span> Команда<span className="brand-dot">.</span></a>
        <div className="workspace-label">РАБОЧЕЕ ПРОСТРАНСТВО</div>
        <nav aria-label="Основная навигация">
          <a className="nav-item" href="#main" aria-current="page"><span aria-hidden="true">▦</span> Командная доска</a>
        </nav>
        <div className="sidebar-bottom"><span className="avatar workspace-avatar">К</span><div>Ваша команда<small>Общее пространство</small></div></div>
      </aside>

      <main id="main">
        <div className="breadcrumb">Рабочее пространство <span>/</span> Задачи</div>
        <header className="page-header">
          <div><h1>Командная доска</h1><p>Всё, над чем мы работаем. В одном месте.</p></div>
          <button className="primary" onClick={() => dialog.current?.showModal()}><span aria-hidden="true">＋</span> Новая задача</button>
        </header>

        <section className="stats" aria-label="Статистика задач">
          {[
            { label: 'Всего', value: tasks.length, tone: 'neutral', note: 'задач в команде' },
            { label: 'В работе', value: tasks.filter(task => task.status === 'В работе').length, tone: 'working', note: 'в процессе выполнения' },
            { label: 'Готово', value: tasks.filter(task => task.status === 'Готово').length, tone: 'done', note: 'завершённых задач' },
          ].map(stat => <article className="stat" key={stat.label}>
            <div className="stat-label"><span className={`dot ${stat.tone}`} />{stat.label}</div>
            <div className="stat-value">{stat.value}</div><span className="stat-note">{stat.note}</span>
          </article>)}
        </section>

        <section className="task-section" aria-labelledby="tasks-heading">
          <div className="section-header"><h2 id="tasks-heading">Задачи <span>{tasks.length}</span></h2>
            <div className="search"><span aria-hidden="true">⌕</span><input type="search" aria-label="Поиск задач" placeholder="Поиск задач…" value={search} onChange={event => setSearch(event.target.value)} /></div>
          </div>
          <div role="tablist" aria-label="Фильтр по статусу" className="tabs">
            {tabs.map((item, index) => <button key={item} id={`tab-${index}`} role="tab" aria-selected={tab === item} aria-controls="task-panel" tabIndex={tab === item ? 0 : -1} onClick={() => setTab(item)} onKeyDown={event => moveTab(event, index)}>{item}</button>)}
          </div>
          <div id="task-panel" role="tabpanel" aria-labelledby={`tab-${tabs.indexOf(tab)}`} className="table-scroll" tabIndex={0}>
            <table>
              <thead><tr><th>Задача</th><th>Исполнитель</th><th>Статус</th><th>Приоритет</th></tr></thead>
              <tbody>{visibleTasks.map(task => <tr key={task.id}>
                <td><span className="task-id">{String(task.id).padStart(2, '0')}</span><span className="task-title">{task.title}</span></td>
                <td><div className="assignee"><span className={`avatar avatar-${task.id % 3}`}>{task.assignee.slice(0, 1).toUpperCase()}</span>{task.assignee}</div></td>
                <td><span className={`badge status-${statuses.indexOf(task.status)}`}><span className="dot" />{task.status}</span></td>
                <td><span className={`priority priority-${priorities.indexOf(task.priority)}`}><span aria-hidden="true">{task.priority === 'Высокий' ? '↑' : task.priority === 'Низкий' ? '↓' : '−'}</span>{task.priority}</span></td>
              </tr>)}</tbody>
            </table>
            {visibleTasks.length === 0 && <div className="empty" role="status">Задачи не найдены</div>}
          </div>
          <footer className="table-footer">Показано {visibleTasks.length} из {tasks.length}<span>Вместе — к результату</span></footer>
        </section>
      </main>

      <dialog ref={dialog} aria-labelledby="dialog-title">
        <form onSubmit={createTask}>
          <h2 id="dialog-title">Новая задача</h2><p className="dialog-description">Добавьте задачу на командную доску.</p>
          <label>Название задачи<input name="title" required pattern=".*\S.*" title="Введите название задачи, а не только пробелы" autoFocus /></label>
          <label>Исполнитель<input name="assignee" required pattern=".*\S.*" title="Введите имя исполнителя, а не только пробелы" /></label>
          <div className="form-row">
            <label>Статус<select name="status">{statuses.map(status => <option key={status}>{status}</option>)}</select></label>
            <label>Приоритет<select name="priority" defaultValue="Средний">{priorities.map(priority => <option key={priority}>{priority}</option>)}</select></label>
          </div>
          <div className="form-actions"><button type="button" className="secondary" onClick={() => dialog.current?.close()}>Отмена</button><button className="primary" type="submit">Создать задачу</button></div>
        </form>
      </dialog>
    </div>
  );
}
