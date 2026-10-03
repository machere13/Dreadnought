import { useRef, useState, type FormEvent } from 'react';

type Status = 'К выполнению' | 'В работе' | 'Готово';
type Priority = 'Высокий' | 'Средний' | 'Низкий';
type Task = { id: number; title: string; assignee: string; status: Status; priority: Priority };
type Filter = 'Все' | 'В работе' | 'Готово';

const initialTasks: Task[] = [
  { id: 1, title: 'Собрать требования', assignee: 'Анна', status: 'Готово', priority: 'Высокий' },
  { id: 2, title: 'Нарисовать макет', assignee: 'Максим', status: 'В работе', priority: 'Средний' },
  { id: 3, title: 'Проверить доступность', assignee: 'Ирина', status: 'К выполнению', priority: 'Высокий' },
  { id: 4, title: 'Подключить API', assignee: 'Павел', status: 'В работе', priority: 'Высокий' },
  { id: 5, title: 'Написать тесты', assignee: 'Ольга', status: 'К выполнению', priority: 'Средний' },
  { id: 6, title: 'Подготовить релиз', assignee: 'Анна', status: 'К выполнению', priority: 'Низкий' },
];

const filters: Filter[] = ['Все', 'В работе', 'Готово'];

export default function App() {
  const [tasks, setTasks] = useState(initialTasks);
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<Filter>('Все');
  const dialog = useRef<HTMLDialogElement>(null);
  const form = useRef<HTMLFormElement>(null);

  const visible = tasks.filter((task) => {
    const text = `${task.title} ${task.assignee}`.toLocaleLowerCase('ru');
    return (filter === 'Все' || task.status === filter) && text.includes(query.trim().toLocaleLowerCase('ru'));
  });

  function addTask(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const title = String(data.get('title') ?? '').trim();
    const assignee = String(data.get('assignee') ?? '').trim();
    if (!title || !assignee) return;
    setTasks((current) => [...current, {
      id: Math.max(0, ...current.map((task) => task.id)) + 1,
      title, assignee, status: 'К выполнению', priority: 'Средний',
    }]);
    form.current?.reset();
    dialog.current?.close();
    setFilter('Все');
    setQuery('');
  }

  return <div className="app-shell">
    <aside className="sidebar" aria-label="Навигация">
      <div className="brand"><span className="brand-mark">◈</span><span>orbit<span className="brand-dot">.</span></span></div>
      <div className="sidebar-caption">РАБОЧЕЕ ПРОСТРАНСТВО</div>
      <div className="sidebar-link active"><span className="nav-symbol">▦</span> Командная доска</div>
      <div className="sidebar-spacer" />
      <div className="workspace"><span className="workspace-avatar">К</span><span><strong>Команда проекта</strong><small>Рабочее пространство</small></span></div>
    </aside>
    <main className="main-content">
      <div className="topline">Рабочее пространство <span className="crumb-separator">/</span> <strong>Командная доска</strong></div>
      <div className="page-content">
        <header className="page-header"><div><div className="eyebrow"><span className="live-dot" /> ПРОЕКТ В ДВИЖЕНИИ</div><h1>Командная доска</h1><p>Все задачи команды в одном месте. Следите за прогрессом и двигайтесь дальше.</p></div><button className="primary-button" type="button" onClick={() => dialog.current?.showModal()}><span aria-hidden="true">＋</span> Новая задача</button></header>
        <section className="stats" aria-label="Сводка по задачам">
          <article className="stat-card"><div className="stat-heading">Всего задач <span className="stat-icon all">▦</span></div><div className="stat-value">{tasks.length}<span className="stat-unit">задач</span></div><div className="stat-foot">В вашем рабочем пространстве</div></article>
          <article className="stat-card"><div className="stat-heading">В работе <span className="stat-icon progress">◷</span></div><div className="stat-value">{tasks.filter((task) => task.status === 'В работе').length}<span className="stat-unit">задачи</span></div><div className="stat-foot"><span className="foot-dot orange" /> Сейчас выполняются</div></article>
          <article className="stat-card"><div className="stat-heading">Готово <span className="stat-icon done">✓</span></div><div className="stat-value">{tasks.filter((task) => task.status === 'Готово').length}<span className="stat-unit">задача</span></div><div className="stat-foot"><span className="foot-dot green" /> Успешно завершены</div></article>
        </section>
        <section className="task-panel" aria-labelledby="tasks-heading">
          <div className="panel-heading"><h2 id="tasks-heading">Задачи <span className="count-badge">{tasks.length}</span></h2><p>Обзор и управление задачами команды</p></div>
          <div className="toolbar"><div className="tabs" role="group" aria-label="Фильтр по статусу">{filters.map((item) => <button key={item} className={filter === item ? 'tab selected' : 'tab'} type="button" aria-pressed={filter === item} onClick={() => setFilter(item)}>{item}</button>)}</div><label className="search"><span className="search-icon" aria-hidden="true">⌕</span><span className="sr-only">Поиск по названию и исполнителю</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Поиск задач..." type="search" /></label></div>
          <div className="table-wrap"><table><thead><tr><th scope="col">ЗАДАЧА</th><th scope="col">ИСПОЛНИТЕЛЬ</th><th scope="col">СТАТУС</th><th scope="col">ПРИОРИТЕТ</th></tr></thead><tbody>{visible.map((task) => <tr key={task.id}><td><span className="task-index">{String(task.id).padStart(2, '0')}</span><strong className="task-title">{task.title}</strong></td><td><span className="person-avatar">{task.assignee.charAt(0).toLocaleUpperCase('ru')}</span>{task.assignee}</td><td><span className={`status status-${task.status === 'Готово' ? 'done' : task.status === 'В работе' ? 'progress' : 'todo'}`}><span className="status-dot" />{task.status}</span></td><td><span className={`priority priority-${task.priority === 'Высокий' ? 'high' : task.priority === 'Средний' ? 'medium' : 'low'}`}><span aria-hidden="true">▂▅▇</span>{task.priority}</span></td></tr>)}</tbody></table>{visible.length === 0 && <div className="empty-state"><div className="empty-icon">⌕</div><strong>Задачи не найдены</strong><p>Попробуйте изменить запрос или выбрать другой фильтр.</p></div>}</div>
          <div className="panel-footer">Показано {visible.length} из {tasks.length} задач</div>
        </section><footer className="page-footer">© 2026 orbit. Командная работа без лишнего шума.</footer>
      </div>
    </main>
    <dialog ref={dialog} className="task-dialog" onClose={() => form.current?.reset()} aria-labelledby="dialog-title"><form ref={form} onSubmit={addTask}><div className="dialog-top"><div><div className="eyebrow">НОВАЯ ЗАДАЧА</div><h2 id="dialog-title">Создать задачу</h2><p>Добавьте задачу в командную доску.</p></div><button className="close-button" type="button" onClick={() => dialog.current?.close()} aria-label="Закрыть форму">×</button></div><label className="field">Название задачи<input name="title" required maxLength={120} autoFocus placeholder="Например, обновить главную страницу" /></label><label className="field">Исполнитель<input name="assignee" required maxLength={80} placeholder="Имя исполнителя" /></label><div className="dialog-actions"><button className="secondary-button" type="button" onClick={() => dialog.current?.close()}>Отмена</button><button className="primary-button" type="submit">Создать задачу</button></div></form></dialog>
  </div>;
}
