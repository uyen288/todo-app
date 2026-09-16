import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import './App.css';

// ============================================================================
// MAIN APP COMPONENT
// ============================================================================

function App() {
  const [todos, setTodos] = useState([]);
  const [filter, setFilter] = useState('all'); // 'all', 'active', 'completed'
  const [searchTerm, setSearchTerm] = useState('');
  const [inputValue, setInputValue] = useState('');
  const [inputError, setInputError] = useState('');

  // Load todos from localStorage on mount
  useEffect(() => {
    try {
      const savedTodos = localStorage.getItem('todos');
      if (savedTodos) {
        setTodos(JSON.parse(savedTodos));
      }
    } catch (error) {
      console.error('Error loading todos from localStorage:', error);
    }
  }, []);

  // Save todos to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem('todos', JSON.stringify(todos));
    } catch (error) {
      console.error('Error saving todos to localStorage:', error);
    }
  }, [todos]);

  // Add a new todo
  const handleAddTodo = (e) => {
    e.preventDefault();
    
    if (!inputValue.trim()) {
      setInputError('Công việc không thể trống!');
      return;
    }
    
    setInputError('');
    
    const newTodo = {
      id: Date.now(), // Simple unique ID
      text: inputValue.trim(),
      done: false
    };
    
    setTodos([...todos, newTodo]);
    setInputValue('');
  };

  // Toggle todo completion status
  const handleToggleTodo = (id) => {
    setTodos(todos.map(todo =>
      todo.id === id ? { ...todo, done: !todo.done } : todo
    ));
  };

  // Delete a todo
  const handleDeleteTodo = (id) => {
    setTodos(todos.filter(todo => todo.id !== id));
  };

  // Delete all todos
  const handleDeleteAll = () => {
    if (window.confirm('Bạn chắc chắn muốn xóa tất cả công việc?')) {
      setTodos([]);
    }
  };

  // Filter todos based on status
  const filteredByStatus = todos.filter(todo => {
    if (filter === 'active') return !todo.done;
    if (filter === 'completed') return todo.done;
    return true; // 'all'
  });

  // Further filter by search term
  const filteredTodos = filteredByStatus.filter(todo =>
    todo.text.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Calculate statistics
  const stats = {
    total: todos.length,
    completed: todos.filter(t => t.done).length,
    active: todos.filter(t => !t.done).length
  };

  return (
    <div className="app">
      <header className="app__header">
        <h1>📝 Ứng Dụng Todo</h1>
      </header>

      <main className="app__main">
        {/* Add Todo Form */}
        <form className="app__form" onSubmit={handleAddTodo} noValidate>
          <div className="form-group">
            <label htmlFor="todo-input">Thêm Công Việc Mới</label>
            <input
              id="todo-input"
              type="text"
              value={inputValue}
              onChange={(e) => {
                setInputValue(e.target.value);
                if (inputError) setInputError('');
              }}
              placeholder="Nhập nội dung công việc..."
              aria-invalid={!!inputError}
              aria-describedby={inputError ? 'input-error' : undefined}
            />
            {inputError && (
              <span id="input-error" className="error" role="alert">
                {inputError}
              </span>
            )}
          </div>
          <button type="submit" className="btn btn--primary">
            Thêm
          </button>
        </form>

        {/* Search Bar */}
        <div className="search-bar">
          <label htmlFor="search-input">Tìm Kiếm</label>
          <input
            id="search-input"
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Tìm kiếm công việc..."
          />
        </div>

        {/* Filter Bar */}
        <FilterBar currentFilter={filter} onFilterChange={setFilter} />

        {/* Statistics */}
        <Stats stats={stats} />

        {/* Todo List */}
        {filteredTodos.length > 0 ? (
          <TodoList
            todos={filteredTodos}
            onToggle={handleToggleTodo}
            onDelete={handleDeleteTodo}
          />
        ) : (
          <p className="empty-state">
            {todos.length === 0
              ? 'Không có công việc nào. Thêm một công việc mới!'
              : 'Không tìm thấy công việc phù hợp.'}
          </p>
        )}

        {/* Delete All Button */}
        {todos.length > 0 && (
          <button
            onClick={handleDeleteAll}
            className="btn btn--danger"
            style={{ width: '100%', marginTop: '16px' }}
          >
            Xóa Tất Cả
          </button>
        )}
      </main>
    </div>
  );
}

// ============================================================================
// TODO LIST COMPONENT
// ============================================================================

function TodoList({ todos, onToggle, onDelete }) {
  return (
    <ul className="todo-list" role="list" aria-label="Danh sách công việc">
      {todos.map(todo => (
        <TodoItem
          key={todo.id}
          todo={todo}
          onToggle={onToggle}
          onDelete={onDelete}
        />
      ))}
    </ul>
  );
}

TodoList.propTypes = {
  todos: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      text: PropTypes.string.isRequired,
      done: PropTypes.bool.isRequired
    })
  ).isRequired,
  onToggle: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired
};

// ============================================================================
// TODO ITEM COMPONENT
// ============================================================================

function TodoItem({ todo, onToggle, onDelete }) {
  return (
    <li className={`todo-item ${todo.done ? 'todo-item--completed' : ''}`}>
      <input
        type="checkbox"
        checked={todo.done}
        onChange={() => onToggle(todo.id)}
        className="todo-item__checkbox"
        aria-label={`Đánh dấu hoàn thành: ${todo.text}`}
      />
      <span className="todo-item__text">{todo.text}</span>
      <button
        onClick={() => onDelete(todo.id)}
        className="btn btn--small btn--danger"
        aria-label={`Xóa công việc: ${todo.text}`}
      >
        ✕
      </button>
    </li>
  );
}

TodoItem.propTypes = {
  todo: PropTypes.shape({
    id: PropTypes.number.isRequired,
    text: PropTypes.string.isRequired,
    done: PropTypes.bool.isRequired
  }).isRequired,
  onToggle: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired
};

// ============================================================================
// FILTER BAR COMPONENT
// ============================================================================

function FilterBar({ currentFilter, onFilterChange }) {
  const filters = [
    { value: 'all', label: 'Tất Cả' },
    { value: 'active', label: 'Chưa Hoàn Thành' },
    { value: 'completed', label: 'Đã Hoàn Thành' }
  ];

  return (
    <div className="filter-bar" role="group" aria-label="Lọc công việc">
      {filters.map(f => (
        <button
          key={f.value}
          onClick={() => onFilterChange(f.value)}
          className={`btn btn--filter ${currentFilter === f.value ? 'btn--filter--active' : ''}`}
          aria-pressed={currentFilter === f.value}
        >
          {f.label}
        </button>
      ))}
    </div>
  );
}

FilterBar.propTypes = {
  currentFilter: PropTypes.string.isRequired,
  onFilterChange: PropTypes.func.isRequired
};

// ============================================================================
// STATISTICS COMPONENT
// ============================================================================

function Stats({ stats }) {
  return (
    <div className="stats">
      <div className="stat">
        <span className="stat__number">{stats.total}</span>
        <span className="stat__label">Tổng Cộng</span>
      </div>
      <div className="stat">
        <span className="stat__number">{stats.active}</span>
        <span className="stat__label">Chưa Hoàn</span>
      </div>
      <div className="stat">
        <span className="stat__number">{stats.completed}</span>
        <span className="stat__label">Đã Hoàn</span>
      </div>
    </div>
  );
}

Stats.propTypes = {
  stats: PropTypes.shape({
    total: PropTypes.number.isRequired,
    completed: PropTypes.number.isRequired,
    active: PropTypes.number.isRequired
  }).isRequired
};

export default App;