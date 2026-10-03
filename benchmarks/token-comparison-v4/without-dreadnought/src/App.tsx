import { useRef, useState, type FormEvent } from 'react';

type Status = 'К выполнению' | 'В работе' | 'Готово';
type Priority = 'Низкий' | 'Средний' | 'Высокий';
type Task = { id: number; title: string; assignee: string; status: Status; priority: Priority };

const initialTasks: Task[] = [
  { id: 1, title: 'Собрать требования', assignee: 'Анна', status: 'В работе', priority: 'Высокий' },
  { id: 2, title: 'Сверстать прототип', assignee: 'Борис', status: 'Готово', priority: 'Средний' },
  { id: 3, title: 'Проверить сценарии', assignee: 'Вера', status: 'К выполнению', priority: 'Низкий' },
];

const tabs = ['Все', 'В работе', 'Готово'] as const;
type Tab = typeof tabs[number];

export default function App() {
  const [tasks, setTasks] = useState(initialTasks);
  const [query, setQuery] = useState('');
  const [tab, setTab] = useState<Tab>('Все');
  const dialog = useRef<HTMLDialogElement>(null);
  const nextId = useRef(4);

  const visibleTasks = tasks.filter(task =>
    (tab === 'Все' || task.status === tab) &&
    task.title.toLocaleLowerCase('ru').includes(query.trim().toLocaleLowerCase('ru'))
  );

  function addTask(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const title = String(data.get('title') ?? '').trim();
    const assignee = String(data.get('assignee') ?? '').trim();
    if (!title || !assignee) return;

    setTasks(current => [...current, {
      id: nextId.current++,
      title,
      assignee,
      status: data.get('status') as Status,
      priority: data.get('priority') as Priority,
    }]);
    form.reset();
    dialog.current?.close();
  }

  return (
    <div className="app-shell">
      <aside className="sidebar" aria-label="Боковая панель">
        <div className="brand-mark" aria-hidden="true">◆</div>
        <div className="sidebar-label">Рабочее пространство</div>
        <nav aria-label="Основная навигация">
          <a href="#overview"><span aria-hidden="true">◫</span> Обзор</a>
          <a className="active" href="#tasks" aria-current="page"><span aria-hidden="true">☷</span> Задачи</a>
          <a href="#team"><span aria-hidden="true">♙</span> Команда</a>
        </nav>
        <div className="sidebar-footer">Команда / Проекты</div>
      </aside>

      <div className="workspace">
        <header className="topbar">
          <div className="topbar-title"><span className="topbar-dot" aria-hidden="true" />Командная доска</div>
          <button className="primary-button" type="button" onClick={() => dialog.current?.showModal()}>
            <span aria-hidden="true">＋</span> Новая задача
          </button>
        </header>

        <main>
          <div className="page-heading">
            <div className="eyebrow">РАБОЧЕЕ ПРОСТРАНСТВО <span>/</span> ЗАДАЧИ</div>
            <h1>Все задачи</h1>
            <p>Следите за прогрессом команды и управляйте задачами в одном месте.</p>
          </div>

          <section className="stats" id="overview" aria-label="Статистика задач">
            <article className="stat-card">
              <span className="stat-icon total" aria-hidden="true">▦</span>
              <span className="stat-label">Всего задач</span>
              <strong>{tasks.length}</strong>
              <span className="stat-note">В вашей команде</span>
            </article>
            <article className="stat-card">
              <span className="stat-icon progress" aria-hidden="true">◷</span>
              <span className="stat-label">В работе</span>
              <strong>{tasks.filter(task => task.status === 'В работе').length}</strong>
              <span className="stat-note">Активные задачи</span>
            </article>
            <article className="stat-card">
              <span className="stat-icon done" aria-hidden="true">✓</span>
              <span className="stat-label">Готово</span>
              <strong>{tasks.filter(task => task.status === 'Готово').length}</strong>
              <span className="stat-note">Завершённые задачи</span>
            </article>
          </section>

          <section className="task-section" id="tasks" aria-labelledby="task-heading">
            <div className="section-heading">
              <div><h2 id="task-heading">Задачи команды</h2><p>Список всех задач и их текущий статус</p></div>
              <label className="search-field">
                <span className="search-icon" aria-hidden="true">⌕</span>
                <span className="sr-only">Поиск по названию задачи</span>
                <input type="search" value={query} onChange={event => setQuery(event.target.value)} placeholder="Поиск задач..." aria-label="Поиск по названию задачи" />
              </label>
            </div>

            <div className="tabs" role="tablist" aria-label="Фильтр задач по статусу">
              {tabs.map(item => <button key={item} type="button" role="tab" aria-selected={tab === item} className={tab === item ? 'selected' : ''} onClick={() => setTab(item)}>{item}</button>)}
            </div>

            <div className="table-scroll">
              <table>
                <thead><tr><th scope="col">Задача</th><th scope="col" id="team">Исполнитель</th><th scope="col">Статус</th><th scope="col">Приоритет</th></tr></thead>
                <tbody>
                  {visibleTasks.map(task => <tr key={task.id}>
                    <td className="task-name"><span className="task-check" aria-hidden="true">{task.status === 'Готово' ? '✓' : ''}</span>{task.title}</td>
                    <td><span className="assignee"><span className="avatar" aria-hidden="true">{task.assignee[0].toLocaleUpperCase('ru')}</span>{task.assignee}</span></td>
                    <td><span className={`badge status-${task.status === 'Готово' ? 'done' : task.status === 'В работе' ? 'progress' : 'todo'}`}>{task.status}</span></td>
                    <td><span className={`priority priority-${task.priority === 'Высокий' ? 'high' : task.priority === 'Средний' ? 'medium' : 'low'}`}><span aria-hidden="true">●</span>{task.priority}</span></td>
                  </tr>)}
                </tbody>
              </table>
              {visibleTasks.length === 0 && <div className="empty-state">Задачи не найдены</div>}
            </div>
            <div className="table-footer">Показано {visibleTasks.length} из {tasks.length} задач</div>
          </section>
        </main>
      </div>

      <dialog ref={dialog} aria-labelledby="dialog-title" onClose={event => (event.currentTarget.querySelector('form') as HTMLFormElement)?.reset()}>
        <form onSubmit={addTask}>
          <div className="dialog-heading"><div><div className="eyebrow">КОМАНДНАЯ ДОСКА</div><h2 id="dialog-title">Новая задача</h2></div><button className="close-button" type="button" aria-label="Закрыть окно" onClick={() => dialog.current?.close()}>×</button></div>
          <label>Название задачи<input name="title" required maxLength={120} autoFocus placeholder="Например, подготовить презентацию" /></label>
          <label>Исполнитель<input name="assignee" required maxLength={80} placeholder="Имя исполнителя" /></label>
          <div className="form-row">
            <label>Статус<select name="status" defaultValue="К выполнению"><option>К выполнению</option><option>В работе</option><option>Готово</option></select></label>
            <label>Приоритет<select name="priority" defaultValue="Средний"><option>Низкий</option><option>Средний</option><option>Высокий</option></select></label>
          </div>
          <div className="dialog-actions"><button className="secondary-button" type="button" onClick={() => dialog.current?.close()}>Отмена</button><button className="primary-button" type="submit">Создать задачу</button></div>
        </form>
      </dialog>
    </div>
  );
}
