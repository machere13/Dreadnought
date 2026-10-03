import { useState, type FormEvent } from 'react';
import { createRoot } from 'react-dom/client';
import { Badge, Button, Card, Input, Table, Tabs } from '@dreadnought/ui/react';
import './style.css';

type Status = 'К выполнению' | 'В работе' | 'Готово';
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

function App() {
  const [tasks, setTasks] = useState(initialTasks);
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('all');
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [assignee, setAssignee] = useState('');
  const matches = (task: Task, status?: Status) =>
    (!status || task.status === status) &&
    `${task.title} ${task.assignee}`.toLocaleLowerCase('ru').includes(query.trim().toLocaleLowerCase('ru'));

  function addTask(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!title.trim() || !assignee.trim()) return;
    setTasks((current) => [...current, { id: Date.now(), title: title.trim(), assignee: assignee.trim(), status: 'К выполнению', priority: 'Средний' }]);
    setTitle('');
    setAssignee('');
    setShowForm(false);
  }

  function taskTable(status?: Status) {
    const rows = tasks.filter((task) => matches(task, status));
    return <div className="table-scroll">
      <Table size="middle" aria-label="Задачи команды">
        <Table.Head><Table.Row>
          <Table.HeaderCell scope="col">Задача</Table.HeaderCell>
          <Table.HeaderCell scope="col">Исполнитель</Table.HeaderCell>
          <Table.HeaderCell scope="col">Статус</Table.HeaderCell>
          <Table.HeaderCell scope="col">Приоритет</Table.HeaderCell>
        </Table.Row></Table.Head>
        <Table.Body>{rows.map((task) => <Table.Row key={task.id}>
          <Table.HeaderCell scope="row">{task.title}</Table.HeaderCell>
          <Table.Cell>{task.assignee}</Table.Cell>
          <Table.Cell><Badge className={`status status-${task.status === 'Готово' ? 'done' : task.status === 'В работе' ? 'active' : 'todo'}`}>{task.status}</Badge></Table.Cell>
          <Table.Cell><span className={`priority priority-${task.priority === 'Высокий' ? 'high' : task.priority === 'Средний' ? 'medium' : 'low'}`}>{task.priority}</span></Table.Cell>
        </Table.Row>)}</Table.Body>
      </Table>
      {rows.length === 0 && <p className="empty">Задачи не найдены</p>}
    </div>;
  }

  return <main className="shell">
    <header className="page-header">
      <div><h1>Командная доска</h1><p>Задачи команды в одном месте</p></div>
      <Button onClick={() => setShowForm((open) => !open)} aria-expanded={showForm} aria-controls="task-form">Новая задача</Button>
    </header>

    {showForm && <Card className="form-card" id="task-form">
      <form onSubmit={addTask}>
        <div className="field"><label htmlFor="task-title">Название</label><Input id="task-title" value={title} onChange={(event) => setTitle(event.target.value)} required /></div>
        <div className="field"><label htmlFor="task-assignee">Исполнитель</label><Input id="task-assignee" value={assignee} onChange={(event) => setAssignee(event.target.value)} required /></div>
        <div className="form-actions"><Button type="submit">Добавить</Button><Button variant="outlined" onClick={() => setShowForm(false)}>Отмена</Button></div>
      </form>
    </Card>}

    <section className="metrics" aria-label="Сводка задач">
      {([
        ['Всего', tasks.length],
        ['В работе', tasks.filter((task) => task.status === 'В работе').length],
        ['Готово', tasks.filter((task) => task.status === 'Готово').length],
      ] as const).map(([label, count]) => <Card className="metric" key={label}><span>{label}</span><strong>{count}</strong></Card>)}
    </section>

    <Card className="board">
      <div className="toolbar"><h2>Задачи</h2><div className="search"><label htmlFor="task-search">Поиск задач</label><Input id="task-search" type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Задача или исполнитель" /></div></div>
      <Tabs value={filter} onValueChange={setFilter}>
        <Tabs.List aria-label="Фильтр по статусу"><Tabs.Tab value="all">Все</Tabs.Tab><Tabs.Tab value="active">В работе</Tabs.Tab><Tabs.Tab value="done">Готово</Tabs.Tab></Tabs.List>
        <Tabs.Panel value="all">{filter === 'all' && taskTable()}</Tabs.Panel>
        <Tabs.Panel value="active">{filter === 'active' && taskTable('В работе')}</Tabs.Panel>
        <Tabs.Panel value="done">{filter === 'done' && taskTable('Готово')}</Tabs.Panel>
      </Tabs>
    </Card>
  </main>;
}

createRoot(document.getElementById('root')!).render(<App />);
