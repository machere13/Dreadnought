import { useRef, useState, type FormEvent } from 'react';
import './styles.css';

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
  const [activeTab, setActiveTab] = useState<typeof tabs[number]>('Все');
  const dialog = useRef<HTMLDialogElement>(null);
  const query = search.trim().toLocaleLowerCase('ru');
  const visibleTasks = tasks.filter(task =>
    (activeTab === 'Все' || task.status === activeTab) &&
    `${task.title} ${task.assignee}`.toLocaleLowerCase('ru').includes(query)
  );

  function createTask(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const title = String(data.get('title')).trim();
    const assignee = String(data.get('assignee')).trim();
    if (!title || !assignee) return;
    setTasks(previous => [...previous, {
      id: Math.max(...previous.map(task => task.id), 0) + 1,
      title,
      assignee,
      status: data.get('status') as Task['status'],
      priority: data.get('priority') as Task['priority'],
    }]);
    setSearch('');
    setActiveTab('Все');
    event.currentTarget.reset();
    dialog.current?.close();
  }

  return (
    <div className="workspace">
      <aside className="sidebar">
        <div className="brand"><span className="brand-mark">К</span> Команда<span className="brand-dot">.</span></div>
        <div className="nav-caption">РАБОЧЕЕ ПРОСТРАНСТВО</div>
        <nav aria-label="Основная навигация">
          <a className="nav-link" href="#board" aria-current="page"><span aria-hidden="true">▦</span> Командная доска</a>
        </nav>
        <div className="sidebar-footer"><span className="avatar">К</span><div>Наша команда<small>Общее пространство</small></div></div>
      </aside>

      <main id="board">
        <div className="eyebrow">РАБОЧЕЕ ПРОСТРАНСТВО <span>/</span> ОБЗОР</div>
        <header className="page-header">
          <div><h1>Командная доска</h1><p>Все задачи команды в одном месте.</p></div>
          <button className="primary" onClick={() => dialog.current?.showModal()}><span aria-hidden="true">＋</span> Новая задача</button>
        </header>

        <section className="stats" aria-label="Статистика задач">
          {[
            ['Всего', tasks.length, 'Все задачи команды'],
            ['В работе', tasks.filter(task => task.status === 'В работе').length, 'В процессе выполнения'],
            ['Готово', tasks.filter(task => task.status === 'Готово').length, 'Завершённые задачи'],
          ].map(([label, count, description], index) => (
            <article className="stat" key={label}>
              <div className="stat-label"><span>{label}</span><span className={`stat-symbol symbol-${index}`} aria-hidden="true">{['▦', '◷', '✓'][index]}</span></div>
              <strong>{count}</strong><small>{description}</small>
            </article>
          ))}
        </section>

        <section className="task-section" aria-labelledby="tasks-heading">
          <div className="section-header"><h2 id="tasks-heading">Задачи <span>{tasks.length}</span></h2><label className="search"><span aria-hidden="true">⌕</span><input aria-label="Поиск задач" placeholder="Поиск задач…" value={search} onChange={event => setSearch(event.target.value)} /></label></div>
          <div className="tabs" role="tablist" aria-label="Фильтр по статусу">
            {tabs.map((tab, index) => <button
              key={tab}
              id={`tab-${index}`}
              role="tab"
              aria-selected={activeTab === tab}
              aria-controls="task-panel"
              tabIndex={activeTab === tab ? 0 : -1}
              onClick={() => setActiveTab(tab)}
              onKeyDown={event => {
                let next = index;
                if (event.key === 'ArrowRight') next = (index + 1) % tabs.length;
                else if (event.key === 'ArrowLeft') next = (index + tabs.length - 1) % tabs.length;
                else if (event.key === 'Home') next = 0;
                else if (event.key === 'End') next = tabs.length - 1;
                else return;
                event.preventDefault();
                setActiveTab(tabs[next]);
                event.currentTarget.parentElement?.querySelectorAll('button')[next].focus();
              }}
            >{tab}</button>)}
          </div>
          <div id="task-panel" role="tabpanel" aria-labelledby={`tab-${tabs.indexOf(activeTab)}`} tabIndex={0} className="table-scroll">
            <table>
              <thead><tr><th scope="col">Задача</th><th scope="col">Исполнитель</th><th scope="col">Статус</th><th scope="col">Приоритет</th></tr></thead>
              <tbody>
                {visibleTasks.map(task => <tr key={task.id}>
                  <td><div className="task-title"><span className="task-id">{String(task.id).padStart(2, '0')}</span>{task.title}</div></td>
                  <td><div className="person"><span className={`avatar avatar-${task.id % 3}`}>{task.assignee.slice(0, 1).toUpperCase()}</span>{task.assignee}</div></td>
                  <td><span className={`badge status-${statuses.indexOf(task.status)}`}><span aria-hidden="true">●</span>{task.status}</span></td>
                  <td><span className={`priority priority-${priorities.indexOf(task.priority)}`}><span aria-hidden="true">▥</span>{task.priority}</span></td>
                </tr>)}
                {visibleTasks.length === 0 && <tr><td colSpan={4} className="empty">Задачи не найдены</td></tr>}
              </tbody>
            </table>
          </div>
          <div className="table-footer" aria-live="polite">Показано {visibleTasks.length} из {tasks.length}</div>
        </section>
      </main>

      <dialog ref={dialog} aria-labelledby="dialog-title">
        <form onSubmit={createTask}>
          <h2 id="dialog-title">Новая задача</h2>
          <p>Добавьте задачу в командную доску.</p>
          <label>Название задачи<input name="title" required pattern=".*\S.*" title="Введите название задачи, не только пробелы" autoFocus /></label>
          <label>Исполнитель<input name="assignee" required pattern=".*\S.*" title="Введите имя исполнителя, не только пробелы" /></label>
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
