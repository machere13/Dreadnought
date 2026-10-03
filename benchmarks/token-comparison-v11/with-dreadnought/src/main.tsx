import { useRef, useState, type FormEvent } from 'react';
import { createRoot } from 'react-dom/client';
import { Badge, Button, Card, Input, Table, Tabs } from '@dreadnought/ui/react';
import styles from './App.module.css';

const statuses = ['К выполнению', 'В работе', 'Готово'] as const;
const priorities = ['Низкий', 'Средний', 'Высокий'] as const;
type Task = {
  id: number;
  name: string;
  assignee: string;
  status: typeof statuses[number];
  priority: typeof priorities[number];
};

const initialTasks: Task[] = [
  { id: 1, name: 'Собрать требования', assignee: 'Анна', status: 'В работе', priority: 'Высокий' },
  { id: 2, name: 'Проверить макет', assignee: 'Борис', status: 'К выполнению', priority: 'Средний' },
  { id: 3, name: 'Подготовить релиз', assignee: 'Вера', status: 'Готово', priority: 'Низкий' },
];

function App() {
  const [tasks, setTasks] = useState(initialTasks);
  const [search, setSearch] = useState('');
  const [tab, setTab] = useState('Все');
  const dialog = useRef<HTMLDialogElement>(null);
  const query = search.trim().toLocaleLowerCase('ru');
  const filtered = tasks.filter(task =>
    (tab === 'Все' || task.status === tab) &&
    `${task.name} ${task.assignee}`.toLocaleLowerCase('ru').includes(query)
  );

  function createTask(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const name = String(data.get('name') ?? '').trim();
    const assignee = String(data.get('assignee') ?? '').trim();
    if (!name || !assignee) return;
    setTasks(current => [...current, {
      id: Math.max(...current.map(task => task.id)) + 1,
      name,
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
        <a href="#board" className={styles.brand}><span className={styles.brandMark}>к</span> команда<span className={styles.brandDot}>.</span></a>
        <div className={styles.workspace}><span className={styles.workspaceIcon}>П</span><div>Продуктовая команда<small>Рабочее пространство</small></div></div>
        <p className={styles.navLabel}>РАБОЧЕЕ ПРОСТРАНСТВО</p>
        <nav aria-label="Основная навигация">
          <a href="#board" aria-current="page" className={styles.navItem}><span aria-hidden="true">▦</span> Командная доска</a>
        </nav>
        <div className={styles.sidebarFooter}><span className={styles.avatar}>ПК</span><div>Продуктовая команда<small>Всё начинается с команды</small></div></div>
      </aside>

      <main id="board" className={styles.main}>
        <div className={styles.breadcrumb}>Рабочее пространство <span>/</span> <strong>Задачи</strong></div>
        <header className={styles.header}>
          <div><p className={styles.eyebrow}>ЗАДАЧИ И ПРОГРЕСС</p><h1>Командная доска</h1><p className={styles.subtitle}>Общий фокус. Понятные приоритеты.</p></div>
          <Button variant="primary" type="button" onClick={() => dialog.current?.showModal()}><span aria-hidden="true">＋</span> Новая задача</Button>
        </header>

        <section className={styles.stats} aria-label="Статистика задач">
          {[
            { label: 'Всего', count: tasks.length, hint: 'Задач в пространстве', mark: '◈' },
            { label: 'В работе', count: tasks.filter(task => task.status === 'В работе').length, hint: 'Двигаемся к результату', mark: '◷' },
            { label: 'Готово', count: tasks.filter(task => task.status === 'Готово').length, hint: 'Уже позади', mark: '✓' },
          ].map(stat => <Card key={stat.label}><div className={styles.statHeading}><h2>{stat.label}</h2><span aria-hidden="true">{stat.mark}</span></div><p className={styles.statValue}>{stat.count}<span>задач</span></p><p className={styles.statHint}>{stat.hint}</p></Card>)}
        </section>

        <section className={styles.tasks} aria-label="Список задач">
          <div className={styles.sectionHeader}><div><h2>Задачи команды</h2><p>От идеи до готового результата</p></div><span className={styles.totalLabel}>{tasks.length} всего</span></div>
          <div className={styles.search}><Input type="search" aria-label="Поиск задач" placeholder="Поиск по задаче или исполнителю…" value={search} onChange={event => setSearch(event.target.value)} /></div>
          <Tabs value={tab} onValueChange={setTab}>
            <div className={styles.tabsScroll}><Tabs.List aria-label="Статус задач">{['Все', ...statuses].map(status => <Tabs.Tab key={status} value={status}>{status}</Tabs.Tab>)}</Tabs.List></div>
            {['Все', ...statuses].map(status => <Tabs.Panel key={status} value={status}>
              <div className={styles.tableScroll}>
                <Table<Task> rowKey="id" pagination={false} locale={{ emptyText: 'Задачи не найдены' }} dataSource={filtered} columns={[
                  { key: 'name', title: 'Задача', dataIndex: 'name', render: (_value, task) => <div className={styles.taskName}><span className={styles.taskNumber}>#{String(task.id).padStart(2, '0')}</span><strong>{task.name}</strong></div> },
                  { key: 'assignee', title: 'Исполнитель', dataIndex: 'assignee', render: (_value, task) => <div className={styles.person}><span className={styles.personAvatar} aria-hidden="true">{task.assignee[0]}</span>{task.assignee}</div> },
                  { key: 'status', title: 'Статус', dataIndex: 'status', render: (_value, task) => <Badge appearance={task.status === 'Готово' ? 'outline' : 'ghosted'}>{task.status}</Badge> },
                  { key: 'priority', title: 'Приоритет', dataIndex: 'priority', render: (_value, task) => <span className={styles.priority}><i className={task.priority === 'Высокий' ? styles.high : task.priority === 'Средний' ? styles.medium : styles.low} />{task.priority}</span> },
                ]} />
              </div>
            </Tabs.Panel>)}
          </Tabs>
          <footer className={styles.tableFooter}>Показано задач: {filtered.length} из {tasks.length}<span>Маленькие шаги — общий результат</span></footer>
        </section>
        <p className={styles.pageFooter}>Пространство для совместной работы</p>
      </main>

      <dialog ref={dialog} className={styles.dialog} aria-labelledby="dialog-title">
        <form onSubmit={createTask} className={styles.form}>
          <div><p className={styles.eyebrow}>НОВЫЙ ШАГ</p><h2 id="dialog-title">Новая задача</h2><p className={styles.subtitle}>Что нужно сделать вашей команде?</p></div>
          <label className={styles.field}>Название задачи<Input autoFocus name="name" required pattern=".*\S.*" title="Введите название, содержащее не только пробелы" placeholder="Например, подготовить презентацию" /></label>
          <label className={styles.field}>Исполнитель<Input name="assignee" required pattern=".*\S.*" title="Введите имя, содержащее не только пробелы" placeholder="Имя участника команды" /></label>
          <div className={styles.selectFields}>
            <label className={styles.field}>Статус<select name="status" defaultValue="К выполнению">{statuses.map(status => <option key={status}>{status}</option>)}</select></label>
            <label className={styles.field}>Приоритет<select name="priority" defaultValue="Средний">{priorities.map(priority => <option key={priority}>{priority}</option>)}</select></label>
          </div>
          <div className={styles.formActions}><Button type="button" variant="secondary" onClick={() => dialog.current?.close()}>Отмена</Button><Button type="submit" variant="primary">Создать задачу</Button></div>
        </form>
      </dialog>
    </div>
  );
}

createRoot(document.getElementById('root')!).render(<App />);
