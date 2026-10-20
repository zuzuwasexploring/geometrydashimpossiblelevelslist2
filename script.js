const STORAGE_KEYS = {
  users: 'gd-impossible-users-v1',
  levels: 'gd-impossible-levels-v1',
  currentUser: 'gd-impossible-current-user-v1'
};

const DEFAULT_ADMIN = {
  username: 'admin',
  password: 'admin123',
  role: 'admin'
};

const FALLBACK_THUMBNAIL = 'https://placehold.co/1280x720/16213a/edf3ff?text=GD+Level';

function showMessage(message, isError = false) {
  const box = document.getElementById('message-box');
  box.textContent = message;
  box.classList.toggle('error', isError);
  box.classList.remove('hidden');
}

function hideMessage() {
  const box = document.getElementById('message-box');
  box.classList.add('hidden');
}

function getUsers() {
  const raw = localStorage.getItem(STORAGE_KEYS.users);
  if (!raw) {
    localStorage.setItem(STORAGE_KEYS.users, JSON.stringify([DEFAULT_ADMIN]));
    return [DEFAULT_ADMIN];
  }

  try {
    const users = JSON.parse(raw);
    if (!Array.isArray(users) || users.length === 0) {
      localStorage.setItem(STORAGE_KEYS.users, JSON.stringify([DEFAULT_ADMIN]));
      return [DEFAULT_ADMIN];
    }
    return users;
  } catch (error) {
    localStorage.setItem(STORAGE_KEYS.users, JSON.stringify([DEFAULT_ADMIN]));
    return [DEFAULT_ADMIN];
  }
}

function saveUsers(users) {
  localStorage.setItem(STORAGE_KEYS.users, JSON.stringify(users));
}

function getCurrentUser() {
  const username = localStorage.getItem(STORAGE_KEYS.currentUser);
  if (!username) return null;

  const users = getUsers();
  return users.find((user) => user.username === username) || null;
}

function setCurrentUser(username) {
  if (username) {
    localStorage.setItem(STORAGE_KEYS.currentUser, username);
  } else {
    localStorage.removeItem(STORAGE_KEYS.currentUser);
  }
}

function getLevels() {
  const raw = localStorage.getItem(STORAGE_KEYS.levels);
  const seed = [
    {
      id: 'seed-1',
      name: 'Lucid Hell',
      creator: 'zuzu',
      videoId: 'dQw4w9WgXcQ',
      thumbnail: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80',
      length: 91,
      fps: 240,
      cps: 11.4,
      difficulty: 96,
      bestRun: '0.28s deathless',
      gameMode: 'Normal',
      description: 'A brutal mix of precision wave sections and impossible timing.',
      extraStats: 'Fast spikes, inconsistent timing, impossible flicks.',
      status: 'approved',
      submittedBy: 'admin'
    },
    {
      id: 'seed-2',
      name: 'Night Circuit',
      creator: 'uNknown',
      videoId: 'ScMzIvxBSi4',
      thumbnail: 'https://images.unsplash.com/photo-1545239351-1141bd82e8a6?auto=format&fit=crop&w=1200&q=80',
      length: 134,
      fps: 240,
      cps: 9.2,
      difficulty: 89,
      bestRun: 'Pace clear by BxB',
      gameMode: 'Wave',
      description: 'A wave-heavy level designed to punish early mistakes and reward consistency.',
      extraStats: 'Dense wave spam and long rhythm chains.',
      status: 'approved',
      submittedBy: 'admin'
    }
  ];

  if (!raw) {
    localStorage.setItem(STORAGE_KEYS.levels, JSON.stringify(seed));
    return seed;
  }

  try {
    const levels = JSON.parse(raw);
    return Array.isArray(levels) && levels.length > 0 ? levels : seed;
  } catch (error) {
    localStorage.setItem(STORAGE_KEYS.levels, JSON.stringify(seed));
    return seed;
  }
}

function saveLevels(levels) {
  localStorage.setItem(STORAGE_KEYS.levels, JSON.stringify(levels));
}

function renderAuthState() {
  const current = getCurrentUser();
  const guestActions = document.getElementById('guest-actions');
  const userBar = document.getElementById('user-bar');
  const currentUserLabel = document.getElementById('current-user-label');
  const adminPanel = document.getElementById('admin-panel');

  if (current) {
    guestActions.classList.add('hidden');
    userBar.classList.remove('hidden');
    currentUserLabel.textContent = `${current.username} (${current.role})`;
    adminPanel.classList.toggle('hidden', current.role !== 'admin');
  } else {
    guestActions.classList.remove('hidden');
    userBar.classList.add('hidden');
    adminPanel.classList.add('hidden');
  }
}

function renderLevels() {
  const levels = getLevels();
  const approved = levels.filter((level) => level.status === 'approved');
  const grid = document.getElementById('levels-grid');
  const pendingList = document.getElementById('pending-list');

  const currentUser = getCurrentUser();

  grid.innerHTML = approved.map((level) => {
    const imageSrc = level.thumbnail && /\.(png|gif|jpe?g|webp)$/i.test(level.thumbnail)
      ? level.thumbnail
      : `https://img.youtube.com/vi/${level.videoId}/maxresdefault.jpg`;

    return `
      <article class="level-card">
        <img class="level-thumb" src="${imageSrc}" alt="${level.name}" onerror="this.src='${FALLBACK_THUMBNAIL}'" />
        <div class="level-body">
          <div class="level-name-row">
            <h3 class="level-name">${escapeHtml(level.name)}</h3>
            <span class="badge">${level.difficulty}/100</span>
          </div>

          <div class="meta">
            <div><strong>Creator</strong> ${escapeHtml(level.creator)}</div>
            <div><strong>Best</strong> ${escapeHtml(level.bestRun)}</div>
            <div><strong>Length</strong> ${level.length}s</div>
            <div><strong>FPS</strong> ${level.fps}</div>
            <div><strong>CPS</strong> ${level.cps}</div>
            <div><strong>Mode</strong> ${escapeHtml(level.gameMode)}</div>
          </div>

          <p class="level-description">${escapeHtml(level.description)}</p>

          <div class="video-shell">
            <iframe
              class="iframe"
              src="https://www.youtube.com/embed/${level.videoId}?rel=0"
              title="${escapeHtml(level.name)} video"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowfullscreen
            ></iframe>
          </div>
        </div>
      </article>
    `;
  }).join('');

  if (currentUser && currentUser.role === 'admin') {
    const pending = levels.filter((level) => level.status === 'pending');
    pendingList.innerHTML = pending.length
      ? pending.map((level) => `
          <div class="pending-item">
            <h3>${escapeHtml(level.name)}</h3>
            <p>By ${escapeHtml(level.creator)} • ${escapeHtml(level.bestRun)}</p>
            <div class="pending-buttons">
              <button class="mini-btn approve" data-action="approve" data-id="${level.id}">Approve</button>
              <button class="mini-btn pending" data-action="pending" data-id="${level.id}">Pending</button>
              <button class="mini-btn decline" data-action="decline" data-id="${level.id}">Decline</button>
            </div>
          </div>
        `).join('')
      : '<p>No submissions waiting for review.</p>';
  } else {
    pendingList.innerHTML = '<p>Log in as the admin to review pending submissions.</p>';
  }
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function registerUser(event) {
  event.preventDefault();

  const username = document.getElementById('create-username').value.trim();
  const password = document.getElementById('create-password').value.trim();

  if (!username || !password) {
    showMessage('Please fill in both username and password.', true);
    return;
  }

  const users = getUsers();
  const taken = users.some((user) => user.username.toLowerCase() === username.toLowerCase());
  if (taken) {
    showMessage('That username is already taken.', true);
    return;
  }

  const newUser = { username, password, role: 'user' };
  users.push(newUser);
  saveUsers(users);
  setCurrentUser(username);
  document.getElementById('create-account-form').reset();
  hideMessage();
  renderAuthState();
  renderLevels();
  showMessage(`Account created for ${username}. You can submit levels for review.`);
}

function loginUser(event) {
  event.preventDefault();

  const username = document.getElementById('login-username').value.trim();
  const password = document.getElementById('login-password').value.trim();

  const users = getUsers();
  const user = users.find(
    (entry) => entry.username.toLowerCase() === username.toLowerCase() && entry.password === password
  );

  if (!user) {
    showMessage('Incorrect username or password.', true);
    return;
  }

  setCurrentUser(user.username);
  document.getElementById('login-form').reset();
  hideMessage();
  renderAuthState();
  renderLevels();
  showMessage(`Welcome back, ${user.username}!`);
}

function logoutUser() {
  setCurrentUser(null);
  renderAuthState();
  renderLevels();
  showMessage('You have been logged out.');
}

function submitLevel(event) {
  event.preventDefault();

  const currentUser = getCurrentUser();
  if (!currentUser) {
    showMessage('You must create an account or log in before submitting a level.', true);
    return;
  }

  const levelData = {
    id: crypto.randomUUID(),
    name: document.getElementById('level-name').value.trim(),
    creator: document.getElementById('level-creator').value.trim(),
    videoId: document.getElementById('video-id').value.trim(),
    thumbnail: document.getElementById('thumbnail-url').value.trim(),
    length: Number(document.getElementById('level-length').value),
    fps: Number(document.getElementById('fps').value),
    cps: Number(document.getElementById('cps').value),
    difficulty: Number(document.getElementById('difficulty').value),
    bestRun: document.getElementById('best-run').value.trim(),
    gameMode: document.getElementById('game-mode').value.trim(),
    description: document.getElementById('description').value.trim(),
    extraStats: document.getElementById('extra-stats').value.trim(),
    status: 'pending',
    submittedBy: currentUser.username
  };

  if (!levelData.name || !levelData.creator || !levelData.videoId || !levelData.thumbnail || !levelData.description) {
    showMessage('Please complete all required fields before submitting.', true);
    return;
  }

  const levels = getLevels();
  levels.push(levelData);
  saveLevels(levels);
  document.getElementById('level-submit-form').reset();
  renderLevels();
  showMessage('Your level has been submitted and is now waiting for admin review.');
}

function changeLevelStatus(id, nextStatus) {
  const levels = getLevels();
  const index = levels.findIndex((level) => level.id === id);

  if (index === -1) return;

  levels[index].status = nextStatus;
  saveLevels(levels);
  renderLevels();
}

function bindTabButtons() {
  const tabButtons = document.querySelectorAll('.tab-button');
  tabButtons.forEach((button) => {
    button.addEventListener('click', () => {
      document.querySelectorAll('.tab-button').forEach((btn) => btn.classList.remove('active'));
      document.querySelectorAll('.form-panel').forEach((panel) => panel.classList.remove('active-panel'));
      button.classList.add('active');
      const selected = document.getElementById(button.dataset.tab);
      if (selected) selected.classList.add('active-panel');
    });
  });
}

function bindEvents() {
  document.getElementById('create-account-form').addEventListener('submit', registerUser);
  document.getElementById('login-form').addEventListener('submit', loginUser);
  document.getElementById('level-submit-form').addEventListener('submit', submitLevel);
  document.getElementById('logout-btn').addEventListener('click', logoutUser);
  document.getElementById('show-create-account').addEventListener('click', () => {
    document.querySelector('[data-tab="create-tab"]').click();
  });
  document.getElementById('show-login').addEventListener('click', () => {
    document.querySelector('[data-tab="login-tab"]').click();
  });

  document.getElementById('pending-list').addEventListener('click', (event) => {
    const button = event.target.closest('button[data-action]');
    if (!button) return;

    const { action, id } = button.dataset;
    if (action === 'approve') changeLevelStatus(id, 'approved');
    if (action === 'decline') changeLevelStatus(id, 'declined');
    if (action === 'pending') changeLevelStatus(id, 'pending');
  });
}

window.addEventListener('DOMContentLoaded', () => {
  bindTabButtons();
  bindEvents();
  renderAuthState();
  renderLevels();
  showMessage('Create an account to submit levels. Admin can approve or decline pending entries.');
});
