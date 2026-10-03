import { useEffect, useMemo, useRef, useState, type FormEvent } from 'react';
import './style.css';

type Status = 'В работе' | 'На проверке' | 'Готово';
type Priority = 'Высокий' | 'Средний' | 'Низкий';
type Task = { id: number; title: string; assignee: string; status: Status; priority: Priority };

const initialTasks: Task[] = [
  { id: 1, title: 'Собрать требования', assignee: 'Анна Смирнова', status: 'В работе', priority: 'Высокий' },
  { id: 2, title: 'Обновить дизайн-систему', assignee: 'Марк Волков', status: 'На проверке', priority: 'Средний' },
  { id: 3, title: 'Подготовить презентацию', assignee: 'Елена Ким', status: 'Готово', priority: 'Низкий' },
  { id: 4, title: 'Настроить аналитику', assignee: 'Дмитрий Орлов', status: 'В работе', priority: 'Средний' },
  { id: 5, title: 'Проверить пользовательские сценарии', assignee: 'Анна Смирнова', status: 'Готово', priority: 'Высокий' },
];

const tabs = ['Все задачи', 'В работе', 'На проверке', 'Готово'] as const;
type Tab = typeof tabs[number];

function App() {
  const [tasks, setTasks] = useState(initialTasks);
  const [search, setSearch] = useState('');
  const [tab, setTab] = useState<Tab>('Все задачи');
  const [modalOpen, setModalOpen] = useState(false);
  const dialog = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    if (modalOpen) dialog.current?.showModal();
  }, [modalOpen]);

  const counts = {
    total: tasks.length,
    active: tasks.filter(task => task.status === 'В работе').length,
    done: tasks.filter(task => task.status === 'Готово').length,
  };

  const visibleTasks = useMemo(() => tasks.filter(task =>
    (tab === 'Все задачи' || task.status === tab) &&
    `${task.title} ${task.assignee} ${task.status} ${task.priority}`.toLocaleLowerCase('ru').includes(search.trim().toLocaleLowerCase('ru'))
  ), [tasks, tab, search]);

  function addTask(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const title = String(data.get('title') ?? '').trim();
    const assignee = String(data.get('assignee') ?? '').trim();
    if (!title || !assignee) return;
    setTasks(current => [{
      id: Date.now(), title, assignee,
      status: String(data.get('status')) as Status,
      priority: String(data.get('priority')) as Priority,
    }, ...current]);
    form.reset();
    setTab('Все задачи');
    setSearch('');
    dialog.current?.close();
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand"><span className="brand-mark">◈</span><span>orbit<span className="brand-dot">.</span></span></div>
        <div className="workspace"><span className="workspace-avatar">S</span><span><strong>Студия Пиксель</strong><small>Рабочее пространство</small></span><span className="workspace-chevron">⌄</span></div>
        <div className="sidebar-label">РАБОЧЕЕ ПРОСТРАНСТВО</div>
        <nav aria-label="Основная навигация">
          <a className="nav-item" href="#overview"><span className="nav-icon">▦</span>Обзор</a>
          <a className="nav-item selected" href="#tasks" aria-current="page"><span className="nav-icon">☷</span>Задачи<span className="nav-count">{counts.total}</span></a>
          <a className="nav-item" href="#team"><span className="nav-icon">♧</span>Команда</a>
          <a className="nav-item" href="#calendar"><span className="nav-icon">▣</span>Календарь</a>
        </nav>
        <div className="sidebar-bottom"><span className="user-avatar">А</span><span><strong>Александр</strong><small>Администратор</small></span><span className="more">···</span></div>
      </aside>

      <main className="main" id="tasks">
        <header className="topbar"><div className="breadcrumbs">Рабочее пространство <span>/</span> <strong>Задачи</strong></div><div className="topbar-right"><span className="today">Октябрь 2026</span><span className="top-avatar">А</span></div></header>
        <div className="content">
          <section className="page-heading"><div><div className="eyebrow"><span className="eyebrow-line" /> ПРОЕКТЫ И ПРОЦЕССЫ</div><h1>Командная доска</h1><p>Все задачи команды в одном месте. Следите за прогрессом и держите фокус на важном.</p></div><button className="primary-button" type="button" onClick={() => setModalOpen(true)}><span>＋</span> Новая задача</button></section>

          <section className="stats" aria-label="Сводка задач">
            <div className="stat-card"><div className="stat-top"><span>Всего задач</span><span className="stat-symbol">☷</span></div><strong>{counts.total.toString().padStart(2, '0')}</strong><small>В командной доске</small></div>
            <div className="stat-card"><div className="stat-top"><span>В работе</span><span className="stat-symbol amber">◷</span></div><strong>{counts.active.toString().padStart(2, '0')}</strong><small>Требуют внимания</small></div>
            <div className="stat-card"><div className="stat-top"><span>Завершено</span><span className="stat-symbol green">✓</span></div><strong>{counts.done.toString().padStart(2, '0')}</strong><small>Задачи выполнены</small></div>
          </section>

          <section className="tasks-section" aria-label="Список задач"><div className="section-title"><div><h2>Задачи <span>{counts.total}</span></h2><p>Управляйте текущими задачами команды</p></div></div>
            <div className="toolbar"><div className="tabs" role="tablist" aria-label="Статус задач">{tabs.map(item => <button key={item} type="button" role="tab" aria-selected={tab === item} className={tab === item ? 'tab active' : 'tab'} onClick={() => setTab(item)}>{item}</button>)}</div><label className="search"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="10.8" cy="10.8" r="6.3"/><path d="m16 16 4.2 4.2"/></svg><input type="search" aria-label="searchbox" placeholder="Поиск задач..." value={search} onChange={event => setSearch(event.target.value)} /></label></div>
            <div className="table-wrap"><table><thead><tr><th>ЗАДАЧА</th><th>ИСПОЛНИТЕЛЬ</th><th>ПРИОРИТЕТ</th><th>СТАТУС</th></tr></thead><tbody>{visibleTasks.map(task => <tr key={task.id}><td><div className="task-title"><span className="task-checkbox" aria-hidden="true">{task.status === 'Готово' ? '✓' : ''}</span><span>{task.title}</span></div></td><td><div className="assignee"><span className="assignee-avatar">{task.assignee.charAt(0).toUpperCase()}</span>{task.assignee}</div></td><td><span className={`priority priority-${task.priority}`}>{task.priority}</span></td><td><span className={`status status-${task.status.replace(' ', '-')}`}><i />{task.status}</span></td></tr>)}</tbody></table>{visibleTasks.length === 0 && <div className="empty">Задачи не найдены</div>}</div>
            <div className="table-footer">Показано {visibleTasks.length} из {tasks.length} задач</div>
          </section>
        </div>
      </main>

      {modalOpen && <dialog ref={dialog} className="task-dialog" onClose={() => setModalOpen(false)} aria-labelledby="dialog-title"><form onSubmit={addTask}><div className="dialog-head"><div><span className="dialog-kicker">КОМАНДНАЯ ДОСКА</span><h2 id="dialog-title">Новая задача</h2></div><button type="button" className="close-button" aria-label="Закрыть" onClick={() => dialog.current?.close()}>×</button></div><div className="dialog-fields"><label>Название задачи<input name="title" autoFocus required placeholder="Например, подготовить отчёт" /></label><label>Исполнитель<input name="assignee" required placeholder="Имя исполнителя" /></label><div className="field-row"><label>Статус<select name="status" defaultValue="В работе"><option>В работе</option><option>На проверке</option><option>Готово</option></select></label><label>Приоритет<select name="priority" defaultValue="Средний"><option>Высокий</option><option>Средний</option><option>Низкий</option></select></label></div></div><div className="dialog-actions"><button type="button" className="secondary-button" onClick={() => dialog.current?.close()}>Отмена</button><button type="submit" className="primary-button">Создать задачу</button></div></form></dialog>}
    </div>
  );
}

export default App;
