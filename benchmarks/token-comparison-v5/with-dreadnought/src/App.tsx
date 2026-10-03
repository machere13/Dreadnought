import { useRef, useState } from 'react';
import type { FormEvent } from 'react';
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
  { value: 'active', label: 'В работе' },
  { value: 'done', label: 'Готово' },
] as const;

export default function App() {
  const [tasks, setTasks] = useState(initialTasks);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const dialog = useRef<HTMLDialogElement>(null);

  function saveTask(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const title = String(data.get('title') ?? '').trim();
    const assignee = String(data.get('assignee') ?? '').trim();
    const status = String(data.get('status')) as Status;
    const priority = String(data.get('priority')) as Priority;
    if (!title || !assignee) return;
    setTasks((current) => [...current, { id: Date.now(), title, assignee, status, priority }]);
    form.reset();
    dialog.current?.close();
  }

  const counts = [
    { label: 'Всего задач', value: tasks.length, mark: '01' },
    { label: 'В работе', value: tasks.filter((task) => task.status === 'В работе').length, mark: '02' },
    { label: 'Готово', value: tasks.filter((task) => task.status === 'Готово').length, mark: '03' },
  ];

  function taskTable(value: string) {
    const visible = tasks.filter((task) =>
      task.title.toLocaleLowerCase('ru').includes(search.trim().toLocaleLowerCase('ru')) &&
      (value === 'all' || (value === 'active' && task.status === 'В работе') || (value === 'done' && task.status === 'Готово')),
    );
    if (!visible.length) return <div className="empty">Задачи не найдены</div>;
    return (
      <div className="table-scroll">
        <Table>
          <Table.Head><Table.Row>
            <Table.HeaderCell scope="col">Задача</Table.HeaderCell>
            <Table.HeaderCell scope="col">Исполнитель</Table.HeaderCell>
            <Table.HeaderCell scope="col">Статус</Table.HeaderCell>
            <Table.HeaderCell scope="col">Приоритет</Table.HeaderCell>
          </Table.Row></Table.Head>
          <Table.Body>{visible.map((task) => (
            <Table.Row key={task.id}>
              <Table.Cell><span className="task-title">{task.title}</span></Table.Cell>
              <Table.Cell>{task.assignee}</Table.Cell>
              <Table.Cell><Badge appearance="ghosted">{task.status}</Badge></Table.Cell>
              <Table.Cell><span className={`priority priority-${task.priority}`}>{task.priority}</span></Table.Cell>
            </Table.Row>
          ))}</Table.Body>
        </Table>
      </div>
    );
  }

  return (
    <div className="app">
      <header className="topbar">
        <div className="brand"><span className="brand-mark" aria-hidden="true">✳</span><span>Командная доска</span></div>
        <Button variant="primary" onClick={() => dialog.current?.showModal()}>+ Новая задача</Button>
      </header>
      <div className="shell">
        <aside className="sidebar" aria-label="Боковая навигация">
          <p className="sidebar-label">РАБОЧЕЕ ПРОСТРАНСТВО</p>
          <nav aria-label="Основная навигация">
            <a href="#overview" className="nav-link active" aria-current="page"><span aria-hidden="true">▦</span>Обзор</a>
            <a href="#tasks" className="nav-link"><span aria-hidden="true">☷</span>Задачи</a>
            <a href="#team" className="nav-link"><span aria-hidden="true">♙</span>Команда</a>
          </nav>
          <div className="sidebar-footer"><span className="avatar">К</span><div><strong>Команда</strong><small>Рабочая область</small></div></div>
        </aside>
        <main id="overview" className="content">
          <div className="eyebrow">ОБЗОР / ЗАДАЧИ</div>
          <div className="page-heading"><div><h1>Все задачи</h1><p>Следите за прогрессом команды и управляйте текущими задачами.</p></div><span className="heading-icon" aria-hidden="true">↗</span></div>
          <section className="stats" aria-label="Сводка задач">
            {counts.map((count) => <Card key={count.label} className="stat-card"><div className="stat-top"><span>{count.label}</span><span>{count.mark}</span></div><strong>{count.value.toString().padStart(2, '0')}</strong><span className="stat-caption">задач в проекте</span></Card>)}
          </section>
          <section id="tasks" className="tasks-section" aria-labelledby="tasks-title">
            <div className="section-header"><div><span className="section-kicker">СПИСОК ЗАДАЧ</span><h2 id="tasks-title">Текущие задачи <span>{tasks.length}</span></h2></div><label className="search-field"><span className="sr-only">Поиск по названию задачи</span><Input type="search" role="searchbox" aria-label="Поиск по названию задачи" placeholder="Поиск по задачам..." value={search} onChange={(event) => setSearch(event.target.value)} /></label></div>
            <Tabs value={filter} onValueChange={setFilter}>
              <Tabs.List aria-label="Фильтр задач">{filters.map((item) => <Tabs.Tab key={item.value} value={item.value}>{item.label}</Tabs.Tab>)}</Tabs.List>
              {filters.map((item) => <Tabs.Panel key={item.value} value={item.value}>{taskTable(item.value)}</Tabs.Panel>)}
            </Tabs>
          </section>
          <footer id="team">КОМАНДНАЯ ДОСКА <span>·</span> РАБОЧЕЕ ПРОСТРАНСТВО</footer>
        </main>
      </div>
      <dialog ref={dialog} className="task-dialog" aria-labelledby="dialog-title">
        <form onSubmit={saveTask}>
          <div className="dialog-heading"><div><span className="section-kicker">НОВАЯ ЗАДАЧА</span><h2 id="dialog-title">Добавить задачу</h2></div><button type="button" className="close-button" aria-label="Закрыть окно" onClick={() => dialog.current?.close()}>×</button></div>
          <label>Название задачи<Input name="title" type="text" required placeholder="Что нужно сделать?" /></label>
          <label>Исполнитель<Input name="assignee" type="text" required placeholder="Имя исполнителя" /></label>
          <div className="form-row"><label>Статус<select name="status" defaultValue="К выполнению"><option>К выполнению</option><option>В работе</option><option>Готово</option></select></label><label>Приоритет<select name="priority" defaultValue="Средний"><option>Низкий</option><option>Средний</option><option>Высокий</option></select></label></div>
          <div className="dialog-actions"><Button type="button" variant="ghosted" onClick={() => dialog.current?.close()}>Отмена</Button><Button type="submit" variant="primary">Сохранить задачу</Button></div>
        </form>
      </dialog>
    </div>
  );
}
