import { useRef, useState, type FormEvent } from 'react';
import { Badge, Button, Card, Input, Table, Tabs } from '@dreadnought/ui/react';
import styles from './App.module.css';

const statuses = ['К выполнению', 'В работе', 'Готово'] as const;
const priorities = ['Низкий', 'Средний', 'Высокий'] as const;
const tabs = ['Все', ...statuses];

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
  const query = search.trim().toLocaleLowerCase();
  const visibleTasks = tasks.filter(task =>
    (tab === 'Все' || task.status === tab) &&
    (task.title.toLocaleLowerCase().includes(query) || task.assignee.toLocaleLowerCase().includes(query)),
  );
  const counters = [
    { label: 'Всего', value: tasks.length, note: 'задач на доске', icon: '▦' },
    { label: 'В работе', value: tasks.filter(task => task.status === 'В работе').length, note: 'в фокусе команды', icon: '◷' },
    { label: 'Готово', value: tasks.filter(task => task.status === 'Готово').length, note: 'завершённых задач', icon: '✓' },
  ];

  function createTask(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const title = String(data.get('title') ?? '').trim();
    const assignee = String(data.get('assignee') ?? '').trim();
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
    form.reset();
  }

  return (
    <div className={styles.app}>
      <aside className={styles.sidebar}>
        <div className={styles.brand}><span className={styles.brandMark}>К</span>Команда<span className={styles.workspace}>/ workspace</span></div>
        <div className={styles.navLabel}>РАБОЧЕЕ ПРОСТРАНСТВО</div>
        <nav aria-label="Основная навигация">
          <a href="#board" aria-current="page" className={styles.navItem}><span aria-hidden="true">▦</span>Командная доска<span className={styles.navCount}>{tasks.length}</span></a>
        </nav>
        <div className={styles.sidebarFooter}><span className={styles.avatar}>К</span><div>Командное пространство<small>Всё важное — в одном месте</small></div></div>
      </aside>

      <main id="board" className={styles.main}>
        <div className={styles.breadcrumb}>Рабочее пространство <span>/</span> Задачи</div>
        <header className={styles.header}>
          <div><div className={styles.eyebrow}>ОБЗОР КОМАНДЫ</div><h1>Командная доска</h1><p>Общий план. Понятные приоритеты. Движение вперёд.</p></div>
          <Button variant="primary" onClick={() => dialog.current?.showModal()}><span aria-hidden="true">＋</span> Новая задача</Button>
        </header>

        <section className={styles.counters} aria-label="Сводка задач">
          {counters.map(counter => <Card key={counter.label}>
            <div className={styles.counterHeading}><span>{counter.label}</span><span className={styles.counterIcon} aria-hidden="true">{counter.icon}</span></div>
            <strong className={styles.counterValue}>{counter.value}</strong><span className={styles.counterNote}>{counter.note}</span>
          </Card>)}
        </section>

        <section className={styles.taskSection} aria-labelledby="tasks-title">
          <div className={styles.taskHeading}><div><h2 id="tasks-title">Задачи команды</h2><p>От идеи до результата</p></div><div className={styles.search}><Input type="search" aria-label="Поиск задач" placeholder="Поиск по задаче или исполнителю…" value={search} onChange={event => setSearch(event.target.value)} /></div></div>
          <Tabs value={tab} onValueChange={setTab}>
            <div className={styles.tabScroll}><Tabs.List aria-label="Статус задач">{tabs.map(value => <Tabs.Tab key={value} value={value}>{value}</Tabs.Tab>)}</Tabs.List></div>
            {tabs.map(value => <Tabs.Panel key={value} value={value}>
              {tab === value && <div className={styles.tableScroll}>
                <Table<Task> rowKey="id" pagination={false} dataSource={visibleTasks} locale={{ emptyText: 'Задачи не найдены' }} scroll={{ x: 690 }} columns={[
                  { key: 'title', title: 'Задача', dataIndex: 'title', render: (_value, task) => <div className={styles.taskName}><span className={styles.taskId}>#{String(task.id).padStart(2, '0')}</span><strong>{task.title}</strong></div> },
                  { key: 'assignee', title: 'Исполнитель', dataIndex: 'assignee', render: (_value, task) => <div className={styles.person}><span className={styles.avatar} aria-hidden="true">{task.assignee.charAt(0).toUpperCase()}</span>{task.assignee}</div> },
                  { key: 'status', title: 'Статус', dataIndex: 'status', render: (_value, task) => <Badge appearance={task.status === 'Готово' ? 'solid' : task.status === 'В работе' ? 'ghosted' : 'outline'}>{task.status}</Badge> },
                  { key: 'priority', title: 'Приоритет', dataIndex: 'priority', render: (_value, task) => <span className={styles.priority}><span aria-hidden="true" className={styles[task.priority === 'Высокий' ? 'high' : task.priority === 'Средний' ? 'medium' : 'low']}>●</span>{task.priority}</span> },
                ]} />
              </div>}
            </Tabs.Panel>)}
          </Tabs>
          <div className={styles.tableFooter} aria-live="polite">Показано {visibleTasks.length} из {tasks.length}<span>Каждая задача приближает к цели</span></div>
        </section>
      </main>

      <dialog ref={dialog} className={styles.dialog} aria-labelledby="dialog-title">
        <form onSubmit={createTask} className={styles.form}>
          <div><div className={styles.eyebrow}>КОМАНДНАЯ ДОСКА</div><h2 id="dialog-title">Новая задача</h2><p>Добавьте следующий шаг для команды.</p></div>
          <label className={styles.field} htmlFor="task-title">Название задачи<Input id="task-title" name="title" required pattern=".*\S.*" title="Введите название, содержащее не только пробелы" autoFocus /></label>
          <label className={styles.field} htmlFor="task-assignee">Исполнитель<Input id="task-assignee" name="assignee" required pattern=".*\S.*" title="Введите имя, содержащее не только пробелы" /></label>
          <div className={styles.selects}>
            <label className={styles.field} htmlFor="task-status">Статус<select id="task-status" name="status" className={styles.select} defaultValue="К выполнению">{statuses.map(status => <option key={status}>{status}</option>)}</select></label>
            <label className={styles.field} htmlFor="task-priority">Приоритет<select id="task-priority" name="priority" className={styles.select} defaultValue="Средний">{priorities.map(priority => <option key={priority}>{priority}</option>)}</select></label>
          </div>
          <div className={styles.formActions}><Button type="button" onClick={() => dialog.current?.close()}>Отмена</Button><Button type="submit" variant="primary">Создать задачу</Button></div>
        </form>
      </dialog>
    </div>
  );
}
