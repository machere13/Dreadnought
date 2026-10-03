import { useState, type FormEvent } from 'react';
import { Badge, Button, Card, Input, Table, Tabs } from '@dreadnought/ui/react';

type Status = 'Готово' | 'В работе' | 'К выполнению';
type Priority = 'Высокий' | 'Средний' | 'Низкий';
type Task = { id: number; title: string; assignee: string; status: Status; priority: Priority };

const initialTasks: Task[] = [
  { id: 1, title: 'Собрать требования', assignee: 'Анна', status: 'Готово', priority: 'Высокий' },
  { id: 2, title: 'Нарисовать макет', assignee: 'Максим', status: 'В работе', priority: 'Средний' },
  { id: 3, title: 'Проверить доступность', assignee: 'Ирина', status: 'К выполнению', priority: 'Высокий' },
  { id: 4, title: 'Подключить API', assignee: 'Павел', status: 'В работе', priority: 'Высокий' },
  { id: 5, title: 'Написать тесты', assignee: 'Ольга', status: 'К выполнению', priority: 'Средний' },
  { id: 6, title: 'Подготовить релиз', assignee: 'Анна', status: 'К выполнению', priority: 'Низкий' },
];

const filters = ['Все', 'В работе', 'Готово'] as const;

export default function App() {
  const [tasks, setTasks] = useState(initialTasks);
  const [query, setQuery] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [assignee, setAssignee] = useState('');

  const normalizedQuery = query.trim().toLocaleLowerCase('ru');
  const searched = tasks.filter((task) =>
    `${task.title} ${task.assignee}`.toLocaleLowerCase('ru').includes(normalizedQuery),
  );

  function addTask(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextTitle = title.trim();
    const nextAssignee = assignee.trim();
    if (!nextTitle || !nextAssignee) return;
    setTasks((current) => [...current, {
      id: Math.max(0, ...current.map((task) => task.id)) + 1,
      title: nextTitle,
      assignee: nextAssignee,
      status: 'К выполнению',
      priority: 'Средний',
    }]);
    setTitle('');
    setAssignee('');
    setShowForm(false);
  }

  function taskTable(rows: Task[]) {
    return <div className="table-scroll"><Table className="tasks-table" size="middle">
      <Table.Head><Table.Row>
        <Table.HeaderCell scope="col">Задача</Table.HeaderCell>
        <Table.HeaderCell scope="col">Исполнитель</Table.HeaderCell>
        <Table.HeaderCell scope="col">Статус</Table.HeaderCell>
        <Table.HeaderCell scope="col">Приоритет</Table.HeaderCell>
      </Table.Row></Table.Head>
      <Table.Body>
        {rows.map((task) => <Table.Row key={task.id}>
          <Table.Cell className="task-title">{task.title}</Table.Cell>
          <Table.Cell>{task.assignee}</Table.Cell>
          <Table.Cell><span className={`status status-${task.status === 'Готово' ? 'done' : task.status === 'В работе' ? 'progress' : 'todo'}`}><Badge appearance="ghosted">{task.status}</Badge></span></Table.Cell>
          <Table.Cell><span className={`priority priority-${task.priority === 'Высокий' ? 'high' : task.priority === 'Средний' ? 'medium' : 'low'}`}>{task.priority}</span></Table.Cell>
        </Table.Row>)}
        {rows.length === 0 && <Table.Row><Table.Cell colSpan={4} className="empty">Задачи не найдены</Table.Cell></Table.Row>}
      </Table.Body>
    </Table></div>;
  }

  return <main className="dashboard">
    <header className="page-header">
      <div><h1>Командная доска</h1><p>Задачи команды в одном месте</p></div>
      <Button type="button" onClick={() => setShowForm((value) => !value)} aria-expanded={showForm} aria-controls="task-form">Новая задача</Button>
    </header>

    <section className="metrics" aria-label="Сводка задач">
      <Card className="metric"><span>Всего</span><strong>{tasks.length}</strong></Card>
      <Card className="metric"><span>В работе</span><strong>{tasks.filter((task) => task.status === 'В работе').length}</strong></Card>
      <Card className="metric"><span>Готово</span><strong>{tasks.filter((task) => task.status === 'Готово').length}</strong></Card>
    </section>

    {showForm && <Card className="form-card"><form id="task-form" onSubmit={addTask}>
      <div className="form-fields">
        <label htmlFor="task-title">Название<Input id="task-title" type="text" value={title} onChange={(event) => setTitle(event.target.value)} required /></label>
        <label htmlFor="task-assignee">Исполнитель<Input id="task-assignee" type="text" value={assignee} onChange={(event) => setAssignee(event.target.value)} required /></label>
      </div>
      <div className="form-actions"><Button type="submit">Добавить</Button><Button type="button" variant="outlined" onClick={() => setShowForm(false)}>Отмена</Button></div>
    </form></Card>}

    <Card className="tasks-card">
      <div className="tasks-heading"><h2>Задачи</h2><label className="search-label" htmlFor="task-search">Поиск<Input id="task-search" type="search" placeholder="Задача или исполнитель" value={query} onChange={(event) => setQuery(event.target.value)} /></label></div>
      <Tabs defaultValue="Все">
        <Tabs.List aria-label="Фильтр задач">{filters.map((filter) => <Tabs.Tab key={filter} value={filter}>{filter}</Tabs.Tab>)}</Tabs.List>
        {filters.map((filter) => <Tabs.Panel key={filter} value={filter}>{taskTable(filter === 'Все' ? searched : searched.filter((task) => task.status === filter))}</Tabs.Panel>)}
      </Tabs>
    </Card>
  </main>;
}
