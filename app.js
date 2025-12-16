const ui = {
  cards: document.getElementById('discover-view'),
  savedView: document.getElementById('saved-view'),
  discoverView: document.getElementById('discover-view'),
  navItems: document.querySelectorAll('.nav-item'),
  chipFilters: document.querySelectorAll('.chip'),
  sortSelect: document.getElementById('sort-select'),
  refreshBtn: document.getElementById('refresh-btn'),
  scrapeBtn: document.getElementById('scrape-btn'),
  scrapeStatus: document.getElementById('scrape-status'),
  alertBar: document.getElementById('alert-bar'),
  savedList: document.getElementById('saved-list'),
  clearSaved: document.getElementById('clear-saved'),
  hookOutput: document.getElementById('hook-output'),
  hookFormat: document.getElementById('hook-format'),
  generateHook: document.getElementById('generate-hook'),
  saveHook: document.getElementById('save-hook'),
  hooksCollection: document.getElementById('hooks-collection')
};

const state = {
  items: [],
  saved: [],
  hooks: [],
  activeTab: 'discover',
  filter: 'all',
  selectedSavedId: null
};

const mockItems = [
  {
    id: 'r-1',
    source: 'reddit',
    title: 'OpenAI releases new API improvements',
    summary: 'Developers gain faster tokens and reduced latency.',
    link: 'https://reddit.com/r/MachineLearning',
    metadata: { subreddit: 'MachineLearning', score: 982, timestamp: '2h ago' },
    status: 'new'
  },
  {
    id: 'n-1',
    source: 'newsletter',
    title: 'Growth tactics that survived the downturn',
    summary: 'A breakdown of teams that kept shipping during uncertainty.',
    link: 'https://newsletter.example.com',
    metadata: { source: 'Operator Playbook', timestamp: 'Today' },
    status: 'new'
  },
  {
    id: 'r-2',
    source: 'reddit',
    title: 'How to ship UI polish without slowing velocity',
    summary: 'Ten product heuristics for delightful UX.',
    link: 'https://reddit.com/r/Design',
    metadata: { subreddit: 'Design', score: 452, timestamp: '4h ago' },
    status: 'new'
  }
];

function setStatus(text, tone = 'muted') {
  ui.scrapeStatus.textContent = text;
  ui.scrapeStatus.className = `status ${tone}`;
}

function setAlert(message, tone = 'error') {
  ui.alertBar.textContent = message;
  ui.alertBar.className = `alert ${tone === 'success' ? 'success' : ''}`;
  ui.alertBar.hidden = !message;
}

function sortItems(items) {
  return [...items].sort((a, b) => {
    if (ui.sortSelect.value === 'score') {
      return (b.metadata.score || 0) - (a.metadata.score || 0);
    }
    return (b.metadata.timestamp || '').localeCompare(a.metadata.timestamp || '');
  });
}

function filterItems() {
  let items = [...state.items];
  if (state.filter !== 'all') {
    items = items.filter((item) => item.source === state.filter);
  }
  return sortItems(items);
}

function createCard(item) {
  const card = document.createElement('article');
  card.className = 'card';

  const badgeText = item.source === 'reddit' ? 'Reddit' : 'Newsletter';
  const meta = item.source === 'reddit'
    ? `${item.metadata.subreddit} • ${item.metadata.score} pts • ${item.metadata.timestamp}`
    : `${item.metadata.source || 'Newsletter'} • ${item.metadata.timestamp}`;

  card.innerHTML = `
    <div class="card-header">
      <span class="badge">${badgeText}</span>
      <span class="meta">${item.status === 'saved' ? 'Saved' : 'New'}</span>
    </div>
    <h3>${item.title}</h3>
    <p class="meta">${item.summary}</p>
    <p class="meta">${meta}</p>
    <div class="card-actions">
      <button class="ghost" data-action="open">Open</button>
      <button class="ghost" data-action="hook">Generate Hook</button>
      <button class="primary" data-action="save">${item.status === 'saved' ? 'Saved' : 'Save'}</button>
    </div>
  `;

  card.querySelectorAll('button').forEach((btn) => {
    btn.addEventListener('click', (e) => handleCardAction(item, e.target.dataset.action));
  });

  return card;
}

function renderCards() {
  ui.cards.innerHTML = '';
  const items = filterItems();
  if (!items.length) {
    const empty = document.createElement('div');
    empty.className = 'card';
    empty.innerHTML = '<h3>No content yet</h3><p class="meta">Hit "Scrape Now" to ingest Reddit and newsletters.</p>';
    ui.cards.appendChild(empty);
    return;
  }

  items.forEach((item) => ui.cards.appendChild(createCard(item)));
}

function renderSaved() {
  ui.savedList.innerHTML = '';
  if (!state.saved.length) {
    const empty = document.createElement('div');
    empty.className = 'meta';
    empty.textContent = 'Save items from Discover to curate hooks.';
    ui.savedList.appendChild(empty);
  } else {
    state.saved.forEach((item) => {
      const node = document.createElement('div');
      node.className = `saved-item ${state.selectedSavedId === item.id ? 'active' : ''}`;
      node.innerHTML = `<strong>${item.title}</strong><span class="meta">${item.summary}</span>`;
      node.addEventListener('click', () => {
        state.selectedSavedId = item.id;
        ui.generateHook.disabled = false;
        renderSaved();
      });
      ui.savedList.appendChild(node);
    });
  }

  ui.hooksCollection.innerHTML = '';
  state.hooks.forEach((hook) => {
    const pill = document.createElement('div');
    pill.className = 'hook-pill';
    pill.textContent = `${hook.format.toUpperCase()}: ${hook.text}`;
    ui.hooksCollection.appendChild(pill);
  });
}

async function callN8nScrape() {
  if (!window.env.N8N_BASE_URL) return { simulated: true };
  const base = window.env.N8N_BASE_URL.replace(/\/$/, '');
  const path = window.env.N8N_SCRAPE_PATH || '/scrape';
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  const url = `${base}${normalizedPath}`;
  const res = await fetch(url, { method: 'POST' });
  if (!res.ok) {
    const detail = await res.text();
    throw new Error(`N8N responded ${res.status} ${res.statusText}${detail ? `: ${detail}` : ''}`);
  }
  return res.json().catch(() => ({}));
}

async function fetchLatestContent() {
  // Placeholder: replace with Supabase fetch
  return mockItems;
}

async function handleScrape() {
  setStatus('Starting scrape…');
  ui.scrapeBtn.disabled = true;
  setAlert('');
  try {
    await callN8nScrape();
    setStatus('Scraping in progress', 'busy');
    // simulate polling
    setTimeout(async () => {
      state.items = await fetchLatestContent();
      renderCards();
      setStatus('Feed refreshed • just now', 'success');
      setAlert('Scrape completed. If your N8N flow updates Supabase, the feed will auto-refresh.', 'success');
      ui.scrapeBtn.disabled = false;
    }, 1200);
  } catch (err) {
    console.error(err);
    setStatus('Scrape failed — check N8N URL', 'error');
    setAlert(err.message || 'Scrape endpoint not found — update config.js with the correct N8N path.');
    ui.scrapeBtn.disabled = false;
  }
}

function handleCardAction(item, action) {
  if (action === 'open') {
    window.open(item.link, '_blank');
  }
  if (action === 'save') {
    if (!state.saved.some((s) => s.id === item.id)) {
      state.saved.push({ ...item, status: 'saved' });
      state.items = state.items.map((i) => (i.id === item.id ? { ...i, status: 'saved' } : i));
      renderCards();
      renderSaved();
    }
  }
  if (action === 'hook') {
    state.selectedSavedId = item.id;
    ui.generateHook.disabled = false;
    ui.hookOutput.placeholder = 'Click "Generate from selection" to craft a hook.';
    renderSaved();
  }
}

function selectTab(tab) {
  state.activeTab = tab;
  ui.discoverView.hidden = tab !== 'discover';
  ui.savedView.hidden = tab !== 'saved';
  ui.navItems.forEach((btn) => btn.classList.toggle('active', btn.dataset.tab === tab));
}

function applyFilter(filter) {
  state.filter = filter;
  ui.chipFilters.forEach((chip) => chip.classList.toggle('active', chip.dataset.filter === filter));
  renderCards();
}

function clearSavedItems() {
  state.saved = [];
  state.selectedSavedId = null;
  ui.generateHook.disabled = true;
  ui.saveHook.disabled = true;
  renderCards();
  renderSaved();
}

function generateHookText() {
  const item = state.saved.find((i) => i.id === state.selectedSavedId);
  if (!item) return;
  const format = ui.hookFormat.value;
  const hook = `${item.title} — ${format === 'tweet' ? 'share this insight in 280 chars.' : 'turn this into a sharp opener.'}`;
  ui.hookOutput.value = hook;
  ui.saveHook.disabled = false;
}

function saveHookFromOutput() {
  const text = ui.hookOutput.value.trim();
  if (!text) return;
  const hook = {
    id: `hook-${Date.now()}`,
    text,
    format: ui.hookFormat.value,
    contentId: state.selectedSavedId,
    createdAt: new Date().toISOString()
  };
  state.hooks.unshift(hook);
  ui.hookOutput.value = '';
  ui.saveHook.disabled = true;
  renderSaved();
}

function attachEvents() {
  ui.navItems.forEach((btn) => btn.addEventListener('click', () => selectTab(btn.dataset.tab)));
  ui.chipFilters.forEach((chip) => chip.addEventListener('click', () => applyFilter(chip.dataset.filter)));
  ui.sortSelect.addEventListener('change', renderCards);
  ui.refreshBtn.addEventListener('click', renderCards);
  ui.scrapeBtn.addEventListener('click', handleScrape);
  ui.clearSaved.addEventListener('click', clearSavedItems);
  ui.generateHook.addEventListener('click', generateHookText);
  ui.saveHook.addEventListener('click', saveHookFromOutput);
}

async function bootstrap() {
  attachEvents();
  setStatus('Loading feed…', 'busy');
  if (!window.env.N8N_BASE_URL) {
    setAlert('No N8N endpoint configured — running with mock data. Update config.js to enable scraping.');
  }
  // skeletons
  ui.cards.innerHTML = '<div class="card skeleton" style="height:140px"></div><div class="card skeleton" style="height:140px"></div>';
  state.items = await fetchLatestContent();
  renderCards();
  renderSaved();
  setStatus('Ready');
}

bootstrap();
