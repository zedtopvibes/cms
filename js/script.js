// Sidebar Toggle
const sidebar = document.getElementById("sidebar");
document.getElementById("sidebarToggle").addEventListener("click", () => {
  sidebar.classList.toggle("collapsed");
  sidebar.classList.toggle("active");
});

// Modal
const modal = document.getElementById("postModal");
const addBtn = document.getElementById("addPostBtn");
const closeBtn = document.querySelector(".modal .close");

addBtn.onclick = () => modal.style.display = "flex";
closeBtn.onclick = () => modal.style.display = "none";
window.onclick = e => { if(e.target === modal) modal.style.display="none"; }

// Example: Populate Posts Table
const postsTable = document.getElementById("postsTable").querySelector("tbody");
const samplePosts = [
  {title:"Song 1", artist:"Artist A", status:"published", category:"Pop", tags:["hit","2026"], created_at:"2026-01-28"},
  {title:"Song 2", artist:"Artist B", status:"draft", category:"HipHop", tags:["new"], created_at:"2026-01-27"},
];
function populatePosts(posts){
  postsTable.innerHTML = "";
  posts.forEach(p=>{
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${p.title}</td>
      <td>${p.artist}</td>
      <td>${p.status}</td>
      <td>${p.category}</td>
      <td>${p.tags.join(", ")}</td>
      <td>${p.created_at}</td>
      <td>
        <button>Edit</button>
        <button>Delete</button>
      </td>
    `;
    postsTable.appendChild(tr);
  });
}
populatePosts(samplePosts);
