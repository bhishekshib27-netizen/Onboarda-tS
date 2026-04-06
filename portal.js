// ===============================
// STATE MANAGEMENT
// ===============================
const state = {
  entities: JSON.parse(localStorage.getItem("onboarda_entities") || "[]")
};

function saveState() {
  localStorage.setItem("onboarda_entities", JSON.stringify(state.entities));
}

// ===============================
// CREATE ENTITY
// ===============================
function createEntity(data) {
  const entity = {
    id: "ENT-" + Date.now(),
    name: data.name,
    type: data.type,
    jurisdiction: data.jurisdiction,
    status: "Pending",
    risk: "Medium",
    createdAt: new Date().toISOString()
  };

  state.entities.unshift(entity);
  saveState();
  renderEntities();
}

// ===============================
// FORM HANDLING
// ===============================
function handleCreateEntity() {
  const name = document.getElementById("entity-name").value;
  const type = document.getElementById("entity-type").value;
  const jurisdiction = document.getElementById("entity-jurisdiction").value;

  if (!name) {
    alert("Entity name required");
    return;
  }

  createEntity({ name, type, jurisdiction });

  document.getElementById("entity-name").value = "";
  document.getElementById("entity-jurisdiction").value = "";
}
// ===============================
// RENDER KPIs
// ===============================
function renderKPIs() {
  const total = state.entities.length;
  const pending = state.entities.filter(e => e.status === "Pending").length;
  const approved = state.entities.filter(e => e.status === "Approved").length;
  const highRisk = state.entities.filter(e => e.risk === "High").length;

  document.getElementById("kpi-total").textContent = total;
  document.getElementById("kpi-pending").textContent = pending;
  document.getElementById("kpi-approved").textContent = approved;
  document.getElementById("kpi-risk").textContent = highRisk;
}

// ===============================
// RENDER ENTITY TABLE
// ===============================
function renderEntities() {
  const table = document.getElementById("entity-table-body");
  if (!table) return;

  if (!state.entities.length) {
    table.innerHTML = `
      <tr>
        <td colspan="5" style="padding:20px;color:#999">No entities yet</td>
      </tr>
    `;
    renderKPIs();
    return;
  }

  table.innerHTML = state.entities.map(entity => `
    <tr class="entity-row">
      <td>${entity.id}</td>
      <td>${entity.name}</td>
      <td>${entity.type}</td>
      <td>
        <span class="status-badge">${entity.status}</span>
      </td>
      <td>
        <button onclick="openEntity('${entity.id}')">Open</button>
      </td>
    </tr>
  `).join("");

  renderKPIs();
}
// ===============================
// OPEN ENTITY
// ===============================
function openEntity(id) {
  const entity = state.entities.find(e => e.id === id);
  if (!entity) return;

  localStorage.setItem("current_entity", JSON.stringify(entity));
  window.location.href = "entity.html";
}

// ===============================
// INIT
// ===============================
document.addEventListener("DOMContentLoaded", () => {
  renderEntities();

  const btn = document.getElementById("create-entity-btn");
  if (btn) {
    btn.addEventListener("click", handleCreateEntity);
  }
});
