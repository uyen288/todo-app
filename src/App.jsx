import React, { useEffect, useMemo, useState } from 'react';
import './App.css';

const starterTodos = [
  { id: 1, text: 'Logo Design', group: 'new', done: false },
  { id: 2, text: 'Brochure Design', group: 'new', done: false },
  { id: 3, text: 'Homepage Design', group: 'ongoing', done: false },
  { id: 4, text: 'Logo Changes', group: 'ongoing', done: false },
  { id: 5, text: 'Flyer Design', group: 'completed', done: true },
  { id: 6, text: 'Dashboard', group: 'completed', done: true },
  { id: 7, text: 'ISPS Landing Page', group: 'new', done: false },
];

function Icon({ name, size = 20, stroke = 'currentColor' }) {
  const paths = {
    grid: <><rect x="4" y="4" width="5" height="5" rx="1" /><rect x="15" y="4" width="5" height="5" rx="1" /><rect x="4" y="15" width="5" height="5" rx="1" /><rect x="15" y="15" width="5" height="5" rx="1" /></>,
    search: <><circle cx="11" cy="11" r="6.5" /><path d="m16 16 4 4" /></>,
    bell: <><path d="M18 9a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4" /></>,
    plus: <><path d="M12 5v14M5 12h14" /></>,
    trash: <><path d="M5 7h14M10 11v6M14 11v6M9 7l1-2h4l1 2m-9 0 1 14h10l1-14" /></>,
    settings: <><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1-1.8 1.8-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.5v.1h-2.6v-.1a1.7 1.7 0 0 0-1-1.5 1.7 1.7 0 0 0-1.9.3l-.1.1-1.8-1.8.1-.1a1.7 1.7 0 0 0 .3-1.9 1.7 1.7 0 0 0-1.5-1H6v-2.6h.1a1.7 1.7 0 0 0 1.5-1 1.7 1.7 0 0 0-.3-1.9l-.1-.1L9 6.6l.1.1a1.7 1.7 0 0 0 1.9.3 1.7 1.7 0 0 0 1-1.5v-.1h2.6v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.9-.3l.1-.1 1.8 1.8-.1.1a1.7 1.7 0 0 0-.3 1.9 1.7 1.7 0 0 0 1.5 1h.1V14h-.1a1.7 1.7 0 0 0-1.5 1Z" /></>,
    edit: <><path d="m15 5 4 4-10 10H5v-4L15 5Z" /><path d="m13 7 4 4" /></>,
    clipboard: <><path d="M9 4h6l1 2h3v14H5V6h3l1-2Z" /><path d="M9 10h6M9 14h6M9 18h4" /></>,
  };
  return <svg aria-hidden="true" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">{paths[name]}</svg>;
}

function App() {
  const [todos, setTodos] = useState(() => {
    try { return JSON.parse(localStorage.getItem('todos-v2')) || starterTodos; } catch { return starterTodos; }
  });
  const [activeGroup, setActiveGroup] = useState('all');
  const [search, setSearch] = useState('');
  const [draft, setDraft] = useState('');
  const [notice, setNotice] = useState('');
  const [draggedTaskId, setDraggedTaskId] = useState(null);

  useEffect(() => { localStorage.setItem('todos-v2', JSON.stringify(todos)); }, [todos]);
  useEffect(() => {
    if (!notice) return undefined;
    const timer = setTimeout(() => setNotice(''), 2200);
    return () => clearTimeout(timer);
  }, [notice]);

  const stats = useMemo(() => ({
    total: todos.length,
    completed: todos.filter((todo) => todo.done).length,
    active: todos.filter((todo) => !todo.done).length,
  }), [todos]);

  const filtered = todos.filter((todo) => {
    const matchesGroup = activeGroup === 'all' || todo.group === activeGroup;
    return matchesGroup && todo.text.toLowerCase().includes(search.toLowerCase());
  });

  const addTodo = (event) => {
    event.preventDefault();
    const text = draft.trim();
    if (!text) { setNotice('Please enter a task name first.'); return; }
    setTodos((current) => [...current, { id: Date.now(), text, group: 'new', done: false }]);
    setDraft('');
    setNotice('Task added to New Projects.');
  };

  const toggleTodo = (id) => setTodos((current) => current.map((todo) => todo.id === id ? { ...todo, done: !todo.done, group: !todo.done ? 'completed' : 'ongoing' } : todo));
  const deleteTodo = (id) => { setTodos((current) => current.filter((todo) => todo.id !== id)); setNotice('Task removed.'); };

  const moveTodo = (draggedId, targetId, targetGroup) => {
    if (!draggedId) return;

    setTodos((current) => {
      const sourceIndex = current.findIndex((todo) => todo.id === draggedId);
      if (sourceIndex === -1) return current;

      const sourceTodo = current[sourceIndex];
      const updatedTodo = { ...sourceTodo, group: targetGroup || sourceTodo.group };
      const withoutSource = current.filter((todo) => todo.id !== draggedId);

      if (targetId) {
        const targetIndex = withoutSource.findIndex((todo) => todo.id === targetId);
        if (targetIndex !== -1) {
          withoutSource.splice(targetIndex, 0, updatedTodo);
          return withoutSource;
        }
      }

      return [...withoutSource, updatedTodo];
    });

    setDraggedTaskId(null);
  };

  const visibleFor = (group) => filtered.filter((todo) => todo.group === group);

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand"><span className="brand-mark">✓</span><span>Taskly</span></div>
        <nav className="side-nav" aria-label="Main navigation">
          <button className="nav-link active"><Icon name="grid" /> Overview</button>
          <button className="nav-link" onClick={() => setActiveGroup('all')}><Icon name="clipboard" /> My Tasks <span className="nav-count">{stats.active}</span></button>
          <button className="nav-link" onClick={() => setNotice('Calendar view is coming soon.')}><span className="nav-symbol">◷</span> Calendar</button>
          <button className="nav-link" onClick={() => setNotice('Reports view is coming soon.')}><span className="nav-symbol">▥</span> Reports</button>
        </nav>
        <div className="sidebar-bottom">
          <div className="mini-progress"><div className="mini-progress__top"><span>Weekly focus</span><strong>{Math.round((stats.completed / Math.max(stats.total, 1)) * 100)}%</strong></div><div className="progress-track"><span style={{ width: `${(stats.completed / Math.max(stats.total, 1)) * 100}%` }} /></div><small>Keep your momentum going</small></div>
          <button className="nav-link" onClick={() => setNotice('Settings view is coming soon.')}><Icon name="settings" /> Settings</button>
          <div className="profile"><div className="avatar">AL</div><div><strong>Alex Morgan</strong><span>Product designer</span></div><button aria-label="More profile options" onClick={() => setNotice('Profile menu is coming soon.')}>•••</button></div>
        </div>
      </aside>

      <main className="main-content">
        <header className="topbar"><div><p className="eyebrow">Wednesday, September 18</p><h1>Good morning, Alex <span>✦</span></h1></div><div className="top-actions"><label className="search"><Icon name="search" size={18} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search tasks" aria-label="Search tasks" /></label><button className="icon-button" aria-label="Notifications" onClick={() => setNotice('You are all caught up.') }><Icon name="bell" size={19} /><i /></button></div></header>
        <section className="hero-card"><div className="hero-copy"><p className="eyebrow light">Welcome back!</p><h2>Today’s<br /><em>Work Schedule</em></h2><p className="hero-subtitle">A little progress every day adds up to big results.</p><div className="hero-actions"><button className="round-action primary" onClick={() => document.getElementById('new-task').focus()} aria-label="Add a task"><Icon name="plus" /></button><button className="round-action" onClick={() => setTodos([])} aria-label="Clear all tasks"><Icon name="trash" /></button><button className="round-action" onClick={() => setNotice(`${stats.completed} completed · ${stats.active} remaining`)} aria-label="Show task statistics"><Icon name="settings" /></button></div></div><div className="hero-shape shape-one" /><div className="hero-shape shape-two" /><div className="hero-shape shape-three" /><div className="hero-date"><strong>{stats.active}</strong><span>open<br />tasks</span></div></section>

        <section className="workspace-head"><div><p className="eyebrow">Your workspace</p><h2>Tasklist <span className="task-total">{stats.total} total</span></h2></div><form className="add-form" onSubmit={addTodo}><input id="new-task" value={draft} onChange={(event) => setDraft(event.target.value)} placeholder="Add a new task..." aria-label="New task name" /><button type="submit"><Icon name="plus" size={17} /> Add task</button></form></section>
        <div className="filter-tabs" role="tablist"><button className={activeGroup === 'all' ? 'selected' : ''} onClick={() => setActiveGroup('all')}>All tasks</button><button className={activeGroup === 'new' ? 'selected' : ''} onClick={() => setActiveGroup('new')}>New Projects <b>{todos.filter((todo) => todo.group === 'new').length}</b></button><button className={activeGroup === 'ongoing' ? 'selected' : ''} onClick={() => setActiveGroup('ongoing')}>On Going <b>{todos.filter((todo) => todo.group === 'ongoing').length}</b></button><button className={activeGroup === 'completed' ? 'selected' : ''} onClick={() => setActiveGroup('completed')}>Completed <b>{stats.completed}</b></button></div>

        <div className="board">
          <TaskColumn title="New Projects" color="blue" todos={visibleFor('new')} onToggle={toggleTodo} onDelete={deleteTodo} onAdd={() => setActiveGroup('new')} onDropTask={moveTodo} onDragStart={setDraggedTaskId} onDragEnd={() => setDraggedTaskId(null)} draggedTaskId={draggedTaskId} />
          <TaskColumn title="On Going" color="orange" todos={visibleFor('ongoing')} onToggle={toggleTodo} onDelete={deleteTodo} onAdd={() => setActiveGroup('ongoing')} onDropTask={moveTodo} onDragStart={setDraggedTaskId} onDragEnd={() => setDraggedTaskId(null)} draggedTaskId={draggedTaskId} />
          <TaskColumn title="Completed" color="green" todos={visibleFor('completed')} onToggle={toggleTodo} onDelete={deleteTodo} onAdd={() => setActiveGroup('completed')} onDropTask={moveTodo} onDragStart={setDraggedTaskId} onDragEnd={() => setDraggedTaskId(null)} draggedTaskId={draggedTaskId} />
        </div>
        {filtered.length === 0 && <div className="empty-state">No tasks match your view. Add a task above to get started.</div>}
        {notice && <div className="toast" role="status">{notice}</div>}
      </main>
    </div>
  );
}

function TaskColumn({ title, color, todos, onToggle, onDelete, onAdd, onDropTask, onDragStart, onDragEnd, draggedTaskId }) {
  const columnGroupMap = { blue: 'new', orange: 'ongoing', green: 'completed' };
  const [isDragOver, setIsDragOver] = useState(false);

  return (
    <section
      className={`task-column ${color} ${isDragOver ? 'drag-over' : ''}`}
      onDragEnter={(event) => {
        event.preventDefault();
        setIsDragOver(true);
      }}
      onDragLeave={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) {
          setIsDragOver(false);
        }
      }}
      onDragOver={(event) => {
        event.preventDefault();
        event.dataTransfer.dropEffect = 'move';
        setIsDragOver(true);
      }}
      onDrop={(event) => {
        event.preventDefault();
        setIsDragOver(false);
        const draggedId = Number(event.dataTransfer.getData('text/plain'));
        if (draggedId) onDropTask(draggedId, null, columnGroupMap[color]);
      }}
    >
      <div className="column-heading"><h3>{title}</h3><button onClick={onAdd} aria-label={`Add task to ${title}`}><Icon name="plus" size={18} /></button></div>
      <div className="column-list">
        {todos.map((todo) => (
          <article
            className={`task-card ${todo.done ? 'is-done' : ''} ${draggedTaskId === todo.id ? 'dragging' : ''}`}
            key={todo.id}
            draggable
            onDragStart={(event) => {
              event.dataTransfer.effectAllowed = 'move';
              event.dataTransfer.setData('text/plain', String(todo.id));
              onDragStart(todo.id);
            }}
            onDragOver={(event) => {
              event.preventDefault();
              event.dataTransfer.dropEffect = 'move';
            }}
            onDrop={(event) => {
              event.preventDefault();
              const draggedId = Number(event.dataTransfer.getData('text/plain'));
              if (draggedId && draggedId !== todo.id) {
                onDropTask(draggedId, todo.id, columnGroupMap[color]);
              }
            }}
            onDragEnd={() => {
              onDragEnd();
            }}
          >
            <button className="check" onClick={() => onToggle(todo.id)} aria-label={`${todo.done ? 'Reopen' : 'Complete'} ${todo.text}`}>{todo.done ? '✓' : ''}</button>
            <Icon name="clipboard" size={21} stroke={color === 'orange' ? '#fff' : color === 'green' ? '#168c35' : '#3156a7'} />
            <span>{todo.text}</span>
            <button className="delete-task" onClick={() => onDelete(todo.id)} aria-label={`Delete ${todo.text}`}>×</button>
          </article>
        ))}
      </div>
      {todos.length === 0 && <p className="column-empty">Nothing here yet</p>}
    </section>
  );
}

export default App;
