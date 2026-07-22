// ==========================================================
// Todo List 앱 — 추가/수정/삭제/완료토글/카테고리필터/진행률/localStorage 저장
// ==========================================================

const CATEGORY_LABELS = {
  personal: '개인',
  study: '공부',
  work: '업무',
  hobby: '취미',
};

const STORAGE_KEY = 'todo-app-data';

let todos = [];
let nextId = 1;
let editingId = null;
let currentFilter = 'all';

let todoInput, categorySelect, addBtn, todoListEl, emptyStateEl, emptyStateTextEl, progressFillEl, progressTextEl, filterTabsEl;

document.addEventListener('DOMContentLoaded', init);

function init() {
  todoInput = document.getElementById('todoInput');
  categorySelect = document.getElementById('categorySelect');
  addBtn = document.getElementById('addBtn');
  todoListEl = document.getElementById('todoList');
  emptyStateEl = document.getElementById('emptyState');
  emptyStateTextEl = document.getElementById('emptyStateText');
  progressFillEl = document.getElementById('progressFill');
  progressTextEl = document.getElementById('progressText');
  filterTabsEl = document.getElementById('filterTabs');

  todos = loadTodos();
  nextId = todos.reduce((max, t) => Math.max(max, Number(t.id) || 0), 0) + 1;

  renderTodayDate();
  render();

  addBtn.addEventListener('click', handleAdd);
  todoInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') handleAdd();
  });
  todoListEl.addEventListener('click', handleListClick);
  todoListEl.addEventListener('keydown', handleListKeydown);
  filterTabsEl.addEventListener('click', handleFilterClick);
}

function renderTodayDate() {
  const dateEl = document.getElementById('todayDate');
  if (!dateEl) return;

  const days = ['일', '월', '화', '수', '목', '금', '토'];
  const today = new Date();
  const y = today.getFullYear();
  const m = today.getMonth() + 1;
  const d = today.getDate();
  const day = days[today.getDay()];

  dateEl.textContent = `${y}년 ${m}월 ${d}일 ${day}요일`;
}

// ----------------------------------------------------------
// localStorage 연동
// ----------------------------------------------------------

function loadTodos() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];

    const parsed = JSON.parse(raw);
    if (parsed && Array.isArray(parsed.todos)) {
      return parsed.todos;
    }
    return [];
  } catch (err) {
    console.error('할 일 데이터를 불러오는 중 오류가 발생했습니다:', err);
    return [];
  }
}

function saveTodos() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ todos }));
  } catch (err) {
    console.error('할 일 데이터를 저장하는 중 오류가 발생했습니다:', err);
  }
}

// ----------------------------------------------------------
// 상태 변경 함수
// ----------------------------------------------------------

function handleAdd() {
  const text = todoInput.value.trim();
  if (!text) {
    todoInput.focus();
    return;
  }

  todos.push({
    id: nextId++,
    text,
    category: categorySelect.value,
    completed: false,
    createdAt: new Date().toISOString(),
  });

  todoInput.value = '';
  todoInput.focus();
  render();
}

function deleteTodo(id) {
  todos = todos.filter((t) => t.id !== id);
  if (editingId === id) editingId = null;
  render();
}

function toggleComplete(id) {
  const todo = todos.find((t) => t.id === id);
  if (!todo) return;
  todo.completed = !todo.completed;
  render();
}

function startEdit(id) {
  editingId = id;
  render();

  const input = todoListEl.querySelector(`.todo-item[data-id="${id}"] .todo-edit-input`);
  if (input) {
    input.focus();
    input.select();
  }
}

function cancelEdit() {
  editingId = null;
  render();
}

function saveEdit(li, id) {
  const input = li.querySelector('.todo-edit-input');
  const select = li.querySelector('.todo-edit-category');
  const text = input.value.trim();

  if (!text) {
    input.focus();
    return;
  }

  const todo = todos.find((t) => t.id === id);
  if (!todo) return;

  todo.text = text;
  todo.category = select.value;
  editingId = null;
  render();
}

// ----------------------------------------------------------
// 이벤트 위임 핸들러
// ----------------------------------------------------------

function handleListClick(e) {
  const li = e.target.closest('.todo-item');
  if (!li) return;
  const id = Number(li.dataset.id);

  if (e.target.closest('.todo-item-delete')) {
    deleteTodo(id);
    return;
  }
  if (e.target.closest('.todo-edit-save')) {
    saveEdit(li, id);
    return;
  }
  if (e.target.closest('.todo-edit-cancel')) {
    cancelEdit();
    return;
  }
  if (e.target.closest('.todo-item-checkbox')) {
    toggleComplete(id);
    return;
  }
  if (e.target.closest('.todo-item-edit') || e.target.closest('.todo-item-text')) {
    startEdit(id);
    return;
  }
}

function handleFilterClick(e) {
  const tab = e.target.closest('.filter-tab');
  if (!tab) return;

  currentFilter = tab.dataset.filter;

  filterTabsEl.querySelectorAll('.filter-tab').forEach((btn) => {
    btn.classList.toggle('active', btn === tab);
  });

  renderList();
}

function handleListKeydown(e) {
  const li = e.target.closest('.todo-item.editing');
  if (!li) return;
  const id = Number(li.dataset.id);

  if (e.key === 'Enter') {
    e.preventDefault();
    saveEdit(li, id);
  } else if (e.key === 'Escape') {
    e.preventDefault();
    cancelEdit();
  }
}

// ----------------------------------------------------------
// 렌더링 (상태가 바뀔 때마다 이 함수만 호출하면 화면이 갱신됨)
// ----------------------------------------------------------

function render() {
  saveTodos();
  renderProgress();
  renderList();
}

function renderProgress() {
  const total = todos.length;
  const completed = todos.filter((t) => t.completed).length;
  const percent = total === 0 ? 0 : Math.round((completed / total) * 100);

  progressFillEl.style.width = `${percent}%`;
  progressTextEl.textContent = `${completed}/${total} 완료`;
}

function getVisibleTodos() {
  const filtered = currentFilter === 'all'
    ? todos
    : todos.filter((t) => t.category === currentFilter);

  // 완료된 항목은 하단으로, 나머지는 기존 순서를 유지하는 안정 정렬
  return filtered
    .map((todo, index) => ({ todo, index }))
    .sort((a, b) => {
      if (a.todo.completed === b.todo.completed) return a.index - b.index;
      return a.todo.completed ? 1 : -1;
    })
    .map((entry) => entry.todo);
}

function getEmptyMessage() {
  if (currentFilter === 'all') return '할 일이 없습니다';
  return `${CATEGORY_LABELS[currentFilter]} 카테고리에 할 일이 없습니다`;
}

function renderList() {
  todoListEl.innerHTML = '';

  const visibleTodos = getVisibleTodos();

  if (visibleTodos.length === 0) {
    emptyStateTextEl.textContent = getEmptyMessage();
    emptyStateEl.style.display = '';
    return;
  }
  emptyStateEl.style.display = 'none';

  visibleTodos.forEach((todo) => {
    const li = document.createElement('li');
    const isEditing = editingId === todo.id;

    li.className = [
      'todo-item',
      `category-${todo.category}`,
      todo.completed ? 'completed' : '',
      isEditing ? 'editing' : '',
    ].filter(Boolean).join(' ');
    li.dataset.id = String(todo.id);

    li.innerHTML = isEditing ? renderEditMarkup(todo) : renderViewMarkup(todo);
    todoListEl.appendChild(li);
  });
}

function renderViewMarkup(todo) {
  return `
    <input type="checkbox" class="todo-item-checkbox" ${todo.completed ? 'checked' : ''}>
    <span class="todo-item-text">${escapeHtml(todo.text)}</span>
    <span class="todo-item-badge">${CATEGORY_LABELS[todo.category] || todo.category}</span>
    <button type="button" class="todo-item-edit" title="수정" aria-label="수정">✏️</button>
    <button type="button" class="todo-item-delete" title="삭제" aria-label="삭제">×</button>
  `;
}

function renderEditMarkup(todo) {
  const options = Object.entries(CATEGORY_LABELS)
    .map(([value, label]) => `<option value="${value}" ${todo.category === value ? 'selected' : ''}>${label}</option>`)
    .join('');

  return `
    <input type="text" class="todo-edit-input" value="${escapeHtml(todo.text)}">
    <select class="todo-edit-category">${options}</select>
    <button type="button" class="todo-edit-save" title="저장" aria-label="저장">✔</button>
    <button type="button" class="todo-edit-cancel" title="취소" aria-label="취소">✕</button>
  `;
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
