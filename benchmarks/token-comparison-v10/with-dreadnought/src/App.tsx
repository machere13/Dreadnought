import { useRef, useState, type FormEvent } from 'react';
import { Badge, Button, Card, Input, Table, Tabs } from '@dreadnought/ui/react';
import styles from './App.module.css';

const statuses = ['К выполнению', 'В работе', 'Готово'] as const;
const priorities = ['Низкий', 'Средний', 'Высокий'] as const;
type Task = {
  id: number;
  title: string;
  assignee: string;
  status: typeof statuses[number];
  priority: typeof priorities[number];
};

const initialTasks: Task[] = [
  { id: 1, title: 'Собрать требования', assignee: 'Анна', status: 'В работе', priority: 'Высокий' },
  { id: 2, title: 'Проверить макет', assignee: 'Борис', status: 'К выполнению', priority: 'Средний' },
  { id: 3, title: 'Подготовить релиз', assignee: 'Вера', status: 'Готово', priority: 'Низкий' },
];

export default function App() {
  const [tasks, setTasks] = useState(initialTasks);
  const [search, setSearch] = useState('');
  const [tab, setTab] = useState('Все');
  const dialog = useRef<HTMLDialogElement>(null);
  const form = useRef<HTMLFormElement>(null);
  const query = search.trim().toLocaleLowerCase('ru');
  const visibleTasks = tasks.filter(task =>
    (tab === 'Все' || task.status === tab) &&
    `${task.title} ${task.assignee}`.toLocaleLowerCase('ru').includes(query)
  );

  function createTask(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const title = String(data.get('title')).trim();
    const assignee = String(data.get('assignee')).trim();
    if (!title || !assignee) return;
    setTasks(current => [...current, {
      id: Math.max(0, ...current.map(task => task.id)) + 1,
      title,
      assignee,
      status: data.get('status') as Task['status'],
      priority: data.get('priority') as Task['priority'],
    }]);
    setSearch('');
    setTab('Все');
    dialog.current?.close();
    event.currentTarget.reset();
  }

  const columns = [
    { key: 'title', title: 'Задача', dataIndex: 'title', render: (_: unknown, task: Task) => (
      <div className={styles.taskName}><span className={styles.taskId}>#{String(task.id).padStart(3, '0')}</span><strong>{task.title}</strong></div>
    ) },
    { key: 'assignee', title: 'Исполнитель', dataIndex: 'assignee', render: (_: unknown, task: Task) => (
      <span className={styles.person}><span className={styles.avatar} aria-hidden="true">{task.assignee[0]}</span>{task.assignee}</span>
    ) },
    { key: 'status', title: 'Статус', dataIndex: 'status', render: (_: unknown, task: Task) => (
      <Badge appearance={task.status === 'Готово' ? 'solid' : 'ghosted'}>{task.status}</Badge>
    ) },
    { key: 'priority', title: 'Приоритет', dataIndex: 'priority', render: (_: unknown, task: Task) => (
      <span className={styles.priority}><span aria-hidden="true" className={`${styles.dot} ${styles[task.priority]}`} />{task.priority}</span>
    ) },
  ] as const;

  return (
    <div className={styles.app}>
      <aside className={styles.sidebar}>
        <div className={styles.brand}><span className={styles.brandMark} aria-hidden="true">К</span>Команда<span className={styles.brandDot}>.</span></div>
        <div className={styles.workspaceLabel}>РАБОЧЕЕ ПРОСТРАНСТВО</div>
        <nav aria-label="Основная навигация"><a className={styles.navItem} href="#board" aria-current="page"><span aria-hidden="true">▦</span>Командная доска</a></nav>
        <div className={styles.sidebarFooter}><span className={styles.online} />Всё под контролем</div>
      </aside>

      <main id="board" className={styles.main}>
        <header className={styles.header}>
          <div><p className={styles.eyebrow}>РАБОЧЕЕ ПРОСТРАНСТВО / ЗАДАЧИ</p><h1>Командная доска</h1><p className={styles.subtitle}>Планы, прогресс и результаты вашей команды.</p></div>
          <Button variant="primary" onClick={() => { form.current?.reset(); dialog.current?.showModal(); }}><span aria-hidden="true">＋ </span>Новая задача</Button>
        </header>

        <section aria-label="Сводка задач" className={styles.stats}>
          {[
            { label: 'Всего', count: tasks.length, note: 'Задач в пространстве', symbol: '▦' },
            { label: 'В работе', count: tasks.filter(task => task.status === 'В работе').length, note: 'В фокусе команды', symbol: '◷' },
            { label: 'Готово', count: tasks.filter(task => task.status === 'Готово').length, note: 'Завершено задач', symbol: '✓' },
          ].map(stat => <Card key={stat.label}><div className={styles.statTop}><h2>{stat.label}</h2><span aria-hidden="true">{stat.symbol}</span></div><p className={styles.statNumber}>{stat.count.toString().padStart(2, '0')}</p><p className={styles.statNote}>{stat.note}</p></Card>)}
        </section>

        <section className={styles.taskSection} aria-labelledby="tasks-heading">
          <div className={styles.sectionHeader}><div><h2 id="tasks-heading">Задачи команды</h2><p className={styles.subtitle}>Общий план. Единый ритм.</p></div><div className={styles.search}><Input type="search" aria-label="Поиск задач" placeholder="Поиск задач…" value={search} onChange={event => setSearch(event.target.value)} /></div></div>
          <Tabs value={tab} onValueChange={setTab}>
            <div className={styles.tabsScroll}><Tabs.List aria-label="Фильтр по статусу">{['Все', ...statuses].map(status => <Tabs.Tab key={status} value={status}>{status}</Tabs.Tab>)}</Tabs.List></div>
            {['Все', ...statuses].map(status => <Tabs.Panel key={status} value={status}><div className={styles.tableScroll}><div className={styles.tableWidth}><Table rowKey="id" pagination={false} dataSource={visibleTasks} columns={columns} locale={{ emptyText: 'Задачи не найдены' }} /></div></div></Tabs.Panel>)}
          </Tabs>
          <p className={styles.tableFooter} aria-live="polite">Показано {visibleTasks.length} из {tasks.length} задач</p>
        </section>
      </main>

      <dialog ref={dialog} className={styles.dialog} aria-labelledby="new-task-title">
        <form ref={form} onSubmit={createTask} className={styles.form}>
          <div><p className={styles.eyebrow}>ДОБАВИТЬ В ПЛАН</p><h2 id="new-task-title">Новая задача</h2></div>
          <label htmlFor="task-title">Название задачи<Input id="task-title" name="title" required pattern=".*\S.*" autoFocus placeholder="Что нужно сделать?" /></label>
          <label htmlFor="task-assignee">Исполнитель<Input id="task-assignee" name="assignee" required pattern=".*\S.*" placeholder="Имя участника" /></label>
          <div className={styles.formRow}>
            <label htmlFor="task-status">Статус<select id="task-status" name="status" defaultValue="К выполнению">{statuses.map(status => <option key={status}>{status}</option>)}</select></label>
            <label htmlFor="task-priority">Приоритет<select id="task-priority" name="priority" defaultValue="Средний">{priorities.map(priority => <option key={priority}>{priority}</option>)}</select></label>
          </div>
          <div className={styles.formActions}><Button variant="ghosted" onClick={event => { event.preventDefault(); dialog.current?.close(); }}>Отмена</Button><Button variant="primary" onClick={event => { event.preventDefault(); form.current?.requestSubmit(); }}>Создать задачу</Button></div>
        </form>
      </dialog>
    </div>
  );
}
