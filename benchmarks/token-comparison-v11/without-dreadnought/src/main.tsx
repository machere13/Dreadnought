import { useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import './style.css';

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
  const [query, setQuery] = useState('');
  const [activeTab, setActiveTab] = useState('Все');
  const dialog = useRef<HTMLDialogElement>(null);
  const tablist = useRef<HTMLDivElement>(null);
  const filtered = tasks.filter(task =>
    (activeTab === 'Все' || task.status === activeTab) &&
    `${task.title} ${task.assignee}`.toLocaleLowerCase().includes(query.trim().toLocaleLowerCase()),
  );

  return (
    <div className="app">
      <aside className="sidebar">
        <a className="brand" href="#board" aria-label="Команда — главная"><span className="brand-mark">к</span> команда<span className="brand-dot">.</span></a>
        <div className="workspace"><span className="workspace-icon">П</span><div>Продуктовая команда<small>Рабочее пространство</small></div></div>
        <p className="nav-label">РАБОЧЕЕ ПРОСТРАНСТВО</p>
        <nav aria-label="Основная навигация"><a className="nav-item" href="#board" aria-current="page"><span aria-hidden="true">▦</span> Командная доска</a></nav>
        <div className="sidebar-footer"><span className="avatar profile">В</span><div>Ваша команда<small>Всё начинается с задачи</small></div></div>
      </aside>

      <main id="board">
        <div className="breadcrumb">Рабочее пространство <span aria-hidden="true">/</span> <span>Обзор задач</span></div>
        <header className="page-header">
          <div><div className="eyebrow">ВМЕСТЕ К РЕЗУЛЬТАТУ</div><h1>Командная доска</h1><p>Все задачи команды в одном месте.</p></div>
          <button className="primary" onClick={() => { dialog.current?.querySelector('form')?.reset(); dialog.current?.showModal(); }}><span aria-hidden="true">＋</span> Новая задача</button>
        </header>

        <section className="stats" aria-label="Статистика задач">
          {[
            { label: 'Всего', value: tasks.length, note: 'Задач в пространстве', icon: '▦', className: 'total' },
            { label: 'В работе', value: tasks.filter(task => task.status === 'В работе').length, note: 'Двигаемся к цели', icon: '◷', className: 'progress' },
            { label: 'Готово', value: tasks.filter(task => task.status === 'Готово').length, note: 'Отличная работа', icon: '✓', className: 'done' },
          ].map(stat => <article className={`stat ${stat.className}`} key={stat.label}><div className="stat-top"><h2>{stat.label}</h2><span className="stat-icon" aria-hidden="true">{stat.icon}</span></div><strong>{stat.value}</strong><p>{stat.note}</p></article>)}
        </section>

        <section className="task-panel" aria-labelledby="tasks-title">
          <div className="panel-heading"><div><h2 id="tasks-title">Задачи команды <span className="count">{tasks.length}</span></h2><p>Планируйте, следите за прогрессом и завершайте.</p></div><label className="search"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true"><circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 4.5 4.5"/></svg><input aria-label="Поиск задач" placeholder="Поиск задач…" value={query} onChange={event => setQuery(event.target.value)} /></label></div>
          <div className="tabs" role="tablist" aria-label="Фильтр по статусу" ref={tablist}>
            {tabs.map((tab, index) => <button key={tab} id={`tab-${index}`} role="tab" aria-selected={activeTab === tab} aria-controls="task-results" tabIndex={activeTab === tab ? 0 : -1} onClick={() => setActiveTab(tab)} onKeyDown={event => {
              let next = index;
              if (event.key === 'ArrowRight') next = (index + 1) % tabs.length;
              else if (event.key === 'ArrowLeft') next = (index + tabs.length - 1) % tabs.length;
              else if (event.key === 'Home') next = 0;
              else if (event.key === 'End') next = tabs.length - 1;
              else return;
              event.preventDefault();
              setActiveTab(tabs[next]);
              tablist.current?.querySelectorAll('button')[next].focus();
            }}>{tab}</button>)}
          </div>
          <div id="task-results" role="tabpanel" aria-labelledby={`tab-${tabs.indexOf(activeTab)}`} tabIndex={0} className="table-scroll">
            <table><thead><tr><th>Задача</th><th>Исполнитель</th><th>Статус</th><th>Приоритет</th></tr></thead><tbody>
              {filtered.map(task => <tr key={task.id}><td><span className="task-number">{String(task.id).padStart(2, '0')}</span><span className="task-title">{task.title}</span></td><td><span className="person"><span className={`avatar avatar-${task.id % 3}`}>{task.assignee.slice(0, 1).toUpperCase()}</span>{task.assignee}</span></td><td><span className={`badge status-${statuses.indexOf(task.status as typeof statuses[number])}`}><span aria-hidden="true" />{task.status}</span></td><td><span className={`priority priority-${task.priority}`}><span aria-hidden="true">{task.priority === 'Высокий' ? '↑' : task.priority === 'Низкий' ? '↓' : '–'}</span>{task.priority}</span></td></tr>)}
              {!filtered.length && <tr><td className="empty" colSpan={4}>Задачи не найдены</td></tr>}
            </tbody></table>
          </div>
          <div className="panel-footer" aria-live="polite">Показано задач: {filtered.length} из {tasks.length}<span><span className="live-dot" /> Локальное пространство</span></div>
        </section>
        <p className="page-note">Маленькие шаги. Общий результат.</p>
      </main>

      <dialog ref={dialog} aria-labelledby="dialog-title">
        <form onSubmit={event => {
          event.preventDefault();
          const data = new FormData(event.currentTarget);
          const title = String(data.get('title')).trim();
          const assignee = String(data.get('assignee')).trim();
          if (!title || !assignee) return;
          setTasks(previous => [...previous, { id: Math.max(...previous.map(task => task.id)) + 1, title, assignee, status: String(data.get('status')), priority: String(data.get('priority')) }]);
          setQuery('');
          setActiveTab('Все');
          dialog.current?.close();
        }}>
          <div className="eyebrow">СЛЕДУЮЩИЙ ШАГ</div><h2 id="dialog-title">Новая задача</h2><p className="dialog-description">Добавьте задачу в планы команды.</p>
          <label>Название задачи<input name="title" required pattern=".*\S.*" title="Введите название задачи, а не только пробелы" autoFocus placeholder="Что нужно сделать?" /></label>
          <label>Исполнитель<input name="assignee" required pattern=".*\S.*" title="Введите имя исполнителя, а не только пробелы" placeholder="Имя участника команды" /></label>
          <div className="form-row"><label>Статус<select name="status">{statuses.map(status => <option key={status}>{status}</option>)}</select></label><label>Приоритет<select name="priority" defaultValue="Средний">{['Низкий', 'Средний', 'Высокий'].map(priority => <option key={priority}>{priority}</option>)}</select></label></div>
          <div className="dialog-actions"><button type="button" className="secondary" onClick={() => dialog.current?.close()}>Отмена</button><button className="primary" type="submit">Создать задачу</button></div>
        </form>
      </dialog>
    </div>
  );
}

createRoot(document.getElementById('root')!).render(<App />);
