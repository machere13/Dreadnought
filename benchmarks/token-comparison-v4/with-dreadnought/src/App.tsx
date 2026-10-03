import { useRef, useState, type FormEvent } from 'react';
import { Badge, Button, Card, Input, Table, Tabs } from '@dreadnought/ui/react';

type Status = 'К выполнению' | 'В работе' | 'Готово';
type Priority = 'Низкий' | 'Средний' | 'Высокий';
type Task = { id: number; title: string; assignee: string; status: Status; priority: Priority };

const initialTasks: Task[] = [
  { id: 1, title: 'Собрать требования', assignee: 'Анна', status: 'В работе', priority: 'Высокий' },
  { id: 2, title: 'Сверстать прототип', assignee: 'Борис', status: 'Готово', priority: 'Средний' },
  { id: 3, title: 'Проверить сценарии', assignee: 'Вера', status: 'К выполнению', priority: 'Низкий' },
];

const filters = [
  { value: 'all', label: 'Все' },
  { value: 'working', label: 'В работе' },
  { value: 'done', label: 'Готово' },
] as const;

function TaskTable({ tasks }: { tasks: Task[] }) {
  if (!tasks.length) return <div className="empty-state">Задачи не найдены</div>;

  return (
    <div className="table-scroll">
      <Table className="task-table">
        <Table.Head>
          <Table.Row>
            <Table.HeaderCell scope="col">Задача</Table.HeaderCell>
            <Table.HeaderCell scope="col">Исполнитель</Table.HeaderCell>
            <Table.HeaderCell scope="col">Статус</Table.HeaderCell>
            <Table.HeaderCell scope="col">Приоритет</Table.HeaderCell>
          </Table.Row>
        </Table.Head>
        <Table.Body>
          {tasks.map((task) => (
            <Table.Row key={task.id}>
              <Table.Cell><span className="task-name">{task.title}</span></Table.Cell>
              <Table.Cell><span className="assignee"><span className="avatar" aria-hidden="true">{task.assignee[0]}</span>{task.assignee}</span></Table.Cell>
              <Table.Cell><Badge appearance="ghosted" className={`status status-${task.status === 'Готово' ? 'done' : task.status === 'В работе' ? 'working' : 'todo'}`}>{task.status}</Badge></Table.Cell>
              <Table.Cell><span className={`priority priority-${task.priority === 'Высокий' ? 'high' : task.priority === 'Средний' ? 'medium' : 'low'}`}><span aria-hidden="true" className="priority-dot" />{task.priority}</span></Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table>
    </div>
  );
}

export default function App() {
  const [tasks, setTasks] = useState(initialTasks);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const dialogRef = useRef<HTMLDialogElement>(null);
  const nextId = useRef(4);

  const inWork = tasks.filter((task) => task.status === 'В работе').length;
  const done = tasks.filter((task) => task.status === 'Готово').length;
  const searched = tasks.filter((task) => task.title.toLocaleLowerCase('ru').includes(search.trim().toLocaleLowerCase('ru')));
  const visible = (value: string) => searched.filter((task) => value === 'all' || task.status === (value === 'working' ? 'В работе' : 'Готово'));

  function addTask(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const values = new FormData(form);
    const title = String(values.get('title') ?? '').trim();
    const assignee = String(values.get('assignee') ?? '').trim();
    if (!title || !assignee) return;
    setTasks((current) => [...current, {
      id: nextId.current++, title, assignee,
      status: String(values.get('status')) as Status,
      priority: String(values.get('priority')) as Priority,
    }]);
    setFilter('all');
    setSearch('');
    form.reset();
    dialogRef.current?.close();
  }

  return (
    <div className="app-shell">
      <aside className="sidebar" aria-label="Боковая панель">
        <a className="brand" href="#overview" aria-label="Командная доска — обзор"><span className="brand-mark" aria-hidden="true">◆</span><span>orbit<span className="brand-period">.</span></span></a>
        <div className="workspace-label">РАБОЧЕЕ ПРОСТРАНСТВО</div>
        <nav className="side-nav" aria-label="Основная навигация">
          <a className="nav-link active" href="#overview" aria-current="page"><span aria-hidden="true">◫</span>Обзор</a>
          <a className="nav-link" href="#tasks"><span aria-hidden="true">☷</span>Задачи</a>
          <a className="nav-link" href="#team"><span aria-hidden="true">♙</span>Команда</a>
        </nav>
        <div className="sidebar-bottom"><span className="sidebar-avatar" aria-hidden="true">К</span><span><strong>Команда проекта</strong><small>Рабочее пространство</small></span></div>
      </aside>

      <div className="main-shell" id="overview">
        <header className="topbar">
          <div className="topbar-title">Командная доска <span className="topbar-chevron" aria-hidden="true">/</span> <span>Обзор</span></div>
          <Button variant="primary" onClick={() => dialogRef.current?.showModal()}><span aria-hidden="true">＋</span> Новая задача</Button>
        </header>

        <main className="content">
          <div className="page-heading"><div><p className="eyebrow">РАБОЧЕЕ ПРОСТРАНСТВО / ОБЗОР</p><h1>Все задачи</h1><p className="intro">Следите за прогрессом команды и управляйте задачами в одном месте.</p></div><span className="date-pill">Текущий проект</span></div>

          <section className="metrics" aria-label="Сводка по задачам">
            <Card className="metric-card"><div className="metric-top"><span>Всего задач</span><span className="metric-icon icon-all" aria-hidden="true">▦</span></div><strong>{tasks.length}</strong><small>Задачи в проекте</small></Card>
            <Card className="metric-card"><div className="metric-top"><span>В работе</span><span className="metric-icon icon-work" aria-hidden="true">◷</span></div><strong>{inWork}</strong><small>В активной работе</small></Card>
            <Card className="metric-card"><div className="metric-top"><span>Готово</span><span className="metric-icon icon-done" aria-hidden="true">✓</span></div><strong>{done}</strong><small>Завершённые задачи</small></Card>
          </section>

          <section className="tasks-section" id="tasks" aria-labelledby="tasks-title">
            <div className="section-heading"><div><h2 id="tasks-title">Задачи проекта</h2><p>Актуальный список задач вашей команды</p></div><span className="count-pill">{tasks.length} задач</span></div>
            <div className="toolbar"><div className="search-wrap"><span aria-hidden="true" className="search-icon">⌕</span><Input type="search" aria-label="Поиск по названию задачи" placeholder="Поиск по названию задачи..." value={search} onChange={(event) => setSearch(event.currentTarget.value)} /></div></div>
            <Tabs value={filter} onValueChange={setFilter} className="task-tabs">
              <Tabs.List aria-label="Фильтр задач">
                {filters.map(({ value, label }) => <Tabs.Tab key={value} value={value}>{label}</Tabs.Tab>)}
              </Tabs.List>
              {filters.map(({ value }) => <Tabs.Panel key={value} value={value}><TaskTable tasks={visible(value)} /></Tabs.Panel>)}
            </Tabs>
          </section>

          <section className="team-section" id="team" aria-labelledby="team-title"><h2 id="team-title">Команда</h2><p>Анна · Борис · Вера</p></section>
        </main>
      </div>

      <dialog ref={dialogRef} className="task-dialog" aria-labelledby="dialog-title">
        <form onSubmit={addTask}>
          <div className="dialog-heading"><div><p className="eyebrow">НОВАЯ ЗАДАЧА</p><h2 id="dialog-title">Добавить задачу</h2></div><button type="button" className="close-button" aria-label="Закрыть окно" onClick={() => dialogRef.current?.close()}>×</button></div>
          <label className="field">Название задачи<Input name="title" required autoFocus placeholder="Например, Подготовить презентацию" /></label>
          <label className="field">Исполнитель<Input name="assignee" required placeholder="Имя исполнителя" /></label>
          <div className="field-row"><label className="field">Статус<select name="status" defaultValue="К выполнению"><option>К выполнению</option><option>В работе</option><option>Готово</option></select></label><label className="field">Приоритет<select name="priority" defaultValue="Средний"><option>Низкий</option><option>Средний</option><option>Высокий</option></select></label></div>
          <div className="dialog-actions"><Button type="button" variant="ghosted" onClick={() => dialogRef.current?.close()}>Отмена</Button><Button type="submit" variant="primary">Сохранить задачу</Button></div>
        </form>
      </dialog>
    </div>
  );
}
