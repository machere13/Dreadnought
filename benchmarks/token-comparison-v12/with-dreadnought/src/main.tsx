import { useRef, useState, type FormEvent } from 'react';
import { createRoot } from 'react-dom/client';
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

function App() {
  const [tasks, setTasks] = useState(initialTasks);
  const [search, setSearch] = useState('');
  const [tab, setTab] = useState('Все');
  const dialog = useRef<HTMLDialogElement>(null);
  const query = search.trim().toLocaleLowerCase('ru');
  const filteredTasks = tasks.filter(task =>
    (tab === 'Все' || task.status === tab) &&
    `${task.title} ${task.assignee}`.toLocaleLowerCase('ru').includes(query),
  );

  function createTask(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const title = String(data.get('title')).trim();
    const assignee = String(data.get('assignee')).trim();
    if (!title || !assignee) return;
    setTasks(current => [...current, {
      id: Math.max(...current.map(task => task.id)) + 1,
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
        <div className={styles.brand}><span className={styles.brandMark}>к</span> команда<span className={styles.brandDot}>.</span></div>
        <div className={styles.workspace}><span className={styles.workspaceAvatar}>К</span><div>Рабочее пространство<small>Наша команда</small></div></div>
        <p className={styles.navLabel}>РАБОТА</p>
        <nav aria-label="Основная навигация"><a className={styles.activeLink} href="#board" aria-current="page"><span aria-hidden="true">▦</span> Командная доска</a></nav>
        <div className={styles.sidebarFoot}><span className={styles.onlineDot} /> Всё начинается с команды</div>
      </aside>

      <main id="board" className={styles.main}>
        <div className={styles.breadcrumb}>Рабочее пространство <span>/</span> Обзор</div>
        <header className={styles.header}>
          <div><p className={styles.eyebrow}>ВМЕСТЕ К РЕЗУЛЬТАТУ</p><h1>Командная доска</h1><p className={styles.subtitle}>Все задачи команды. Один общий фокус.</p></div>
          <Button variant="primary" type="button" onClick={() => dialog.current?.showModal()}><span aria-hidden="true">＋</span> Новая задача</Button>
        </header>

        <section className={styles.stats} aria-label="Общая статистика задач">
          {[
            { label: 'Всего', count: tasks.length, note: 'Задачи команды', color: styles.neutral },
            { label: 'В работе', count: tasks.filter(task => task.status === 'В работе').length, note: 'Двигаемся вперёд', color: styles.amber },
            { label: 'Готово', count: tasks.filter(task => task.status === 'Готово').length, note: 'Результат уже здесь', color: styles.green },
          ].map(stat => <Card key={stat.label}><div className={styles.statTop}><span>{stat.label}</span><span className={`${styles.statDot} ${stat.color}`} /></div><strong className={styles.statValue}>{stat.count.toString().padStart(2, '0')}</strong><p className={styles.statNote}>{stat.note}</p></Card>)}
        </section>

        <section className={styles.tasks} aria-labelledby="tasks-heading">
          <div className={styles.sectionHeader}><div className={styles.sectionTitle}><h2 id="tasks-heading">Задачи команды</h2><span className={styles.total}>{tasks.length}</span></div><span className={styles.sectionHint}>От идеи до результата</span></div>
          <div className={styles.search}><Input type="search" aria-label="Поиск задач" placeholder="Поиск по задаче или исполнителю…" value={search} onChange={event => setSearch(event.target.value)} /></div>
          <Tabs value={tab} onValueChange={setTab}>
            <div className={styles.tabsScroll}><Tabs.List aria-label="Статус задач">{['Все', ...statuses].map(status => <Tabs.Tab key={status} value={status}>{status}</Tabs.Tab>)}</Tabs.List></div>
            {['Все', ...statuses].map(status => <Tabs.Panel key={status} value={status}>
              <div className={styles.tableScroll} tabIndex={0} role="region" aria-label="Таблица задач">
                <div className={styles.tableWidth}><Table rowKey="id" pagination={false} locale={{ emptyText: 'Задачи не найдены' }} dataSource={filteredTasks} columns={[
                  { key: 'title', title: 'Задача', dataIndex: 'title', render: (_value, task) => <div className={styles.taskTitle}><span className={styles.taskSymbol} aria-hidden="true">✓</span><strong>{task.title}</strong></div> },
                  { key: 'assignee', title: 'Исполнитель', dataIndex: 'assignee', render: (_value, task) => <div className={styles.person}><span className={styles.avatar} aria-hidden="true">{task.assignee.charAt(0).toUpperCase()}</span>{task.assignee}</div> },
                  { key: 'status', title: 'Статус', dataIndex: 'status', render: (_value, task) => <Badge appearance="ghosted">{task.status}</Badge> },
                  { key: 'priority', title: 'Приоритет', dataIndex: 'priority', render: (_value, task) => <span className={styles.priority}><span aria-hidden="true" className={`${styles.priorityDot} ${task.priority === 'Высокий' ? styles.amber : task.priority === 'Средний' ? styles.neutral : styles.green}`} />{task.priority}</span> },
                ]} /></div>
              </div>
            </Tabs.Panel>)}
          </Tabs>
          <p className={styles.tableFooter} aria-live="polite">Показано {filteredTasks.length} из {tasks.length}</p>
        </section>
        <footer className={styles.footer}>Маленькие шаги. Общий результат.</footer>
      </main>

      <dialog ref={dialog} className={styles.dialog} aria-labelledby="dialog-title">
        <form onSubmit={createTask} className={styles.form}>
          <div><p className={styles.eyebrow}>НОВЫЙ ШАГ</p><h2 id="dialog-title">Новая задача</h2><p className={styles.subtitle}>Добавьте задачу в общий план команды.</p></div>
          <label className={styles.field}>Название задачи<Input name="title" required pattern=".*\S.*" title="Введите название, содержащее не только пробелы" autoFocus /></label>
          <label className={styles.field}>Исполнитель<Input name="assignee" required pattern=".*\S.*" title="Введите имя, содержащее не только пробелы" /></label>
          <div className={styles.selects}>
            <label className={styles.field}>Статус<select name="status">{statuses.map(status => <option key={status}>{status}</option>)}</select></label>
            <label className={styles.field}>Приоритет<select name="priority" defaultValue="Средний">{priorities.map(priority => <option key={priority}>{priority}</option>)}</select></label>
          </div>
          <div className={styles.actions}><Button type="button" variant="outlined" onClick={() => dialog.current?.close()}>Отмена</Button><Button type="submit" variant="primary">Создать задачу</Button></div>
        </form>
      </dialog>
    </div>
  );
}

createRoot(document.getElementById('root')!).render(<App />);
