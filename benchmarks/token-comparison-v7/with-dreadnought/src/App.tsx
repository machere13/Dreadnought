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
  status: (typeof statuses)[number];
  priority: (typeof priorities)[number];
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
  const filteredTasks = tasks.filter(task =>
    (tab === 'Все' || task.status === tab) &&
    [task.title, task.assignee].some(value => value.toLocaleLowerCase().includes(query)),
  );

  function createTask(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const title = String(data.get('title')).trim();
    const assignee = String(data.get('assignee')).trim();
    if (!title || !assignee) return;

    setTasks(current => [...current, {
      id: Math.max(...current.map(task => task.id), 0) + 1,
      title,
      assignee,
      status: data.get('status') as Task['status'],
      priority: data.get('priority') as Task['priority'],
    }]);
    setSearch('');
    setTab('Все');
    event.currentTarget.reset();
    dialog.current?.close();
  }

  return (
    <div className={styles.app}>
      <aside className={styles.sidebar}>
        <div className={styles.brand}><span className={styles.logo}>К</span> Команда</div>
        <div className={styles.navLabel}>РАБОЧЕЕ ПРОСТРАНСТВО</div>
        <nav aria-label="Основная навигация">
          <a className={styles.navLink} href="#board" aria-current="page">
            <span aria-hidden="true">▦</span> Командная доска
          </a>
        </nav>
        <div className={styles.sidebarFooter}>Всё важное — в одном месте.</div>
      </aside>

      <main id="board" className={styles.main}>
        <header className={styles.header}>
          <div>
            <p className={styles.eyebrow}>РАБОЧЕЕ ПРОСТРАНСТВО / ОБЗОР</p>
            <h1>Командная доска</h1>
            <p className={styles.subtitle}>Задачи команды и движение к результату.</p>
          </div>
          <Button onClick={() => dialog.current?.showModal()} icon={<span aria-hidden="true">＋</span>}>
            Новая задача
          </Button>
        </header>

        <section className={styles.stats} aria-label="Статистика задач">
          {['Всего', 'В работе', 'Готово'].map(label => (
            <Card key={label}>
              <div className={styles.stat}>
                <span className={styles.statLabel}>{label}</span>
                <strong className={styles.statValue}>
                  {label === 'Всего' ? tasks.length : tasks.filter(task => task.status === label).length}
                </strong>
              </div>
            </Card>
          ))}
        </section>

        <section className={styles.tasks} aria-labelledby="tasks-heading">
          <div className={styles.toolbar}>
            <div><h2 id="tasks-heading">Задачи</h2><p className={styles.subtitle}>Общий план вашей команды</p></div>
            <div className={styles.search}>
              <Input aria-label="Поиск задач" placeholder="Поиск по задаче или исполнителю" value={search} onChange={event => setSearch(event.target.value)} />
            </div>
          </div>
          <Tabs value={tab} onValueChange={setTab}>
            <div className={styles.tabsScroll}>
              <Tabs.List aria-label="Фильтр по статусу">
                {tabs.map(value => <Tabs.Tab key={value} value={value}>{value}</Tabs.Tab>)}
              </Tabs.List>
            </div>
            {tabs.map(value => (
              <Tabs.Panel key={value} value={value}>
                {value === tab && (
                  <div className={styles.tableScroll}>
                    <div className={styles.tableWidth}>
                      <Table>
                        <Table.Head>
                          <Table.Row>
                            {['Задача', 'Исполнитель', 'Статус', 'Приоритет'].map(heading => <Table.HeaderCell key={heading} scope="col">{heading}</Table.HeaderCell>)}
                          </Table.Row>
                        </Table.Head>
                        <Table.Body>
                          {filteredTasks.map(task => (
                            <Table.Row key={task.id}>
                              <Table.Cell><span className={styles.taskTitle}>{task.title}</span></Table.Cell>
                              <Table.Cell><span className={styles.assignee}><span className={styles.avatar} aria-hidden="true">{task.assignee[0]}</span>{task.assignee}</span></Table.Cell>
                              <Table.Cell><Badge appearance={task.status === 'Готово' ? 'solid' : task.status === 'В работе' ? 'ghosted' : 'outline'}>{task.status}</Badge></Table.Cell>
                              <Table.Cell><span className={styles.priority}><span className={styles.priorityDot} data-priority={task.priority} aria-hidden="true" />{task.priority}</span></Table.Cell>
                            </Table.Row>
                          ))}
                          {filteredTasks.length === 0 && <Table.Row><Table.Cell colSpan={4}><p className={styles.empty}>Задачи не найдены</p></Table.Cell></Table.Row>}
                        </Table.Body>
                      </Table>
                    </div>
                  </div>
                )}
              </Tabs.Panel>
            ))}
          </Tabs>
        </section>
      </main>

      <dialog ref={dialog} className={styles.dialog} aria-labelledby="new-task-title" onClose={event => event.currentTarget.querySelector('form')?.reset()}>
        <form onSubmit={createTask} className={styles.form}>
          <div><p className={styles.eyebrow}>КОМАНДНАЯ ДОСКА</p><h2 id="new-task-title">Новая задача</h2></div>
          <label className={styles.field} htmlFor="task-title">Название задачи
            <Input id="task-title" name="title" required pattern=".*\S.*" title="Введите название, содержащее не только пробелы" autoFocus />
          </label>
          <label className={styles.field} htmlFor="task-assignee">Исполнитель
            <Input id="task-assignee" name="assignee" required pattern=".*\S.*" title="Введите имя, содержащее не только пробелы" />
          </label>
          <div className={styles.selects}>
            <label className={styles.field} htmlFor="task-status">Статус
              <select id="task-status" name="status" defaultValue="К выполнению">{statuses.map(status => <option key={status}>{status}</option>)}</select>
            </label>
            <label className={styles.field} htmlFor="task-priority">Приоритет
              <select id="task-priority" name="priority" defaultValue="Средний">{priorities.map(priority => <option key={priority}>{priority}</option>)}</select>
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
