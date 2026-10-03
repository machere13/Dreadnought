import { useState, type FormEvent } from 'react'

type Status = 'К выполнению' | 'В работе' | 'Готово'
type Priority = 'Низкий' | 'Средний' | 'Высокий'
type Task = { id: number; title: string; assignee: string; status: Status; priority: Priority }
type Filter = 'Все' | 'В работе' | 'Готово'

const initialTasks: Task[] = [
  { id: 1, title: 'Собрать требования', assignee: 'Анна', status: 'Готово', priority: 'Высокий' },
  { id: 2, title: 'Нарисовать макет', assignee: 'Максим', status: 'В работе', priority: 'Средний' },
  { id: 3, title: 'Проверить доступность', assignee: 'Ирина', status: 'К выполнению', priority: 'Высокий' },
  { id: 4, title: 'Подключить API', assignee: 'Павел', status: 'В работе', priority: 'Высокий' },
  { id: 5, title: 'Написать тесты', assignee: 'Ольга', status: 'К выполнению', priority: 'Средний' },
  { id: 6, title: 'Подготовить релиз', assignee: 'Анна', status: 'К выполнению', priority: 'Низкий' },
]

const filters: Filter[] = ['Все', 'В работе', 'Готово']

export default function App() {
  const [tasks, setTasks] = useState(initialTasks)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<Filter>('Все')
  const [showForm, setShowForm] = useState(false)
  const query = search.trim().toLocaleLowerCase('ru')
  const visibleTasks = tasks.filter(task =>
    (filter === 'Все' || task.status === filter) &&
    (!query || `${task.title} ${task.assignee}`.toLocaleLowerCase('ru').includes(query)),
  )

  function addTask(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = event.currentTarget
    const data = new FormData(form)
    const title = String(data.get('title') ?? '').trim()
    const assignee = String(data.get('assignee') ?? '').trim()
    if (!title || !assignee) return
    setTasks(current => [...current, {
      id: current.length + 1,
      title,
      assignee,
      status: 'К выполнению',
      priority: 'Средний',
    }])
    setFilter('Все')
    setSearch('')
    setShowForm(false)
  }

  return (
    <main className="page">
      <header className="page-header">
        <div>
          <h1>Командная доска</h1>
          <p>Задачи команды в одном месте</p>
        </div>
        <button className="button button-primary" type="button" aria-expanded={showForm} aria-controls="new-task-form" onClick={() => setShowForm(!showForm)}>
          <span aria-hidden="true">＋</span> Новая задача
        </button>
      </header>

      {showForm && (
        <form id="new-task-form" className="new-task-form" onSubmit={addTask}>
          <div className="field">
            <label htmlFor="task-title">Название</label>
            <input id="task-title" name="title" required autoFocus />
          </div>
          <div className="field">
            <label htmlFor="task-assignee">Исполнитель</label>
            <input id="task-assignee" name="assignee" required />
          </div>
          <div className="form-actions">
            <button className="button button-primary" type="submit">Добавить</button>
            <button className="button button-secondary" type="button" onClick={() => setShowForm(false)}>Отмена</button>
          </div>
        </form>
      )}

      <section className="metrics" aria-label="Сводка задач">
        <div className="metric"><span>Всего</span><strong>{tasks.length}</strong></div>
        <div className="metric"><span>В работе</span><strong>{tasks.filter(task => task.status === 'В работе').length}</strong></div>
        <div className="metric"><span>Готово</span><strong>{tasks.filter(task => task.status === 'Готово').length}</strong></div>
      </section>

      <section className="task-panel" aria-label="Задачи">
        <div className="toolbar">
          <div className="filters" role="group" aria-label="Фильтр по статусу">
            {filters.map(item => (
              <button key={item} type="button" className={filter === item ? 'filter active' : 'filter'} aria-pressed={filter === item} onClick={() => setFilter(item)}>{item}</button>
            ))}
          </div>
          <label className="search">
            <span className="sr-only">Поиск по задаче или исполнителю</span>
            <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="10.8" cy="10.8" r="6.8" /><path d="m16 16 5 5" /></svg>
            <input type="search" value={search} onChange={event => setSearch(event.target.value)} placeholder="Поиск по задаче или исполнителю" />
          </label>
        </div>
        <div className="table-wrap">
          <table>
            <thead><tr><th scope="col">Задача</th><th scope="col">Исполнитель</th><th scope="col">Статус</th><th scope="col">Приоритет</th></tr></thead>
            <tbody>
              {visibleTasks.map(task => (
                <tr key={task.id}>
                  <td data-label="Задача" className="task-title">{task.title}</td>
                  <td data-label="Исполнитель">{task.assignee}</td>
                  <td data-label="Статус"><span className={`status status-${task.status === 'Готово' ? 'done' : task.status === 'В работе' ? 'working' : 'todo'}`}>{task.status}</span></td>
                  <td data-label="Приоритет"><span className={`priority priority-${task.priority === 'Высокий' ? 'high' : task.priority === 'Средний' ? 'medium' : 'low'}`}>{task.priority}</span></td>
                </tr>
              ))}
              {visibleTasks.length === 0 && <tr><td className="empty" colSpan={4}>Задачи не найдены</td></tr>}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  )
}
