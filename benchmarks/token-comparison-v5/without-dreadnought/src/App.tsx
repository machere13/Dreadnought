import { useEffect, useState, type FormEvent } from 'react';

type Status = 'К выполнению' | 'В работе' | 'Готово';
type Priority = 'Высокий' | 'Средний' | 'Низкий';
type Task = { id: number; title: string; assignee: string; status: Status; priority: Priority };
type Filter = 'Все' | 'В работе' | 'Готово';

const initialTasks: Task[] = [
  { id: 1, title: 'Собрать требования', assignee: 'Анна', status: 'В работе', priority: 'Высокий' },
  { id: 2, title: 'Сверстать прототип', assignee: 'Борис', status: 'Готово', priority: 'Средний' },
  { id: 3, title: 'Проверить сценарии', assignee: 'Вера', status: 'К выполнению', priority: 'Низкий' },
];

const filters: Filter[] = ['Все', 'В работе', 'Готово'];

export default function App() {
  const [tasks, setTasks] = useState(initialTasks);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<Filter>('Все');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const visibleTasks = tasks.filter(task =>
    task.title.toLocaleLowerCase('ru').includes(search.trim().toLocaleLowerCase('ru')) &&
    (filter === 'Все' || task.status === filter)
  );

  useEffect(() => {
    if (!isModalOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsModalOpen(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isModalOpen]);

  function addTask(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const title = String(data.get('title') ?? '').trim();
    const assignee = String(data.get('assignee') ?? '').trim();
    if (!title || !assignee) return;
    setTasks(current => [...current, {
      id: Date.now(),
      title,
      assignee,
      status: String(data.get('status')) as Status,
      priority: String(data.get('priority')) as Priority,
    }]);
    setIsModalOpen(false);
  }

  return (
    <div className="app-shell">
      <aside className="sidebar" aria-label="Основная навигация">
        <a className="brand" href="#overview" aria-label="Командная доска — на главную">
          <span className="brand-mark" aria-hidden="true"><span /><span /><span /><span /></span>
          <span>teamspace<span className="brand-dot">.</span></span>
        </a>
        <div className="workspace-label">РАБОЧЕЕ ПРОСТРАНСТВО</div>
        <nav aria-label="Разделы">
          <a className="nav-link" href="#overview"><span className="nav-icon" aria-hidden="true">▦</span>Обзор</a>
          <a className="nav-link active" href="#tasks" aria-current="page"><span className="nav-icon" aria-hidden="true">☷</span>Задачи<span className="nav-count">{tasks.length}</span></a>
          <a className="nav-link" href="#team"><span className="nav-icon" aria-hidden="true">♙</span>Команда</a>
        </nav>
        <div className="sidebar-bottom"><span className="profile-avatar">К</span><span><strong>Команда проекта</strong><small>Рабочее пространство</small></span><span className="profile-menu" aria-hidden="true">⋯</span></div>
      </aside>

      <div className="main-shell" id="overview">
        <header className="topbar">
          <div className="topbar-title"><span className="breadcrumb-muted">Рабочее пространство</span><span className="breadcrumb-slash">/</span><span>Командная доска</span></div>
          <button className="new-button" type="button" onClick={() => setIsModalOpen(true)}><span aria-hidden="true">＋</span>Новая задача</button>
        </header>

        <main className="content" id="tasks">
          <div className="page-heading"><div><p className="eyebrow">ПРОЕКТ / ЗАДАЧИ</p><h1>Все задачи</h1><p className="lead">Следите за работой команды и держите важное под контролем.</p></div><span className="heading-decoration" aria-hidden="true">01 / 03</span></div>

          <section className="stats" aria-label="Сводка по задачам">
            <div className="stat-card"><div className="stat-top"><span>Всего задач</span><span className="stat-icon total" aria-hidden="true">▦</span></div><strong>{tasks.length.toString().padStart(2, '0')}</strong><div className="stat-foot"><span className="stat-line" />В вашем пространстве</div></div>
            <div className="stat-card"><div className="stat-top"><span>В работе</span><span className="stat-icon progress" aria-hidden="true">◷</span></div><strong>{tasks.filter(task => task.status === 'В работе').length.toString().padStart(2, '0')}</strong><div className="stat-foot"><span className="stat-line amber" />Активные задачи</div></div>
            <div className="stat-card"><div className="stat-top"><span>Готово</span><span className="stat-icon done" aria-hidden="true">✓</span></div><strong>{tasks.filter(task => task.status === 'Готово').length.toString().padStart(2, '0')}</strong><div className="stat-foot"><span className="stat-line green" />Завершённые задачи</div></div>
          </section>

          <section className="task-panel" aria-labelledby="task-list-title">
            <div className="panel-heading"><div><h2 id="task-list-title">Задачи команды</h2><p>Управляйте задачами в одном месте</p></div><span className="task-total">{tasks.length} задачи</span></div>
            <div className="toolbar"><div className="tabs" role="tablist" aria-label="Фильтр по статусу">{filters.map(item => <button key={item} type="button" role="tab" aria-selected={filter === item} className={filter === item ? 'tab active' : 'tab'} onClick={() => setFilter(item)}>{item}</button>)}</div><label className="search-field"><span className="search-icon" aria-hidden="true">⌕</span><span className="sr-only">Поиск по названию задачи</span><input type="search" value={search} onChange={event => setSearch(event.target.value)} placeholder="Поиск задач..." aria-label="Поиск по названию задачи" /></label></div>
            <div className="table-scroll"><table id="team"><thead><tr><th scope="col">Задача</th><th scope="col">Исполнитель</th><th scope="col">Статус</th><th scope="col">Приоритет</th></tr></thead><tbody>{visibleTasks.map(task => <tr key={task.id}><td className="task-title"><span className="task-check" aria-hidden="true">{task.status === 'Готово' ? '✓' : ''}</span>{task.title}</td><td><span className="assignee"><span className="avatar" aria-hidden="true">{task.assignee[0].toLocaleUpperCase('ru')}</span>{task.assignee}</span></td><td><span className={`badge status-${task.status === 'В работе' ? 'progress' : task.status === 'Готово' ? 'done' : 'todo'}`}><span className="badge-dot" />{task.status}</span></td><td><span className={`priority priority-${task.priority === 'Высокий' ? 'high' : task.priority === 'Средний' ? 'medium' : 'low'}`}><span className="priority-mark" aria-hidden="true">≡</span>{task.priority}</span></td></tr>)}</tbody></table>{visibleTasks.length === 0 && <div className="empty-state">Задачи не найдены</div>}</div>
            <div className="panel-footer">Показано {visibleTasks.length} из {tasks.length} задач</div>
          </section>
          <p className="page-footer">КОМАНДНАЯ ДОСКА <span>© 2026</span></p>
        </main>
      </div>

      {isModalOpen && <div className="modal-backdrop" onMouseDown={event => { if (event.target === event.currentTarget) setIsModalOpen(false); }}><div className="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title"><div className="modal-heading"><div><p className="eyebrow">НОВАЯ ЗАДАЧА</p><h2 id="modal-title">Добавить задачу</h2></div><button className="close-button" type="button" aria-label="Закрыть окно" onClick={() => setIsModalOpen(false)}>×</button></div><form onSubmit={addTask}><label className="form-field">Название задачи<input name="title" required autoFocus placeholder="Например, Подготовить презентацию" /></label><label className="form-field">Исполнитель<input name="assignee" required placeholder="Имя исполнителя" /></label><div className="form-row"><label className="form-field">Статус<select name="status" defaultValue="К выполнению"><option>К выполнению</option><option>В работе</option><option>Готово</option></select></label><label className="form-field">Приоритет<select name="priority" defaultValue="Средний"><option>Низкий</option><option>Средний</option><option>Высокий</option></select></label></div><div className="form-actions"><button className="cancel-button" type="button" onClick={() => setIsModalOpen(false)}>Отмена</button><button className="new-button" type="submit">Сохранить задачу</button></div></form></div></div>}
    </div>
  );
}
