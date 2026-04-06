// ===============================
// ONBOARDA PORTAL JS
// Full version aligned to portal.html
// Connected to client-portal.html
// ===============================

const STORAGE_KEY = "onboarda_entities";
const CLIENT_SUBMISSION_KEY = "onboarda_client_submission";
const IMPORTED_SUBMISSIONS_KEY = "onboarda_imported_submissions";

const state = {
  entities: [],
  filters: {
    search: "",
    status: "all",
    risk: "all"
  }
};

// ===============================
// HELPERS
// ===============================
function byId(id) {
  return document.getElementById(id);
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state.entities));
}

function loadState() {
  const saved = localStorage.getItem(STORAGE_KEY);

  if (saved) {
    try {
      state.entities = JSON.parse(saved);
      if (!Array.isArray(state.entities)) state.entities = [];
    } catch (error) {
      console.error("Failed to parse saved entities:", error);
      state.entities = [];
    }
  }

  if (!state.entities.length) {
    seedEntities();
  }
}

function formatDate(dateString) {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric"
    });
  } catch {
    return "—";
  }
}

function escapeHtml(str) {
  return String(str ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function randomScoreFromRisk(risk) {
  if (risk === "Low") return Math.floor(Math.random() * 18) + 15;
  if (risk === "Medium") return Math.floor(Math.random() * 20) + 33;
  if (risk === "High") return Math.floor(Math.random() * 18) + 53;
  return Math.floor(Math.random() * 20) + 71;
}

function getRiskClass(risk) {
  switch (risk) {
    case "Low":
      return "green";
    case "Medium":
      return "indigo";
    case "High":
      return "orange";
    case "Very High":
      return "red";
    default:
      return "indigo";
  }
}

function getStatusClass(status) {
  switch (status) {
    case "Approved":
      return "green";
    case "Escalated":
      return "red";
    case "Pre-Approval":
      return "indigo";
    case "In Review":
      return "orange";
    case "Pending Documents":
      return "orange";
    default:
      return "indigo";
  }
}

function buildReference() {
  const stamp = Date.now().toString().slice(-6);
  return `ARF-2026-${stamp}`;
}

function getImportedSubmissionRefs() {
  try {
    const saved = JSON.parse(localStorage.getItem(IMPORTED_SUBMISSIONS_KEY) || "[]");
    return Array.isArray(saved) ? saved : [];
  } catch {
    return [];
  }
}

function saveImportedSubmissionRefs(refs) {
  localStorage.setItem(IMPORTED_SUBMISSIONS_KEY, JSON.stringify(refs));
}

// ===============================
// SEED DATA
// ===============================
function seedEntities() {
  state.entities = [
    {
      id: "ENT-1001",
      reference: "ARF-2026-100421",
      name: "Meridian Holdings Ltd",
      type: "Company",
      jurisdiction: "Mauritius",
      regNumber: "C18492",
      owner: "Bhishek",
      status: "Pre-Approval",
      risk: "Low",
      score: 22,
      documents: 6,
      notes: "Corporate pack complete. Final memo pending approval.",
      createdAt: "2026-04-01T10:15:00.000Z"
    },
    {
      id: "ENT-1002",
      reference: "ARF-2026-100422",
      name: "NovaPay Ltd",
      type: "Company",
      jurisdiction: "UAE",
      regNumber: "NP-8821",
      owner: "Aisha",
      status: "In Review",
      risk: "High",
      score: 67,
      documents: 4,
      notes: "EDD review requested for source of funds clarification.",
      createdAt: "2026-04-02T08:30:00.000Z"
    },
    {
      id: "ENT-1003",
      reference: "ARF-2026-100423",
      name: "Atlas Ventures",
      type: "Company",
      jurisdiction: "BVI",
      regNumber: "AT-4418",
      owner: "Bhishek",
      status: "Escalated",
      risk: "Very High",
      score: 84,
      documents: 5,
      notes: "Complex ownership chain. UBO screening mismatch flagged.",
      createdAt: "2026-04-03T12:10:00.000Z"
    },
    {
      id: "ENT-1004",
      reference: "ARF-2026-100424",
      name: "Lina Sewchurn",
      type: "Individual",
      jurisdiction: "Mauritius",
      regNumber: "-",
      owner: "Aisha",
      status: "Pending Documents",
      risk: "Medium",
      score: 41,
      documents: 2,
      notes: "Waiting on proof of address and bank statement.",
      createdAt: "2026-04-04T09:20:00.000Z"
    },
    {
      id: "ENT-1005",
      reference: "ARF-2026-100425",
      name: "Pacific Trade Co",
      type: "Company",
      jurisdiction: "Singapore",
      regNumber: "PT-9021",
      owner: "Bhishek",
      status: "Approved",
      risk: "Low",
      score: 19,
      documents: 7,
      notes: "Approved and moved to monitoring.",
      createdAt: "2026-04-05T07:45:00.000Z"
    }
  ];

  saveState();
}

// ===============================
// CREATE ENTITY
// ===============================
function createEntity(data) {
  const entity = {
    id: "ENT-" + Date.now(),
    reference: buildReference(),
    name: data.name,
    type: data.type,
    jurisdiction: data.jurisdiction,
    regNumber: data.regNumber || "-",
    owner: data.owner || "Unassigned",
    status: data.status || "Pending Documents",
    risk: data.risk || "Medium",
    score: randomScoreFromRisk(data.risk || "Medium"),
    documents: Number(data.documents || 0),
    notes: data.notes || "",
    createdAt: new Date().toISOString()
  };

  state.entities.unshift(entity);
  saveState();
  renderAll();
}

function handleCreateEntity(event) {
  event.preventDefault();

  const name = byId("entity-name")?.value.trim();
  const type = byId("entity-type")?.value;
  const jurisdiction = byId("entity-jurisdiction")?.value.trim();
  const regNumber = byId("entity-reg-number")?.value.trim();
  const owner = byId("entity-owner")?.value.trim();
  const status = byId("entity-status")?.value;
  const risk = byId("entity-risk")?.value;
  const documents = byId("entity-doc-count")?.value;
  const notes = byId("entity-notes")?.value.trim();

  if (!name || !jurisdiction) {
    alert("Entity name and jurisdiction are required.");
    return;
  }

  createEntity({
    name,
    type,
    jurisdiction,
    regNumber,
    owner,
    status,
    risk,
    documents,
    notes
  });

  const form = byId("create-entity-form");
  if (form) form.reset();

  const riskField = byId("entity-risk");
  if (riskField) riskField.value = "Medium";

  closeModal();
}

// ===============================
// CLIENT PORTAL IMPORT
// ===============================
function inferRiskFromSubmission(submission) {
  const fileCount = Array.isArray(submission.files) ? submission.files.length : 0;
  const jurisdiction = String(submission.jurisdiction || "").toLowerCase();
  const entityType = String(submission.entityType || "").toLowerCase();

  if (fileCount < 2) return "High";
  if (entityType === "trust" || entityType === "foundation") return "High";
  if (jurisdiction && !["mauritius", "singapore", "uae", "bvi"].includes(jurisdiction)) return "Medium";

  return "Medium";
}

function importClientSubmissionIfPresent() {
  let submission = null;

  try {
    submission = JSON.parse(localStorage.getItem(CLIENT_SUBMISSION_KEY) || "null");
  } catch (error) {
    console.error("Failed to parse client submission:", error);
    return;
  }

  if (!submission || submission.status !== "submitted") return;

  const importedRefs = getImportedSubmissionRefs();
  const submissionRef = submission.reference || `${submission.entityName}-${submission.savedAt}`;

  if (importedRefs.includes(submissionRef)) return;

  const existingEntity = state.entities.find((entity) => {
    return (
      entity.name === submission.entityName &&
      entity.jurisdiction === submission.jurisdiction &&
      entity.createdAt === submission.savedAt
    );
  });

  if (existingEntity) {
    importedRefs.push(submissionRef);
    saveImportedSubmissionRefs(importedRefs);
    return;
  }

  const risk = inferRiskFromSubmission(submission);

  const importedEntity = {
    id: "ENT-" + Date.now(),
    reference: buildReference(),
    name: submission.entityName || "New Client Submission",
    type: submission.entityType || "Company",
    jurisdiction: submission.jurisdiction || "—",
    regNumber: submission.regNumber || "-",
    owner: "Client Portal",
    status: "Pending Documents",
    risk,
    score: randomScoreFromRisk(risk),
    documents: Array.isArray(submission.files) ? submission.files.length : 0,
    notes:
      submission.notes ||
      `Imported from client portal. Contact: ${submission.contactName || "—"} (${submission.contactEmail || "—"}).`,
    createdAt: submission.savedAt || new Date().toISOString()
  };

  state.entities.unshift(importedEntity);
  saveState();

  importedRefs.push(submissionRef);
  saveImportedSubmissionRefs(importedRefs);
}

// ===============================
// FILTERS
// ===============================
function getFilteredEntities() {
  const search = state.filters.search.trim().toLowerCase();
  const status = state.filters.status;
  const risk = state.filters.risk;

  return state.entities.filter((entity) => {
    const matchesSearch =
      !search ||
      entity.name.toLowerCase().includes(search) ||
      entity.jurisdiction.toLowerCase().includes(search) ||
      entity.reference.toLowerCase().includes(search) ||
      entity.owner.toLowerCase().includes(search) ||
      entity.type.toLowerCase().includes(search);

    const matchesStatus = status === "all" || entity.status === status;
    const matchesRisk = risk === "all" || entity.risk === risk;

    return matchesSearch && matchesStatus && matchesRisk;
  });
}

// ===============================
// RENDER KPIS
// ===============================
function renderKPIs() {
  const totalEntitiesEl = byId("kpi-total-entities");
  const pendingReviewEl = byId("kpi-pending-review");
  const highRiskEl = byId("kpi-high-risk");
  const avgRiskEl = byId("kpi-avg-risk");

  const total = state.entities.length;
  const pending = state.entities.filter((e) =>
    ["Pending Documents", "In Review", "Pre-Approval"].includes(e.status)
  ).length;
  const highRisk = state.entities.filter((e) =>
    e.risk === "High" || e.risk === "Very High" || e.status === "Escalated"
  ).length;

  const avg =
    total > 0
      ? Math.round(state.entities.reduce((sum, entity) => sum + Number(entity.score || 0), 0) / total)
      : 0;

  if (totalEntitiesEl) totalEntitiesEl.textContent = String(total);
  if (pendingReviewEl) pendingReviewEl.textContent = String(pending);
  if (highRiskEl) highRiskEl.textContent = String(highRisk);
  if (avgRiskEl) avgRiskEl.textContent = String(avg);
}

// ===============================
// RENDER TABLE
// ===============================
function renderEntities() {
  const tableBody = byId("entity-table-body");
  if (!tableBody) return;

  const entities = getFilteredEntities();

  if (!entities.length) {
    tableBody.innerHTML = `
      <tr>
        <td colspan="10" style="padding:20px;color:rgba(15,17,23,.45);text-align:center;">
          No entities match your current filters.
        </td>
      </tr>
    `;
    return;
  }

  tableBody.innerHTML = entities
    .map((entity) => {
      const riskClass = getRiskClass(entity.risk);
      const statusClass = getStatusClass(entity.status);

      return `
        <tr>
          <td class="mono">${escapeHtml(entity.reference)}</td>
          <td>
            <div style="font-weight:700;color:#0f1117">${escapeHtml(entity.name)}</div>
            <div style="font-size:12px;color:rgba(15,17,23,.45)">${formatDate(entity.createdAt)}</div>
          </td>
          <td>${escapeHtml(entity.jurisdiction)}</td>
          <td>${escapeHtml(entity.type)}</td>
          <td><span class="validation-pill ${riskClass}">${escapeHtml(entity.risk)}</span></td>
          <td><strong>${escapeHtml(entity.score)}</strong></td>
          <td><span class="validation-pill ${statusClass}">${escapeHtml(entity.status)}</span></td>
          <td>${escapeHtml(entity.documents)}</td>
          <td>${escapeHtml(entity.owner)}</td>
          <td>
            <button
              type="button"
              class="btn-secondary"
              style="padding:8px 14px;font-size:13px"
              onclick="openEntity('${entity.id}')"
            >
              Open
            </button>
          </td>
        </tr>
      `;
    })
    .join("");
}

// ===============================
// RENDER ACTIVITY
// ===============================
function renderActivity() {
  const activityList = byId("recent-activity-list");
  if (!activityList) return;

  const recent = [...state.entities]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 6);

  if (!recent.length) {
    activityList.innerHTML = `
      <div class="validation-card">
        <h4>No activity yet</h4>
        <p>Create your first entity to start the onboarding workflow.</p>
      </div>
    `;
    return;
  }

  activityList.innerHTML = recent
    .map((entity) => `
      <div class="validation-card">
        <div style="display:flex;justify-content:space-between;gap:12px;align-items:flex-start;margin-bottom:6px">
          <h4 style="margin:0">${escapeHtml(entity.name)}</h4>
          <span class="validation-pill ${getStatusClass(entity.status)}">${escapeHtml(entity.status)}</span>
        </div>
        <p style="margin-bottom:8px">
          ${escapeHtml(entity.owner)} owns this case · ${escapeHtml(entity.documents)} document(s) uploaded · risk score ${escapeHtml(entity.score)}.
        </p>
        <div style="font-size:12px;color:rgba(255,255,255,.38)">
          ${formatDate(entity.createdAt)} · ${escapeHtml(entity.jurisdiction)}
        </div>
      </div>
    `)
    .join("");
}

// ===============================
// MODAL
// ===============================
function openModal() {
  const modal = byId("create-entity-modal");
  if (modal) {
    modal.style.display = "flex";
  }
}

function closeModal() {
  const modal = byId("create-entity-modal");
  if (modal) {
    modal.style.display = "";
  }
}

// ===============================
// ENTITY NAVIGATION
// ===============================
function openEntity(id) {
  const entity = state.entities.find((item) => item.id === id);
  if (!entity) return;

  localStorage.setItem("current_entity", JSON.stringify(entity));

  if (window.location.pathname.endsWith("entity.html")) return;
  window.location.href = "entity.html";
}

window.openEntity = openEntity;

// ===============================
// RENDER ALL
// ===============================
function renderAll() {
  renderKPIs();
  renderEntities();
  renderActivity();
}

// ===============================
// EVENTS
// ===============================
function bindEvents() {
  const form = byId("create-entity-form");
  const openBtn = byId("open-create-entity");
  const closeBtn = byId("close-create-entity");
  const cancelBtn = byId("cancel-create-entity");
  const modal = byId("create-entity-modal");

  const searchInput = byId("entity-search");
  const statusFilter = byId("status-filter");
  const riskFilter = byId("risk-filter");

  if (openBtn) {
    openBtn.addEventListener("click", openModal);
  }

  if (closeBtn) {
    closeBtn.addEventListener("click", closeModal);
  }

  if (cancelBtn) {
    cancelBtn.addEventListener("click", closeModal);
  }

  if (form) {
    form.addEventListener("submit", handleCreateEntity);
  }

  if (modal) {
    modal.addEventListener("click", (event) => {
      if (event.target === modal) {
        closeModal();
      }
    });
  }

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeModal();
    }
  });

  if (searchInput) {
    searchInput.addEventListener("input", (event) => {
      state.filters.search = event.target.value || "";
      renderEntities();
    });
  }

  if (statusFilter) {
    statusFilter.addEventListener("change", (event) => {
      state.filters.status = event.target.value;
      renderEntities();
    });
  }

  if (riskFilter) {
    riskFilter.addEventListener("change", (event) => {
      state.filters.risk = event.target.value;
      renderEntities();
    });
  }
}

// ===============================
// INIT
// ===============================
document.addEventListener("DOMContentLoaded", () => {
  loadState();
  importClientSubmissionIfPresent();
  bindEvents();
  renderAll();
});
