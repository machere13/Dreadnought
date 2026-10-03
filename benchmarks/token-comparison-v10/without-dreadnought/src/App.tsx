import { useRef, useState, type FormEvent, type KeyboardEvent } from 'react';
import './styles.css';

const statuses = ['К выполнению', 'В работе', 'Готово'] as const;
const priorities = ['Низкий', 'Средний', 'Высокий'] as const;
const tabs = ['Все', ...statuses];
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
  const [tab, setTab] = useState('Все');
  const dialog = useRef<HTMLDialogElement>(null);
  const query = search.trim().toLocaleLowerCase('ru');
  const visibleTasks = tasks.filter(task =>
    (tab === 'Все' || task.status === tab) &&
    [task.title, task.assignee].some(value => value.toLocaleLowerCase('ru').includes(query))
  );

  function createTask(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const values = new FormData(event.currentTarget);
    const title = String(values.get('title')).trim();
    const assignee = String(values.get('assignee')).trim();
    if (!title || !assignee) return;
    setTasks(current => [...current, {
      id: Math.max(...current.map(task => task.id), 0) + 1,
      title,
      assignee,
      status: values.get('status') as Task['status'],
      priority: values.get('priority') as Task['priority'],
    }]);
    setSearch('');
    setTab('Все');
    dialog.current?.close();
  }

  function navigateTabs(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    let next = index;
    if (event.key === 'ArrowRight') next = (index + 1) % tabs.length;
    else if (event.key === 'ArrowLeft') next = (index + tabs.length - 1) % tabs.length;
    else if (event.key === 'Home') next = 0;
    else if (event.key === 'End') next = tabs.length - 1;
    else return;
    event.preventDefault();
    setTab(tabs[next]);
    event.currentTarget.parentElement?.querySelectorAll('button')[next].focus();
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand"><span className="brand-mark">к.</span> команда<span className="brand-dot">•</span></div>
        <div className="workspace-label">РАБОЧЕЕ ПРОСТРАНСТВО</div>
        <nav aria-label="Основная навигация">
          <a href="#board" aria-current="page"><span aria-hidden="true">▦</span> Командная доска</a>
        </nav>
        <div className="sidebar-footer"><span className="team-avatar">К</span><div>Наша команда<small>Общее пространство</small></div></div>
      </aside>

      <main id="board">
        <div className="breadcrumb">Рабочее пространство <span>/</span> Обзор</div>
        <header className="page-header">
          <div><h1>Командная доска</h1><p>Все задачи команды — в одном месте.</p></div>
          <button className="primary" onClick={() => {
            dialog.current?.querySelector('form')?.reset();
            dialog.current?.showModal();
          }}><span aria-hidden="true">＋</span> Новая задача</button>
        </header>

        <section className="stats" aria-label="Сводка задач">
          {[
            ['Всего', tasks.length, 'all'],
            ['В работе', tasks.filter(task => task.status === 'В работе').length, 'progress'],
            ['Готово', tasks.filter(task => task.status === 'Готово').length, 'done'],
          ].map(([label, count, kind]) => (
            <article className="stat" key={label}><div><span className={`stat-dot ${kind}`} />{label}</div><strong>{count}</strong><span className="stat-caption">{label === 'Всего' ? 'задач в пространстве' : label === 'В работе' ? 'в фокусе команды' : 'завершённых задач'}</span></article>
          ))}
        </section>

        <section className="task-section" aria-labelledby="tasks-heading">
          <div className="section-header"><h2 id="tasks-heading">Задачи <span>{tasks.length}</span></h2><label className="search"><span aria-hidden="true">⌕</span><input type="search" aria-label="Поиск задач" placeholder="Поиск задач…" value={search} onChange={event => setSearch(event.target.value)} /></label></div>
          <div className="tabs" role="tablist" aria-label="Статус задач">
            {tabs.map((label, index) => <button key={label} id={`tab-${index}`} role="tab" aria-selected={tab === label} aria-controls="task-panel" tabIndex={tab === label ? 0 : -1} onClick={() => setTab(label)} onKeyDown={event => navigateTabs(event, index)}>{label}</button>)}
          </div>
          <div id="task-panel" role="tabpanel" aria-labelledby={`tab-${tabs.indexOf(tab)}`} tabIndex={0} className="table-scroll">
            <table>
              <thead><tr><th scope="col">Задача</th><th scope="col">Исполнитель</th><th scope="col">Статус</th><th scope="col">Приоритет</th></tr></thead>
              <tbody>{visibleTasks.map(task => <tr key={task.id}>
                <td><span className="task-id">{String(task.id).padStart(2, '0')}</span><span className="task-title">{task.title}</span></td>
                <td><span className="person"><span className="avatar">{task.assignee[0].toLocaleUpperCase('ru')}</span>{task.assignee}</span></td>
                <td><span className="badge" data-status={task.status}><span aria-hidden="true">●</span>{task.status}</span></td>
                <td><span className="priority" data-priority={task.priority}><span aria-hidden="true">▰</span>{task.priority}</span></td>
              </tr>)}</tbody>
            </table>
            {visibleTasks.length === 0 && <p className="empty" role="status">Задачи не найдены</p>}
          </div>
          <div className="table-footer">Показано {visibleTasks.length} из {tasks.length} задач</div>
        </section>
        <p className="page-note"><span aria-hidden="true">◌</span> Хорошая работа начинается с ясного плана.</p>
      </main>

      <dialog ref={dialog} aria-labelledby="dialog-title">
        <form onSubmit={createTask}>
          <h2 id="dialog-title">Новая задача</h2>
          <p className="dialog-description">Добавьте задачу в общее пространство.</p>
          <label>Название задачи<input name="title" required pattern=".*\S.*" title="Введите название, содержащее не только пробелы" autoFocus /></label>
          <label>Исполнитель<input name="assignee" required pattern=".*\S.*" title="Введите имя, содержащее не только пробелы" /></label>
          <div className="form-grid">
            <label>Статус<select name="status" defaultValue="К выполнению">{statuses.map(status => <option key={status}>{status}</option>)}</select></label>
            <label>Приоритет<select name="priority" defaultValue="Средний">{priorities.map(priority => <option key={priority}>{priority}</option>)}</select></label>
          </div>
          <div className="dialog-actions"><button type="button" className="secondary" onClick={() => dialog.current?.close()}>Отмена</button><button type="submit" className="primary">Создать задачу</button></div>
        </form>
      </dialog>
    </div>
  );
}
