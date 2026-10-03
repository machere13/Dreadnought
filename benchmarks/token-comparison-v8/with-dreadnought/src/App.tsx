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
  const query = search.trim().toLocaleLowerCase('ru');
  const visibleTasks = tasks.filter(task =>
    (tab === 'Все' || task.status === tab) &&
    `${task.title} ${task.assignee}`.toLocaleLowerCase('ru').includes(query),
  );
  const counters = [
    { label: 'Всего', count: tasks.length, note: 'Задач в команде' },
    { label: 'В работе', count: tasks.filter(task => task.status === 'В работе').length, note: 'В центре внимания' },
    { label: 'Готово', count: tasks.filter(task => task.status === 'Готово').length, note: 'Работа завершена' },
  ];

  function createTask(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const title = String(data.get('title') ?? '').trim();
    const assignee = String(data.get('assignee') ?? '').trim();
    if (!title || !assignee) return;
    setTasks(previous => [...previous, {
      id: Math.max(...previous.map(task => task.id), 0) + 1,
      title,
      assignee,
      status: data.get('status') as Task['status'],
      priority: data.get('priority') as Task['priority'],
    }]);
    setSearch('');
    setTab('Все');
    dialog.current?.close();
  }

  return (
    <div className={styles.app}>
      <aside className={styles.sidebar}>
        <div className={styles.brand}><span className={styles.brandMark}>К</span> Команда</div>
        <nav aria-label="Основная навигация">
          <p className={styles.navLabel}>РАБОЧЕЕ ПРОСТРАНСТВО</p>
          <a className={styles.navLink} href="#board" aria-current="page">
            <span aria-hidden="true">▦</span> Командная доска
          </a>
        </nav>
        <div className={styles.sidebarFooter}><span className={styles.liveDot} /> Всё начинается с задачи</div>
      </aside>

      <main id="board" className={styles.main}>
        <header className={styles.header}>
          <div>
            <p className={styles.eyebrow}>РАБОЧЕЕ ПРОСТРАНСТВО / ОБЗОР</p>
            <h1 className={styles.title}>Командная доска</h1>
            <p className={styles.subtitle}>Общий план. Понятный прогресс.</p>
          </div>
          <Button onClick={() => dialog.current?.showModal()} icon={<span aria-hidden="true">＋</span>}>
            Новая задача
          </Button>
        </header>

        <section className={styles.counters} aria-label="Сводка по задачам">
          {counters.map(counter => (
            <Card key={counter.label}>
              <div className={styles.counterHeading}>{counter.label}<span aria-hidden="true">↗</span></div>
              <div className={styles.counterValue}>{counter.count}</div>
              <p className={styles.counterNote}>{counter.note}</p>
            </Card>
          ))}
        </section>

        <section className={styles.taskSection} aria-labelledby="tasks-heading">
          <div className={styles.sectionHeader}>
            <div><h2 id="tasks-heading">Задачи команды</h2><p className={styles.subtitle}>От идеи до результата</p></div>
            <div className={styles.search}>
              <Input aria-label="Поиск задач" placeholder="Поиск задач…" value={search} onChange={event => setSearch(event.target.value)} />
            </div>
          </div>
          <Tabs value={tab} onValueChange={setTab}>
            <div className={styles.tabScroll}>
              <Tabs.List aria-label="Фильтр по статусу">
                {tabs.map(value => <Tabs.Tab key={value} value={value}>{value}</Tabs.Tab>)}
              </Tabs.List>
            </div>
            {tabs.map(value => (
              <Tabs.Panel key={value} value={value}>
                {value === tab && (
                  <div className={styles.tableScroll}>
                    <Table aria-label="Задачи команды">
                      <Table.Head><Table.Row>
                        <Table.HeaderCell scope="col">Задача</Table.HeaderCell>
                        <Table.HeaderCell scope="col">Исполнитель</Table.HeaderCell>
                        <Table.HeaderCell scope="col">Статус</Table.HeaderCell>
                        <Table.HeaderCell scope="col">Приоритет</Table.HeaderCell>
                      </Table.Row></Table.Head>
                      <Table.Body>
                        {visibleTasks.map(task => (
                          <Table.Row key={task.id}>
                            <Table.Cell><div className={styles.taskName}><span className={styles.taskId}>#{String(task.id).padStart(2, '0')}</span>{task.title}</div></Table.Cell>
                            <Table.Cell><span className={styles.assignee}><span className={styles.avatar} aria-hidden="true">{task.assignee.charAt(0)}</span>{task.assignee}</span></Table.Cell>
                            <Table.Cell><Badge appearance={task.status === 'Готово' ? 'solid' : task.status === 'В работе' ? 'ghosted' : 'outline'}>{task.status}</Badge></Table.Cell>
                            <Table.Cell><span className={styles.priority}><span className={styles.priorityDot} data-priority={task.priority} aria-hidden="true" />{task.priority}</span></Table.Cell>
                          </Table.Row>
                        ))}
                        {!visibleTasks.length && <Table.Row><Table.Cell colSpan={4}><div className={styles.empty}>Задачи не найдены</div></Table.Cell></Table.Row>}
                      </Table.Body>
                    </Table>
                  </div>
                )}
              </Tabs.Panel>
            ))}
          </Tabs>
          <p className={styles.tableFooter}>Показано {visibleTasks.length} из {tasks.length}</p>
        </section>
      </main>

      <dialog ref={dialog} className={styles.dialog} aria-labelledby="new-task-title" onClose={event => event.currentTarget.querySelector('form')?.reset()}>
        <form onSubmit={createTask} className={styles.form}>
          <div><p className={styles.eyebrow}>НОВАЯ ЗАПИСЬ</p><h2 id="new-task-title">Новая задача</h2></div>
          <label className={styles.field} htmlFor="task-title">Название задачи
            <Input id="task-title" name="title" required pattern=".*\S.*" title="Введите название, состоящее не только из пробелов" autoFocus placeholder="Что нужно сделать?" />
          </label>
          <label className={styles.field} htmlFor="task-assignee">Исполнитель
            <Input id="task-assignee" name="assignee" required pattern=".*\S.*" title="Введите имя, состоящее не только из пробелов" placeholder="Имя участника" />
          </label>
          <div className={styles.selects}>
            <label className={styles.field} htmlFor="task-status">Статус
              <select className={styles.select} id="task-status" name="status">{statuses.map(status => <option key={status}>{status}</option>)}</select>
            </label>
            <label className={styles.field} htmlFor="task-priority">Приоритет
              <select className={styles.select} id="task-priority" name="priority" defaultValue="Средний">{priorities.map(priority => <option key={priority}>{priority}</option>)}</select>
            </label>
          </div>
          <div className={styles.formActions}>
            <Button type="button" variant="outlined" onClick={() => dialog.current?.close()}>Отмена</Button>
            <Button type="submit">Создать задачу</Button>
          </div>
        </form>
      </dialog>
    </div>
  );
}
