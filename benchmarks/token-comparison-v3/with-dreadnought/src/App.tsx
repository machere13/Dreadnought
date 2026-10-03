import { useRef, useState, type FormEvent } from 'react';
import { Badge, Button, Card, Input, Table, Tabs } from '@dreadnought/ui/react';

type Status = 'К выполнению' | 'В работе' | 'Готово';
type Priority = 'Низкий' | 'Средний' | 'Высокий';
type Task = { id: number; title: string; assignee: string; status: Status; priority: Priority };

const initialTasks: Task[] = [
  { id: 1, title: 'Собрать требования', assignee: 'Анна', status: 'Готово', priority: 'Высокий' },
  { id: 2, title: 'Нарисовать макет', assignee: 'Максим', status: 'В работе', priority: 'Средний' },
  { id: 3, title: 'Проверить доступность', assignee: 'Ирина', status: 'К выполнению', priority: 'Высокий' },
  { id: 4, title: 'Подключить API', assignee: 'Павел', status: 'В работе', priority: 'Высокий' },
  { id: 5, title: 'Написать тесты', assignee: 'Ольга', status: 'К выполнению', priority: 'Средний' },
  { id: 6, title: 'Подготовить релиз', assignee: 'Анна', status: 'К выполнению', priority: 'Низкий' },
];

function TaskTable({ tasks }: { tasks: Task[] }) {
  if (!tasks.length) return <div className="empty-state" role="status"><span className="empty-icon">⌕</span><strong>Задачи не найдены</strong><span>Попробуйте изменить поиск или выбрать другой фильтр.</span></div>;
  return <div className="table-scroll"><Table className="task-table" size="middle">
    <Table.Head><Table.Row><Table.HeaderCell>Задача</Table.HeaderCell><Table.HeaderCell>Исполнитель</Table.HeaderCell><Table.HeaderCell>Статус</Table.HeaderCell><Table.HeaderCell>Приоритет</Table.HeaderCell></Table.Row></Table.Head>
    <Table.Body>{tasks.map(task => <Table.Row key={task.id}>
      <Table.Cell><span className="task-title">{task.title}</span><span className="task-id">#{String(task.id).padStart(3, '0')}</span></Table.Cell>
      <Table.Cell><span className="assignee"><span className="avatar" aria-hidden="true">{task.assignee[0]}</span>{task.assignee}</span></Table.Cell>
      <Table.Cell><Badge appearance="ghosted" className={`status status-${task.status === 'Готово' ? 'done' : task.status === 'В работе' ? 'progress' : 'todo'}`}>{task.status}</Badge></Table.Cell>
      <Table.Cell><span className={`priority priority-${task.priority === 'Высокий' ? 'high' : task.priority === 'Средний' ? 'medium' : 'low'}`}><span className="priority-dot" aria-hidden="true" />{task.priority}</span></Table.Cell>
    </Table.Row>)}</Table.Body>
  </Table></div>;
}

export default function App() {
  const [tasks, setTasks] = useState(initialTasks);
  const [search, setSearch] = useState('');
  const [title, setTitle] = useState('');
  const [assignee, setAssignee] = useState('');
  const dialog = useRef<HTMLDialogElement>(null);
  const query = search.trim().toLocaleLowerCase('ru');
  const searched = tasks.filter(task => `${task.title} ${task.assignee}`.toLocaleLowerCase('ru').includes(query));
  const inProgress = tasks.filter(task => task.status === 'В работе').length;
  const done = tasks.filter(task => task.status === 'Готово').length;

  function addTask(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!title.trim() || !assignee.trim()) return;
    setTasks(current => [...current, { id: Math.max(...current.map(task => task.id), 0) + 1, title: title.trim(), assignee: assignee.trim(), status: 'К выполнению', priority: 'Средний' }]);
    setTitle('');
    setAssignee('');
    dialog.current?.close();
  }

  return <div className="app-shell">
    <main className="workspace">
      <header className="page-header">
        <div><p className="eyebrow"><span className="eyebrow-mark" /> РАБОЧЕЕ ПРОСТРАНСТВО / ЗАДАЧИ</p><h1>Командная доска</h1><p className="page-description">Следите за задачами команды и держите работу под контролем.</p></div>
        <Button variant="primary" className="new-task-button" onClick={() => dialog.current?.showModal()}><span aria-hidden="true">＋</span> Новая задача</Button>
      </header>
      <section className="stats" aria-label="Сводка задач">
        <Card className="stat-card"><span className="stat-label">Всего задач</span><strong>{tasks.length}</strong><span className="stat-note">В рабочем пространстве</span><span className="stat-symbol stat-symbol-all" aria-hidden="true">▦</span></Card>
        <Card className="stat-card"><span className="stat-label">В работе</span><strong>{inProgress}</strong><span className="stat-note">Сейчас выполняются</span><span className="stat-symbol stat-symbol-progress" aria-hidden="true">◷</span></Card>
        <Card className="stat-card"><span className="stat-label">Готово</span><strong>{done}</strong><span className="stat-note">Завершённые задачи</span><span className="stat-symbol stat-symbol-done" aria-hidden="true">✓</span></Card>
      </section>
      <Card className="tasks-panel">
        <div className="panel-heading"><div><p className="section-kicker">ОБЗОР</p><h2>Задачи команды</h2><p>Все задачи в одном месте</p></div><span className="task-count">{tasks.length} задач</span></div>
        <label className="search-field"><span className="visually-hidden">Поиск по названию задачи и исполнителю</span><span className="search-icon" aria-hidden="true">⌕</span><Input type="search" value={search} onChange={event => setSearch(event.target.value)} placeholder="Поиск по названию или исполнителю..." aria-label="Поиск по названию задачи и исполнителю" /></label>
        <Tabs defaultValue="all">
          <Tabs.List aria-label="Фильтр задач"><Tabs.Tab value="all">Все <span className="tab-number">{tasks.length}</span></Tabs.Tab><Tabs.Tab value="progress">В работе <span className="tab-number">{inProgress}</span></Tabs.Tab><Tabs.Tab value="done">Готово <span className="tab-number">{done}</span></Tabs.Tab></Tabs.List>
          <Tabs.Panel value="all"><TaskTable tasks={searched} /></Tabs.Panel>
          <Tabs.Panel value="progress"><TaskTable tasks={searched.filter(task => task.status === 'В работе')} /></Tabs.Panel>
          <Tabs.Panel value="done"><TaskTable tasks={searched.filter(task => task.status === 'Готово')} /></Tabs.Panel>
        </Tabs>
      </Card>
      <footer className="footer">КОМАНДНАЯ ДОСКА <span>·</span> ПОРЯДОК В КАЖДОЙ ЗАДАЧЕ</footer>
    </main>
    <dialog ref={dialog} className="task-dialog" aria-labelledby="dialog-title" onClose={() => { setTitle(''); setAssignee(''); }}>
      <form onSubmit={addTask}>
        <div className="dialog-top"><div><p className="section-kicker">НОВАЯ ЗАДАЧА</p><h2 id="dialog-title">Добавить задачу</h2></div><Button type="button" variant="ghosted" className="close-button" aria-label="Закрыть форму" onClick={() => dialog.current?.close()}>×</Button></div>
        <p className="dialog-description">Заполните основные сведения. Задача появится в общем списке.</p>
        <label className="form-field">Название задачи<Input value={title} onChange={event => setTitle(event.target.value)} placeholder="Например, подготовить презентацию" required pattern=".*\S.*" autoFocus /></label>
        <label className="form-field">Исполнитель<Input value={assignee} onChange={event => setAssignee(event.target.value)} placeholder="Имя участника команды" required pattern=".*\S.*" /></label>
        <div className="dialog-actions"><Button type="button" variant="secondary" onClick={() => dialog.current?.close()}>Отмена</Button><Button type="submit" variant="primary">Добавить задачу</Button></div>
      </form>
    </dialog>
  </div>;
}
