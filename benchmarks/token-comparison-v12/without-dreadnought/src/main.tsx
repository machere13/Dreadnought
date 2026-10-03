import { useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import './styles.css';

const statuses = ['К выполнению', 'В работе', 'Готово'] as const;
const tabs = ['Все', ...statuses];
type Task = { id: number; title: string; assignee: string; status: string; priority: string };
const initialTasks: Task[] = [
  { id: 1, title: 'Собрать требования', assignee: 'Анна', status: 'В работе', priority: 'Высокий' },
  { id: 2, title: 'Проверить макет', assignee: 'Борис', status: 'К выполнению', priority: 'Средний' },
  { id: 3, title: 'Подготовить релиз', assignee: 'Вера', status: 'Готово', priority: 'Низкий' },
];

function App() {
  const [tasks, setTasks] = useState(initialTasks);
  const [search, setSearch] = useState('');
  const [tab, setTab] = useState('Все');
  const dialog = useRef<HTMLDialogElement>(null);
  const visibleTasks = tasks.filter(task =>
    (tab === 'Все' || task.status === tab) &&
    `${task.title} ${task.assignee}`.toLocaleLowerCase().includes(search.trim().toLocaleLowerCase())
  );

  function createTask(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const title = String(data.get('title')).trim();
    const assignee = String(data.get('assignee')).trim();
    if (!title || !assignee) return;
    setTasks([...tasks, { id: Math.max(...tasks.map(task => task.id)) + 1, title, assignee,
      status: String(data.get('status')), priority: String(data.get('priority')) }]);
    setSearch('');
    setTab('Все');
    dialog.current?.close();
  }

  return <div className="app">
    <aside className="sidebar">
      <a className="brand" href="#board"><span className="brand-mark" aria-hidden="true">▦</span> Контур<span className="brand-dot">.</span></a>
      <div className="workspace"><span className="workspace-avatar">К</span><div>Рабочее пространство<small>Наша команда</small></div></div>
      <p className="nav-label">ПРОЕКТ</p>
      <nav aria-label="Основная навигация"><a className="nav-item" href="#board" aria-current="page"><span aria-hidden="true">▦</span> Командная доска</a></nav>
      <div className="sidebar-bottom"><span className="online-dot" /> Всё начинается с команды</div>
    </aside>

    <main id="board">
      <div className="topbar"><span>Рабочее пространство <span className="slash">/</span> <strong>Обзор проекта</strong></span><span className="team-icon" aria-label="Наша команда">К</span></div>
      <div className="content">
        <header className="page-header"><div><p className="eyebrow">РАБОТА В ОДНОМ МЕСТЕ</p><h1>Командная доска</h1><p className="subtitle">Общий план. Понятные задачи. Видимый результат.</p></div>
          <button className="primary" onClick={() => { dialog.current?.querySelector('form')?.reset(); dialog.current?.showModal(); }}><span aria-hidden="true">＋</span> Новая задача</button>
        </header>

        <section className="stats" aria-label="Сводка по всем задачам">
          {[['Всего', tasks.length, 'Все задачи команды'], ['В работе', tasks.filter(t => t.status === 'В работе').length, 'Двигаемся к результату'], ['Готово', tasks.filter(t => t.status === 'Готово').length, 'Завершённые задачи']].map(([label, count, note], index) =>
            <article className="stat" key={label}><div className="stat-heading"><h2>{label}</h2><span className={`stat-icon icon-${index}`} aria-hidden="true">{['▦', '◷', '✓'][index]}</span></div><div className="stat-number">{count}<span>{note}</span></div></article>
          )}
        </section>

        <section className="task-section" aria-labelledby="tasks-heading">
          <div className="section-heading"><h2 id="tasks-heading">Задачи команды <span>{tasks.length}</span></h2><span className="section-note">Каждая задача — шаг вперёд</span></div>
          <div className="toolbar">
            <div className="tabs" role="tablist" aria-label="Фильтр по статусу">
              {tabs.map((name, index) => <button key={name} id={`tab-${index}`} role="tab" aria-selected={tab === name} aria-controls="task-panel" tabIndex={tab === name ? 0 : -1} onClick={() => setTab(name)} onKeyDown={event => {
                let next = index;
                if (event.key === 'ArrowRight') next = (index + 1) % tabs.length;
                else if (event.key === 'ArrowLeft') next = (index + tabs.length - 1) % tabs.length;
                else if (event.key === 'Home') next = 0;
                else if (event.key === 'End') next = tabs.length - 1;
                else return;
                event.preventDefault();
                setTab(tabs[next]);
                document.getElementById(`tab-${next}`)?.focus();
              }}>{name}</button>)}
            </div>
            <label className="search"><svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true"><circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 5 5"/></svg><input aria-label="Поиск задач" type="search" placeholder="Поиск задач…" value={search} onChange={event => setSearch(event.target.value)} /></label>
          </div>
          <div id="task-panel" role="tabpanel" aria-labelledby={`tab-${tabs.indexOf(tab)}`}>
            <div className="table-scroll" tabIndex={0} aria-label="Таблица задач">
              <table><thead><tr><th>Задача</th><th>Исполнитель</th><th>Статус</th><th>Приоритет</th></tr></thead><tbody>
                {visibleTasks.map(task => <tr key={task.id}>
                  <td><span className="task-id">{String(task.id).padStart(2, '0')}</span><span className="task-title">{task.title}</span></td>
                  <td><span className="person"><span className={`avatar avatar-${task.id % 3}`} aria-hidden="true">{task.assignee.slice(0, 1).toUpperCase()}</span>{task.assignee}</span></td>
                  <td><span className="badge" data-status={task.status}><span />{task.status}</span></td>
                  <td><span className="priority" data-priority={task.priority}><span className="priority-bars" aria-hidden="true"><i/><i/><i/></span>{task.priority}</span></td>
                </tr>)}
                {!visibleTasks.length && <tr><td className="empty" colSpan={4}>Задачи не найдены</td></tr>}
              </tbody></table>
            </div>
            <div className="table-footer" aria-live="polite">Показано {visibleTasks.length} из {tasks.length}<span>Всё важное — перед глазами</span></div>
          </div>
        </section>
        <footer className="page-footer"><span className="online-dot"/> Пространство для совместной работы</footer>
      </div>
    </main>

    <dialog ref={dialog} aria-labelledby="dialog-title">
      <form onSubmit={createTask}>
        <div className="dialog-heading"><div><p className="eyebrow">НОВЫЙ ШАГ</p><h2 id="dialog-title">Новая задача</h2></div><button type="button" className="close" aria-label="Закрыть диалог" onClick={() => dialog.current?.close()}>×</button></div>
        <p className="dialog-description">Добавьте задачу в общий план команды.</p>
        <label>Название задачи<input autoFocus name="title" required pattern=".*\S.*" title="Введите название, содержащее не только пробелы" placeholder="Что нужно сделать?" /></label>
        <label>Исполнитель<input name="assignee" required pattern=".*\S.*" title="Введите имя, содержащее не только пробелы" placeholder="Имя участника" /></label>
        <div className="form-row"><label>Статус<select name="status">{statuses.map(status => <option key={status}>{status}</option>)}</select></label><label>Приоритет<select name="priority" defaultValue="Средний">{['Низкий', 'Средний', 'Высокий'].map(priority => <option key={priority}>{priority}</option>)}</select></label></div>
        <div className="dialog-actions"><button className="secondary" type="button" onClick={() => dialog.current?.close()}>Отмена</button><button className="primary" type="submit">Создать задачу</button></div>
      </form>
    </dialog>
  </div>;
}

createRoot(document.getElementById('root')!).render(<App />);
