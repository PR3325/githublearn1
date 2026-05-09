const STORAGE_KEY = "savestack-items";
const THEME_KEY = "savestack-theme";

const starterItems = [
  {
    id: "seed-1",
    url: "https://www.youtube.com/",
    title: "React Native basics playlist",
    category: "Studies",
    platform: "YouTube",
    note: "Good resource for building the real mobile app version.",
    favorite: true,
    createdAt: "2026-05-09T08:30:00.000Z",
  },
  {
    id: "seed-2",
    url: "https://www.instagram.com/",
    title: "Beginner gym routine reel",
    category: "Gym",
    platform: "Instagram",
    note: "Save for weekly workout plan.",
    favorite: false,
    createdAt: "2026-05-09T08:40:00.000Z",
  },
  {
    id: "seed-3",
    url: "https://www.linkedin.com/",
    title: "Internship preparation post",
    category: "Career",
    platform: "LinkedIn",
    note: "Useful checklist for resume and interview practice.",
    favorite: true,
    createdAt: "2026-05-09T08:50:00.000Z",
  },
];

const state = {
  items: loadItems(),
  activeCategory: "All",
  editingId: null,
  query: "",
};

const form = document.querySelector("#saveForm");
const urlInput = document.querySelector("#urlInput");
const titleInput = document.querySelector("#titleInput");
const categoryInput = document.querySelector("#categoryInput");
const platformInput = document.querySelector("#platformInput");
const noteInput = document.querySelector("#noteInput");
const submitButton = document.querySelector("#submitButton");
const searchInput = document.querySelector("#searchInput");
const categoryTabs = document.querySelector("#categoryTabs");
const savedList = document.querySelector("#savedList");
const emptyState = document.querySelector("#emptyState");
const totalCount = document.querySelector("#totalCount");
const categoryCount = document.querySelector("#categoryCount");
const favoriteCount = document.querySelector("#favoriteCount");
const clearFilters = document.querySelector("#clearFilters");
const themeToggle = document.querySelector("#themeToggle");

initTheme();
render();

form.addEventListener("submit", (event) => {
  event.preventDefault();

  const item = {
    id: state.editingId || crypto.randomUUID(),
    url: urlInput.value.trim(),
    title: titleInput.value.trim(),
    category: categoryInput.value,
    platform: platformInput.value,
    note: noteInput.value.trim(),
    favorite: state.editingId ? getItemById(state.editingId).favorite : false,
    createdAt: state.editingId ? getItemById(state.editingId).createdAt : new Date().toISOString(),
  };

  if (state.editingId) {
    state.items = state.items.map((savedItem) => (savedItem.id === state.editingId ? item : savedItem));
    state.editingId = null;
    submitButton.textContent = "Save item";
  } else {
    state.items = [item, ...state.items];
  }

  form.reset();
  categoryInput.value = "Studies";
  platformInput.value = "YouTube";
  saveItems();
  render();
});

searchInput.addEventListener("input", (event) => {
  state.query = event.target.value.trim().toLowerCase();
  renderList();
});

clearFilters.addEventListener("click", () => {
  state.activeCategory = "All";
  state.query = "";
  searchInput.value = "";
  render();
});

themeToggle.addEventListener("click", () => {
  document.body.classList.toggle("dark");
  localStorage.setItem(THEME_KEY, document.body.classList.contains("dark") ? "dark" : "light");
});

savedList.addEventListener("click", (event) => {
  const action = event.target.dataset.action;
  const id = event.target.dataset.id;

  if (!action || !id) return;

  if (action === "favorite") {
    state.items = state.items.map((item) =>
      item.id === id ? { ...item, favorite: !item.favorite } : item
    );
  }

  if (action === "edit") {
    startEdit(id);
    return;
  }

  if (action === "delete") {
    state.items = state.items.filter((item) => item.id !== id);
  }

  saveItems();
  render();
});

categoryTabs.addEventListener("click", (event) => {
  const category = event.target.dataset.category;
  if (!category) return;

  state.activeCategory = category;
  render();
});

function loadItems() {
  const saved = localStorage.getItem(STORAGE_KEY);
  return saved ? JSON.parse(saved) : starterItems;
}

function saveItems() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state.items));
}

function initTheme() {
  if (localStorage.getItem(THEME_KEY) === "dark") {
    document.body.classList.add("dark");
  }
}

function render() {
  renderStats();
  renderTabs();
  renderList();
}

function renderStats() {
  totalCount.textContent = state.items.length;
  categoryCount.textContent = new Set(state.items.map((item) => item.category)).size;
  favoriteCount.textContent = state.items.filter((item) => item.favorite).length;
}

function renderTabs() {
  const categories = ["All", ...new Set(state.items.map((item) => item.category))];

  categoryTabs.innerHTML = categories
    .map(
      (category) => `
        <button class="tab ${category === state.activeCategory ? "is-active" : ""}" type="button" data-category="${category}">
          ${category}
        </button>
      `
    )
    .join("");
}

function renderList() {
  const items = getVisibleItems();

  savedList.innerHTML = items.map(renderItem).join("");
  emptyState.hidden = items.length > 0;
}

function getVisibleItems() {
  return state.items.filter((item) => {
    const matchesCategory = state.activeCategory === "All" || item.category === state.activeCategory;
    const text = `${item.title} ${item.category} ${item.platform} ${item.note}`.toLowerCase();
    const matchesQuery = !state.query || text.includes(state.query);
    return matchesCategory && matchesQuery;
  });
}

function renderItem(item) {
  const platformClass = item.platform.toLowerCase();
  const platformText = item.platform.slice(0, 2).toUpperCase();

  return `
    <article class="saved-card">
      <div class="platform-mark ${platformClass}" aria-hidden="true">${platformText}</div>
      <div>
        <h3>${escapeHtml(item.title)}</h3>
        <div class="meta">
          <span class="pill">${escapeHtml(item.category)}</span>
          <span class="pill">${escapeHtml(item.platform)}</span>
          ${item.favorite ? '<span class="pill">Favorite</span>' : ""}
        </div>
        <p class="note">${escapeHtml(item.note || "No note added yet.")}</p>
        <div class="card-actions">
          <a href="${escapeAttribute(item.url)}" target="_blank" rel="noreferrer">Open</a>
          <button type="button" data-action="favorite" data-id="${item.id}">
            ${item.favorite ? "Unsave" : "Favorite"}
          </button>
          <button type="button" data-action="edit" data-id="${item.id}">Edit</button>
          <button type="button" data-action="delete" data-id="${item.id}">Delete</button>
        </div>
      </div>
    </article>
  `;
}

function startEdit(id) {
  const item = getItemById(id);
  if (!item) return;

  state.editingId = id;
  urlInput.value = item.url;
  titleInput.value = item.title;
  categoryInput.value = item.category;
  platformInput.value = item.platform;
  noteInput.value = item.note;
  submitButton.textContent = "Update item";
  urlInput.focus();
}

function getItemById(id) {
  return state.items.find((item) => item.id === id);
}

function escapeHtml(value) {
  return value.replace(/[&<>"']/g, (character) => {
    const entities = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;",
    };
    return entities[character];
  });
}

function escapeAttribute(value) {
  return escapeHtml(value).replace(/`/g, "&#096;");
}
