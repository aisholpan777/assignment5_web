

const MAX_IN_PROGRESS = 3;

let tasks = [
  { id: 1, title: 'Design Database Schema', status: 'todo', priority: 'High', tag: 'Backend', completed: false },
  { id: 2, title: 'Create Figma Mockup', status: 'todo', priority: 'Medium', tag: 'Design', completed: false },
  { id: 3, title: 'Setup Application Routing', status: 'inprogress', priority: 'High', tag: 'Frontend', completed: false },
  { id: 4, title: 'Configure Fonts & Styles', status: 'inprogress', priority: 'Low', tag: 'Design', completed: false },
  { id: 5, title: 'Create GitHub Repository', status: 'done', priority: 'High', tag: 'Backend', completed: true },
  { id: 6, title: 'Write README.md File', status: 'done', priority: 'Low', tag: 'Documentation', completed: true },
  { id: 7, title: 'Build Navigation Bar', status: 'todo', priority: 'Medium', tag: 'Frontend', completed: false },
  { id: 8, title: 'Test Form Validation', status: 'todo', priority: 'High', tag: 'Frontend', completed: false },
  { id: 9, title: 'Optimize Assets & Images', status: 'done', priority: 'Low', tag: 'Design', completed: true },
  { id: 10, title: 'Deploy to GitHub Pages', status: 'todo', priority: 'High', tag: 'Backend', completed: false }
];

let nextTaskId = 11;
let searchQuery = '';
let selectedTag = 'all';
let sortDirection = 'high';
let boardMessage = '';

const containerTodo = document.getElementById('container-todo');
const containerInProgress = document.getElementById('container-inprogress');
const containerDone = document.getElementById('container-done');

const searchInput = document.getElementById('t2-search');
const filterSelect = document.getElementById('t2-filter-tag');
const sortSelect = document.getElementById('t2-sort');
const errorMsgEl = document.getElementById('t2-error-msg');
const btnAdd = document.getElementById('t2-btn-add');

const countTodo = document.getElementById('count-todo');
const countInProgress = document.getElementById('count-inprogress');
const countDone = document.getElementById('count-done');

const progressText = document.getElementById('t2-progress-text');
const progressFill = document.getElementById('t2-progress-fill');
const progressBar = document.getElementById('t2-progress-bar');

const boardGrid = document.querySelector('.kanban-board-grid');

const priorityOrder = {
  High: 1,
  Medium: 2,
  Low: 3
};

function showBoardMessage(message) {
  boardMessage = message;
  errorMsgEl.textContent = message;
  errorMsgEl.classList.toggle('hidden', !message);
}

function createTaskCardElement(task) {
  const card = document.createElement('div');

  card.className =
    `kanban-card priority-${task.priority.toLowerCase()}`;

  card.dataset.id = task.id;

  const title = document.createElement('h4');
  title.textContent = task.title;

  const info = document.createElement('p');
  info.className = 'card-info';
  info.textContent =
    `Tag: ${task.tag} | Priority: ${task.priority}`;

  const actionsDiv = document.createElement('div');
  actionsDiv.className = 'card-actions';

  if (task.status !== 'todo') {
    const btnLeft = document.createElement('button');

    btnLeft.type = 'button';
    btnLeft.className = 'btn-sm';
    btnLeft.textContent = '◀ Back';
    btnLeft.dataset.action = 'move-left';

    actionsDiv.appendChild(btnLeft);
  }

  if (task.status !== 'done') {
    const btnRight = document.createElement('button');

    btnRight.type = 'button';
    btnRight.className = 'btn-sm';
    btnRight.textContent = 'Next ▶';
    btnRight.dataset.action = 'move-right';

    actionsDiv.appendChild(btnRight);
  }

  card.appendChild(title);
  card.appendChild(info);
  card.appendChild(actionsDiv);

  return card;
}

function renderKanban() {
  containerTodo.replaceChildren();
  containerInProgress.replaceChildren();
  containerDone.replaceChildren();

  const counts = {
    todo: 0,
    inprogress: 0,
    done: 0
  };

  for (const task of tasks) {
    if (task.status === 'todo') {
      counts.todo++;
    }

    if (task.status === 'inprogress') {
      counts.inprogress++;
    }

    if (task.status === 'done') {
      counts.done++;
    }
  }

  const sortedTasks = [...tasks].sort((a, b) => {
    const difference =
      priorityOrder[a.priority] -
      priorityOrder[b.priority];

    return sortDirection === 'high'
      ? difference
      : -difference;
  });

  let visibleCount = 0;

  const visibleColumns = {
    todo: 0,
    inprogress: 0,
    done: 0
  };

  for (const task of sortedTasks) {
    const matchesSearch = task.title
      .toLowerCase()
      .includes(searchQuery.toLowerCase());

    const matchesTag =
      selectedTag === 'all' ||
      task.tag === selectedTag;

    if (!matchesSearch || !matchesTag) {
      continue;
    }

    const card = createTaskCardElement(task);

    if (task.status === 'todo') {
      containerTodo.appendChild(card);
    }

    if (task.status === 'inprogress') {
      containerInProgress.appendChild(card);
    }

    if (task.status === 'done') {
      containerDone.appendChild(card);
    }

    visibleCount++;
    visibleColumns[task.status]++;
  }

  const columns = [
    { element: containerTodo, status: 'todo' },
    { element: containerInProgress, status: 'inprogress' },
    { element: containerDone, status: 'done' }
  ];

  for (const column of columns) {
    if (visibleColumns[column.status] === 0) {
      const empty = document.createElement('p');

      empty.className = 'empty-state';
      empty.textContent = 'No tasks here';

      column.element.appendChild(empty);
    }
  }

  countTodo.textContent = counts.todo;
  countInProgress.textContent = counts.inprogress;
  countDone.textContent = counts.done;

  const percent = tasks.length > 0
    ? Math.round((counts.done / tasks.length) * 100)
    : 0;

  progressText.textContent = `${percent}%`;

  progressBar.setAttribute('aria-valuenow', percent);

  const roundedPercent = Math.round(percent / 10) * 10;

  progressFill.className = 'progress-bar-fill';
  progressFill.classList.add(`progress-${roundedPercent}`);

  if (boardMessage) {
    showBoardMessage(boardMessage);
  } else if (visibleCount === 0) {
    showBoardMessage('No tasks found matching your criteria.');
  } else {
    showBoardMessage('');
  }
}

function moveTask(taskId, direction) {
  const task = tasks.find(t => t.id === Number(taskId));

  if (!task) {
    showBoardMessage('Task not found.');
    return;
  }

  const statuses = ['todo', 'inprogress', 'done'];
  const currentIndex = statuses.indexOf(task.status);

  let nextIndex;

  if (direction === 'right') {
    nextIndex = currentIndex + 1;
  } else if (direction === 'left') {
    nextIndex = currentIndex - 1;
  } else {
    showBoardMessage('Invalid direction.');
    return;
  }

  if (nextIndex < 0 || nextIndex >= statuses.length) {
    showBoardMessage('Invalid move. Task cannot move there.');
    return;
  }

  const nextStatus = statuses[nextIndex];

  if (nextStatus === 'inprogress') {
    let inProgressCount = 0;

    for (const item of tasks) {
      if (item.status === 'inprogress') {
        inProgressCount++;
      }
    }

    if (inProgressCount >= MAX_IN_PROGRESS) {
      showBoardMessage(
        'Limit reached! In Progress can hold only 3 tasks.'
      );
      return;
    }
  }

  task.status = nextStatus;
  task.completed = nextStatus === 'done';

  boardMessage = '';
  renderKanban();
}

function addNewTask() {
  const title = prompt('Enter new task title:');

  if (title === null) {
    return;
  }

  if (!title.trim()) {
    showBoardMessage('Task title cannot be empty.');
    return;
  }

  const priority = prompt(
    'Priority: High, Medium, Low',
    'Medium'
  );

  if (priority === null) {
    return;
  }

  const normalizedPriority = [
    'High',
    'Medium',
    'Low'
  ].find(
    item =>
      item.toLowerCase() ===
      priority.trim().toLowerCase()
  );

  if (!normalizedPriority) {
    showBoardMessage(
      'Invalid priority. Choose High, Medium or Low.'
    );
    return;
  }

  const tag = prompt(
    'Tag: Frontend, Backend, Design, Documentation',
    'Frontend'
  );

  if (tag === null) {
    return;
  }

  const normalizedTag = [
    'Frontend',
    'Backend',
    'Design',
    'Documentation'
  ].find(
    item =>
      item.toLowerCase() ===
      tag.trim().toLowerCase()
  );

  if (!normalizedTag) {
    showBoardMessage('Invalid tag.');
    return;
  }

  const newTask = {
    id: nextTaskId++,
    title: title.trim(),
    status: 'todo',
    priority: normalizedPriority,
    tag: normalizedTag,
    completed: false
  };

  tasks.push(newTask);

  boardMessage = '';
  renderKanban();
}

boardGrid.addEventListener('click', event => {
  const button = event.target.closest('button[data-action]');

  if (!button || !boardGrid.contains(button)) {
    return;
  }

  const card = button.closest('.kanban-card');

  if (!card) {
    return;
  }

  const direction =
    button.dataset.action === 'move-right'
      ? 'right'
      : 'left';

  moveTask(card.dataset.id, direction);
});

searchInput.addEventListener('input', event => {
  searchQuery = event.target.value;

  boardMessage = '';
  renderKanban();
});

filterSelect.addEventListener('change', event => {
  selectedTag = event.target.value;

  boardMessage = '';
  renderKanban();
});

sortSelect.addEventListener('change', event => {
  sortDirection = event.target.value;

  boardMessage = '';
  renderKanban();
});

btnAdd.addEventListener('click', addNewTask);

renderKanban();
