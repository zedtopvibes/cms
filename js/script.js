// ===== CONFIG =====
const API_BASE = "https://cms.zedtopvibes.workers.dev/";
let AUTH_TOKEN = localStorage.getItem("auth_token") || "";

// ===== Helper: Set Auth Header =====
function authHeaders() {
  return AUTH_TOKEN ? { "Authorization": AUTH_TOKEN } : {};
}

// ===== LOGIN =====
async function login(username, password) {
  const res = await fetch(`${API_BASE}login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password })
  });
  const data = await res.json();
  if (data.success) {
    AUTH_TOKEN = data.token;
    localStorage.setItem("auth_token", AUTH_TOKEN);
  }
  return data;
}

// ===== LOGOUT =====
function logout() {
  AUTH_TOKEN = "";
  localStorage.removeItem("auth_token");
  location.reload();
}

// ===== FETCH POSTS =====
async function fetchPosts({ page = 1, limit = 10, artist, tag, status } = {}) {
  const params = new URLSearchParams({ page, limit });
  if (artist) params.append("artist", artist);
  if (tag) params.append("tag", tag);
  if (status) params.append("status", status);
  const res = await fetch(`${API_BASE}posts?${params.toString()}`, {
    headers: authHeaders()
  });
  return res.json();
}

// ===== FETCH DRAFTS =====
async function fetchDrafts() {
  const res = await fetch(`${API_BASE}drafts`, { headers: authHeaders() });
  return res.json();
}

// ===== CREATE POST =====
async function createPost(formData) {
  const res = await fetch(`${API_BASE}posts`, {
    method: "POST",
    headers: { ...authHeaders() },
    body: formData
  });
  return res.json();
}

// ===== EDIT POST =====
async function editPost(slug, formData) {
  const res = await fetch(`${API_BASE}posts/${slug}`, {
    method: "PUT",
    headers: { ...authHeaders() },
    body: formData
  });
  return res.json();
}

// ===== DELETE POST =====
async function deletePost(slug) {
  const res = await fetch(`${API_BASE}posts/${slug}`, {
    method: "DELETE",
    headers: authHeaders()
  });
  return res.json();
}

// ===== BULK DELETE =====
async function bulkDelete(ids = []) {
  const res = await fetch(`${API_BASE}posts/bulk-delete`, {
    method: "POST",
    headers: { ...authHeaders(), "Content-Type": "application/json" },
    body: JSON.stringify({ ids })
  });
  return res.json();
}

// ===== FETCH TAGS =====
async function fetchTags() {
  const res = await fetch(`${API_BASE}tags`, { headers: authHeaders() });
  return res.json();
}

// ===== FETCH CATEGORIES =====
async function fetchCategories() {
  const res = await fetch(`${API_BASE}categories`, { headers: authHeaders() });
  return res.json();
}

// ===== FETCH ARTIST POSTS =====
async function fetchArtistPosts(slug) {
  const res = await fetch(`${API_BASE}artists/${slug}`, { headers: authHeaders() });
  return res.json();
}

// ===== FETCH POST VIEWS =====
async function fetchPostViews(slug) {
  const res = await fetch(`${API_BASE}posts/${slug}/views`, { headers: authHeaders() });
  return res.json();
}

// ===== UTILITY: Populate Select =====
function populateSelect(selectEl, items, valueKey = "slug", textKey = "name") {
  selectEl.innerHTML = "";
  items.forEach(item => {
    const opt = document.createElement("option");
    opt.value = item[valueKey] || item;
    opt.textContent = item[textKey] || item;
    selectEl.appendChild(opt);
  });
}

// ===== HANDLE FORM SUBMISSION =====
async function handlePostForm(formEl, slug = null) {
  const formData = new FormData(formEl);
  let res;
  if (slug) res = await editPost(slug, formData);
  else res = await createPost(formData);
  return res;
}

// ===== INIT DASHBOARD =====
async function initDashboard() {
  if (!AUTH_TOKEN) {
    document.body.classList.add("login-mode");
    return;
  }

  document.body.classList.remove("login-mode");
  // Load posts table
  const postsData = await fetchPosts();
  renderPostsTable(postsData.posts);

  // Load tags/categories
  const tags = await fetchTags();
  const categories = await fetchCategories();
  populateSelect(document.querySelector("#filter-tags"), tags);
  populateSelect(document.querySelector("#filter-categories"), categories);
}

// ===== RENDER POSTS TABLE =====
function renderPostsTable(posts) {
  const tableBody = document.querySelector("#posts-table tbody");
  tableBody.innerHTML = "";
  posts.forEach(post => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${post.title}</td>
      <td>${post.artist}</td>
      <td>${post.category || "-"}</td>
      <td>${post.status}</td>
      <td>${post.views || 0}</td>
      <td>
        <button data-action="edit" data-slug="${post.slug}">Edit</button>
        <button data-action="delete" data-slug="${post.slug}">Delete</button>
      </td>
    `;
    tableBody.appendChild(tr);
  });
}

// ===== EVENT DELEGATION =====
document.addEventListener("click", async e => {
  const btn = e.target.closest("button");
  if (!btn) return;
  const slug = btn.dataset.slug;
  const action = btn.dataset.action;

  if (action === "logout") logout();

  if (action === "delete" && slug) {
    if (confirm("Delete this post?")) {
      await deletePost(slug);
      initDashboard();
    }
  }

  if (action === "edit" && slug) {
    // Trigger edit form population
    const postsData = await fetchPosts();
    const post = postsData.posts.find(p => p.slug === slug);
    populateEditForm(post);
  }
});

// ===== POPULATE EDIT FORM =====
function populateEditForm(post) {
  const form = document.querySelector("#post-form");
  form.querySelector("[name=title]").value = post.title;
  form.querySelector("[name=artist]").value = post.artist;
  form.querySelector("[name=slug]").value = post.slug;
  form.querySelector("[name=category]").value = post.category;
  form.querySelector("[name=tags]").value = post.tags.join(",");
  form.querySelector("[name=status]").value = post.status;
  form.querySelector("[name=description]").value = post.description;
}

// ===== HANDLE LOGIN FORM =====
const loginForm = document.querySelector("#login-form");
if (loginForm) {
  loginForm.addEventListener("submit", async e => {
    e.preventDefault();
    const username = loginForm.querySelector("[name=username]").value;
    const password = loginForm.querySelector("[name=password]").value;
    const res = await login(username, password);
    if (res.success) initDashboard();
    else alert(res.message || "Login failed");
  });
}

// ===== HANDLE POST FORM =====
const postForm = document.querySelector("#post-form");
if (postForm) {
  postForm.addEventListener("submit", async e => {
    e.preventDefault();
    const slug = postForm.dataset.editSlug || null;
    const res = await handlePostForm(postForm, slug);
    if (res.success) {
      alert("Saved successfully!");
      postForm.reset();
      initDashboard();
    } else {
      alert(res.message || "Failed to save post");
    }
  });
}

// ===== INIT =====
initDashboard();
