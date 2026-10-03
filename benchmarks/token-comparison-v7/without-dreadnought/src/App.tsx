import { useRef, useState } from 'react';
import type { FormEvent, KeyboardEvent } from 'react';

const statuses = ['К выполнению', 'В работе', 'Готово'] as const;
const priorities = ['Низкий', 'Средний', 'Высокий'] as const;
const tabs = ['Все', ...statuses] as const;

type Task = {
  id: number;
  title: string;
  assignee: string;
  status: typeof statuses[number];
  priority: typeof priorities[number];
};

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
  const query = search.trim().toLocaleLowerCase('ru');
  const visibleTasks = tasks.filter(task =>
    (tab === 'Все' || task.status === tab) &&
    [task.title, task.assignee].some(value => value.toLocaleLowerCase('ru').includes(query))
  );

  function createTask(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const title = String(data.get('title')).trim();
    const assignee = String(data.get('assignee')).trim();
    if (!title || !assignee) return;

    setTasks(current => [...current, {
      id: Math.max(...current.map(task => task.id), 0) + 1,
      title,
      assignee,
      status: data.get('status') as Task['status'],
      priority: data.get('priority') as Task['priority'],
    }]);
    setSearch('');
    setTab('Все');
    dialog.current?.close();
  }

  function navigateTabs(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    let next: number;
    if (event.key === 'ArrowRight') next = (index + 1) % tabs.length;
    else if (event.key === 'ArrowLeft') next = (index + tabs.length - 1) % tabs.length;
    else if (event.key === 'Home') next = 0;
    else if (event.key === 'End') next = tabs.length - 1;
    else return;
    event.preventDefault();
    setTab(tabs[next]);
    event.currentTarget.parentElement?.querySelectorAll<HTMLButtonElement>('[role="tab"]')[next].focus();
  }

  return (
    <div className="workspace">
      <aside className="sidebar">
        <a className="brand" href="#board" aria-label="Пространство команды">
          <span className="brand-mark" aria-hidden="true">к.</span>
          <span>команда<span className="brand-caption">Рабочее пространство</span></span>
        </a>
        <nav aria-label="Основная навигация">
          <p className="nav-label">ПРОЕКТ</p>
          <a className="nav-item" href="#board" aria-current="page">
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
              <rect x="2" y="2" width="5" height="5" rx="1" stroke="currentColor" />
              <rect x="11" y="2" width="5" height="5" rx="1" stroke="currentColor" />
              <rect x="2" y="11" width="5" height="5" rx="1" stroke="currentColor" />
              <rect x="11" y="11" width="5" height="5" rx="1" stroke="currentColor" />
            </svg>
            Командная доска
          </a>
        </nav>
        <div className="sidebar-footer"><span className="online-dot" /> Вместе к результату</div>
      </aside>

      <main id="board">
        <div className="breadcrumb">Рабочее пространство <span>/</span> Обзор</div>
        <header className="page-header">
          <div><h1>Командная доска</h1><p>Все задачи команды в одном месте.</p></div>
          <button className="primary-button" onClick={() => dialog.current?.showModal()}>
            <span aria-hidden="true">＋</span> Новая задача
          </button>
        </header>

        <section className="stats" aria-label="Сводка задач">
          {[
            { label: 'Всего', value: tasks.length, detail: 'задач в команде', color: 'neutral' },
            { label: 'В работе', value: tasks.filter(task => task.status === 'В работе').length, detail: 'в процессе выполнения', color: 'progress' },
            { label: 'Готово', value: tasks.filter(task => task.status === 'Готово').length, detail: 'завершённых задач', color: 'done' },
          ].map(stat => (
            <article className="stat-card" key={stat.label}>
              <div className="stat-label"><span>{stat.label}</span><span className={`stat-dot ${stat.color}`} /></div>
              <strong>{stat.value}</strong><p>{stat.detail}</p>
            </article>
          ))}
        </section>

        <section className="task-section" aria-labelledby="tasks-heading">
          <div className="section-header">
            <h2 id="tasks-heading">Задачи <span>{tasks.length}</span></h2>
            <div className="search-box">
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true"><circle cx="7.5" cy="7.5" r="5" stroke="currentColor" strokeWidth="1.5" /><path d="m11.5 11.5 4 4" stroke="currentColor" strokeWidth="1.5" /></svg>
              <input type="search" aria-label="Поиск задач" placeholder="Поиск задач…" value={search} onChange={event => setSearch(event.target.value)} />
            </div>
          </div>
          <div className="tabs" role="tablist" aria-label="Фильтр по статусу">
            {tabs.map((item, index) => (
              <button key={item} id={`tab-${index}`} role="tab" aria-selected={tab === item} aria-controls="tasks-panel" tabIndex={tab === item ? 0 : -1} onClick={() => setTab(item)} onKeyDown={event => navigateTabs(event, index)}>{item}</button>
            ))}
          </div>
          <div id="tasks-panel" role="tabpanel" aria-labelledby={`tab-${tabs.indexOf(tab)}`} tabIndex={0} className="table-scroll">
            <table>
              <thead><tr><th scope="col">Задача</th><th scope="col">Исполнитель</th><th scope="col">Статус</th><th scope="col">Приоритет</th></tr></thead>
              <tbody>
                {visibleTasks.map(task => (
                  <tr key={task.id}>
                    <td className="task-title"><span className="task-id">{String(task.id).padStart(2, '0')}</span>{task.title}</td>
                    <td><span className="assignee"><span className={`avatar avatar-${task.id % 3}`} aria-hidden="true">{task.assignee.slice(0, 1).toUpperCase()}</span>{task.assignee}</span></td>
                    <td><span className={`badge status-${statuses.indexOf(task.status)}`}><span aria-hidden="true" />{task.status}</span></td>
                    <td><span className={`priority priority-${priorities.indexOf(task.priority)}`}><span aria-hidden="true">{task.priority === 'Высокий' ? '↑' : task.priority === 'Средний' ? '−' : '↓'}</span>{task.priority}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
            {visibleTasks.length === 0 && <div className="empty-state" role="status">Задачи не найдены</div>}
          </div>
          <div className="table-footer">Показано {visibleTasks.length} из {tasks.length}</div>
        </section>
      </main>

      <dialog ref={dialog} aria-labelledby="dialog-title" onClose={event => event.currentTarget.querySelector('form')?.reset()}>
        <form onSubmit={createTask}>
          <h2 id="dialog-title">Новая задача</h2>
          <p className="dialog-description">Определите следующий шаг для команды.</p>
          <label htmlFor="task-title">Название задачи</label>
          <input id="task-title" name="title" required pattern=".*\S.*" title="Введите название задачи, а не только пробелы" autoFocus placeholder="Что нужно сделать?" />
          <label htmlFor="task-assignee">Исполнитель</label>
          <input id="task-assignee" name="assignee" required pattern=".*\S.*" title="Введите имя исполнителя, а не только пробелы" placeholder="Имя исполнителя" />
          <div className="form-row">
            <div><label htmlFor="task-status">Статус</label><select id="task-status" name="status">{statuses.map(status => <option key={status}>{status}</option>)}</select></div>
            <div><label htmlFor="task-priority">Приоритет</label><select id="task-priority" name="priority" defaultValue="Средний">{priorities.map(priority => <option key={priority}>{priority}</option>)}</select></div>
          </div>
          <div className="dialog-actions"><button type="button" className="secondary-button" onClick={() => dialog.current?.close()}>Отмена</button><button type="submit" className="primary-button">Создать задачу</button></div>
        </form>
      </dialog>
    </div>
  );
}
