import { useEffect, useRef, useState } from 'react';
import type { FormEvent } from 'react';
import { Badge, Button, Card, Input, Table, Tabs } from '@dreadnought/ui/react';
import styles from './App.module.css';

type Status = 'В работе' | 'Готово' | 'К выполнению';
type Priority = 'Высокий' | 'Средний' | 'Низкий';
type Task = { id: number; title: string; assignee: string; status: Status; priority: Priority };

const initialTasks: Task[] = [
  { id: 1, title: 'Собрать требования', assignee: 'Анна Морозова', status: 'В работе', priority: 'Высокий' },
  { id: 2, title: 'Обновить дизайн-систему', assignee: 'Марк Соколов', status: 'В работе', priority: 'Средний' },
  { id: 3, title: 'Подготовить сценарии тестирования', assignee: 'Дарья Волкова', status: 'К выполнению', priority: 'Средний' },
  { id: 4, title: 'Согласовать план релиза', assignee: 'Илья Петров', status: 'Готово', priority: 'Высокий' },
  { id: 5, title: 'Проверить аналитику', assignee: 'Елена Смирнова', status: 'Готово', priority: 'Низкий' },
];

const filters = [
  { value: 'all', label: 'Все задачи' },
  { value: 'В работе', label: 'В работе' },
  { value: 'К выполнению', label: 'К выполнению' },
  { value: 'Готово', label: 'Готово' },
] as const;

function TaskTable({ tasks }: { tasks: Task[] }) {
  if (!tasks.length) return <div className={styles.empty}>Задачи не найдены</div>;
  return <div className={styles.tableScroll}>
    <Table className={styles.taskTable}>
      <Table.Head><Table.Row>
        <Table.HeaderCell scope="col">Задача</Table.HeaderCell>
        <Table.HeaderCell scope="col">Исполнитель</Table.HeaderCell>
        <Table.HeaderCell scope="col">Статус</Table.HeaderCell>
        <Table.HeaderCell scope="col">Приоритет</Table.HeaderCell>
      </Table.Row></Table.Head>
      <Table.Body>{tasks.map(task => <Table.Row key={task.id}>
        <Table.Cell><span className={styles.taskTitle}>{task.title}</span><span className={styles.taskId}>TASK-{String(task.id).padStart(3, '0')}</span></Table.Cell>
        <Table.Cell><span className={styles.person}><span className={styles.avatar}>{task.assignee.split(' ').map(part => part[0]).join('')}</span>{task.assignee}</span></Table.Cell>
        <Table.Cell><Badge appearance="ghosted">{task.status}</Badge></Table.Cell>
        <Table.Cell><span className={styles.priority}><span className={`${styles.priorityDot} ${styles[task.priority]}`} />{task.priority}</span></Table.Cell>
      </Table.Row>)}</Table.Body>
    </Table>
  </div>;
}

export default function App() {
  const [tasks, setTasks] = useState(initialTasks);
  const [search, setSearch] = useState('');
  const [tab, setTab] = useState('all');
  const [modalOpen, setModalOpen] = useState(false);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const nextId = useRef(initialTasks.length + 1);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (modalOpen) dialog?.showModal();
    else dialog?.close();
  }, [modalOpen]);

  function addTask(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const title = String(data.get('title') ?? '').trim();
    const assignee = String(data.get('assignee') ?? '').trim();
    if (!title || !assignee) return;
    setTasks(current => [{ id: nextId.current++, title, assignee, status: data.get('status') as Status, priority: data.get('priority') as Priority }, ...current]);
    event.currentTarget.reset();
    setTab('all');
    setSearch('');
    setModalOpen(false);
  }

  const matchesSearch = (task: Task) => `${task.title} ${task.assignee} ${task.status} ${task.priority}`.toLocaleLowerCase('ru').includes(search.trim().toLocaleLowerCase('ru'));
  const countInProgress = tasks.filter(task => task.status === 'В работе').length;
  const countDone = tasks.filter(task => task.status === 'Готово').length;

  return <div className={styles.app}>
    <aside className={styles.sidebar}>
      <div className={styles.brand}><span className={styles.brandMark}>◈</span><span>orbit<span className={styles.brandAccent}>.</span></span></div>
      <div className={styles.sideLabel}>РАБОЧЕЕ ПРОСТРАНСТВО</div>
      <nav aria-label="Основная навигация" className={styles.nav}>
        <a className={styles.navActive} href="#dashboard"><span>▦</span> Командная доска</a>
        <a href="#tasks"><span>☷</span> Задачи <span className={styles.navCount}>{tasks.length}</span></a>
      </nav>
      <div className={styles.sidebarBottom}><span className={styles.teamIcon}>О</span><span><strong>Команда Orbit</strong><small>Рабочее пространство</small></span><span className={styles.chevron}>⌄</span></div>
    </aside>

    <main id="dashboard" className={styles.main}>
      <header className={styles.topbar}><div className={styles.breadcrumb}>Рабочее пространство <span>/</span> <strong>Обзор</strong></div><div className={styles.topbarRight}><span className={styles.today}>КОМАНДА · 2026</span><span className={styles.topAvatar}>О</span></div></header>
      <div className={styles.content}>
        <div className={styles.heading}><div><div className={styles.eyebrow}>ПРОСТРАНСТВО / ОБЗОР</div><h1>Командная доска</h1><p>Все задачи команды в одном месте. Следите за прогрессом и оставайтесь на связи.</p></div><Button variant="primary" onClick={() => setModalOpen(true)}>＋ Новая задача</Button></div>

        <section className={styles.stats} aria-label="Статистика задач">
          <Card><div className={styles.stat}><span className={styles.statLabel}>ВСЕГО ЗАДАЧ <span>↗</span></span><strong>{tasks.length}</strong><small>В рабочем пространстве</small></div></Card>
          <Card><div className={styles.stat}><span className={styles.statLabel}>В РАБОТЕ <span className={styles.yellowIcon}>◌</span></span><strong>{countInProgress}</strong><small>Активные задачи</small></div></Card>
          <Card><div className={styles.stat}><span className={styles.statLabel}>ВЫПОЛНЕНО <span className={styles.greenIcon}>✓</span></span><strong>{countDone}</strong><small>Завершённые задачи</small></div></Card>
        </section>

        <section id="tasks" className={styles.tasksSection} aria-labelledby="tasks-title">
          <div className={styles.sectionHeading}><div><h2 id="tasks-title">Задачи <span>{tasks.length}</span></h2><p>Управляйте работой команды</p></div><div className={styles.search}><span aria-hidden="true">⌕</span><Input className={styles.searchInput} type="search" aria-label="Поиск задач" placeholder="Поиск задач..." value={search} onChange={event => setSearch(event.target.value)} /></div></div>
          <Tabs value={tab} onValueChange={setTab}>
            <Tabs.List aria-label="Фильтр задач">{filters.map(filter => <Tabs.Tab key={filter.value} value={filter.value}>{filter.label}</Tabs.Tab>)}</Tabs.List>
            {filters.map(filter => <Tabs.Panel key={filter.value} value={filter.value}><TaskTable tasks={tasks.filter(task => (filter.value === 'all' || task.status === filter.value) && matchesSearch(task))} /></Tabs.Panel>)}
          </Tabs>
          <div className={styles.listFooter}>Показано {tasks.filter(task => (tab === 'all' || task.status === tab) && matchesSearch(task)).length} из {tasks.length} задач</div>
        </section>
      </div>
    </main>

    <dialog ref={dialogRef} className={styles.dialog} onClose={() => setModalOpen(false)} aria-labelledby="dialog-title">
      <form onSubmit={addTask} className={styles.form}>
        <div className={styles.dialogHeading}><div><div className={styles.eyebrow}>НОВАЯ ЗАДАЧА</div><h2 id="dialog-title">Добавить задачу</h2><p>Заполните детали для вашей команды.</p></div><Button type="button" variant="ghosted" onClick={() => setModalOpen(false)} aria-label="Закрыть">✕</Button></div>
        <label>Название задачи <span>*</span><Input className={styles.fieldInput} name="title" required autoFocus placeholder="Например, подготовить презентацию" /></label>
        <label>Исполнитель <span>*</span><Input className={styles.fieldInput} name="assignee" required placeholder="Имя и фамилия" /></label>
        <div className={styles.formRow}><label>Статус<select name="status" defaultValue="К выполнению"><option>К выполнению</option><option>В работе</option><option>Готово</option></select></label><label>Приоритет<select name="priority" defaultValue="Средний"><option>Низкий</option><option>Средний</option><option>Высокий</option></select></label></div>
        <div className={styles.formActions}><Button type="button" variant="secondary" onClick={() => setModalOpen(false)}>Отмена</Button><Button type="submit" variant="primary">Создать задачу</Button></div>
      </form>
    </dialog>
  </div>;
}
