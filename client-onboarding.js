const state = {
  files: [],
  alerts: [],
  averageConfidence: 0,
  assessmentRun: false,
  riskScore: 0,
  riskLevel: "Pending",
  price: 0,
  floorRuleTriggered: false,
  escalationTriggered: false
};

const uploadInput = document.getElementById("documentUpload");
const browseFilesBtn = document.getElementById("browseFilesBtn");
const uploadZone = document.getElementById("uploadZone");
const fileList = document.getElementById("fileList");
const fileCountBadge = document.getElementById("fileCountBadge");
const uploadStatusChip = document.getElementById("uploadStatusChip");

const runAssessmentBtn = document.getElementById("runAssessmentBtn");
const submitOnboardingBtn = document.getElementById("submitOnboardingBtn");
const activityTimeline = document.getElementById("activityTimeline");

const classificationStatus = document.getElementById("classificationStatus");
const extractionStatus = document.getElementById("extractionStatus");
const crossValidationStatus = document.getElementById("crossValidationStatus");
const confidenceScore = document.getElementById("confidenceScore");
const validationAlerts = document.getElementById("validationAlerts");

const sanctionsStatus = document.getElementById("sanctionsStatus");
const pepStatus = document.getElementById("pepStatus");
const adverseMediaStatus = document.getElementById("adverseMediaStatus");
const jurisdictionStatus = document.getElementById("jurisdictionStatus");

const riskChip = document.getElementById("riskChip");
const riskScoreNumber = document.getElementById("riskScoreNumber");
const riskSummaryTitle = document.getElementById("riskSummaryTitle");
const riskSummaryText = document.getElementById("riskSummaryText");

const dimension1Score = document.getElementById("dimension1Score");
const dimension2Score = document.getElementById("dimension2Score");
const dimension3Score = document.getElementById("dimension3Score");
const dimension4Score = document.getElementById("dimension4Score");
const dimension5Score = document.getElementById("dimension5Score");

const priceOutput = document.getElementById("priceOutput");
const priceTier = document.getElementById("priceTier");
const baseFee = document.getElementById("baseFee");
const complexityFee = document.getElementById("complexityFee");
const riskFee = document.getElementById("riskFee");

const outcomeChip = document.getElementById("outcomeChip");
const outcomeTitle = document.getElementById("outcomeTitle");
const outcomeText = document.getElementById("outcomeText");

const readinessScore = document.getElementById("readinessScore");
const heroRiskLevel = document.getElementById("heroRiskLevel");
const heroPrice = document.getElementById("heroPrice");

const formIds = [
  "entityName",
  "registrationNumber",
  "clientType",
  "ownershipStructure",
  "beneficialOwners",
  "jurisdiction",
  "uboNationality",
  "intermediaryJurisdiction",
  "countriesOfOperation",
  "paymentCorridors",
  "primaryService",
  "transactionVolume",
  "transactionComplexity",
  "industry",
  "pepStatusInput",
  "adverseMediaInput",
  "sourceOfWealth",
  "sourceOfFunds",
  "referralMethod",
  "interactionType",
  "businessActivity"
];

function formatCurrency(amount) {
  return `$${amount}`;
}

function addTimelineItem(title, description) {
  const item = document.createElement("div");
  item.className = "timeline-item";
  item.innerHTML = `
    <span class="timeline-dot"></span>
    <div>
      <h4>${title}</h4>
      <p>${description}</p>
    </div>
  `;
  activityTimeline.prepend(item);
}

function getDocumentType(fileName) {
  const name = fileName.toLowerCase();

  if (name.includes("passport") || name.includes("id") || name.includes("identity")) {
    return "Identity Document";
  }
  if (name.includes("address") || name.includes("utility") || name.includes("proof")) {
    return "Proof of Address";
  }
  if (name.includes("incorporation") || name.includes("certificate") || name.includes("company")) {
    return "Corporate Registration";
  }
  if (name.includes("bank") || name.includes("statement")) {
    return "Bank Statement";
  }
  if (name.includes("shareholder") || name.includes("register")) {
    return "Shareholder Register";
  }
  if (name.includes("fund") || name.includes("wealth") || name.includes("source")) {
    return "Source of Funds";
  }

  return "Supporting Document";
}

function createFileRecord(file) {
  return {
    name: file.name,
    size: file.size,
    sizeLabel: `${(file.size / 1024 / 1024).toFixed(2)} MB`,
    typeLabel: getDocumentType(file.name),
    confidence: 0,
    status: "Uploaded",
    statusClass: "info",
    issues: []
  };
}

function updateFileCount() {
  const count = state.files.length;
  fileCountBadge.textContent = `${count} file${count === 1 ? "" : "s"}`;
  uploadStatusChip.textContent = count ? "Files Added" : "Awaiting Files";
  uploadStatusChip.className = count ? "status-chip info" : "status-chip neutral";
}

function renderFiles() {
  if (!state.files.length) {
    fileList.className = "file-list empty-state";
    fileList.innerHTML = `<p>No documents uploaded yet.</p>`;
    updateFileCount();
    return;
  }

  fileList.className = "file-list";
  fileList.innerHTML = "";

  state.files.forEach((file, index) => {
    const row = document.createElement("div");
    row.className = "file-row";
    row.innerHTML = `
      <div class="file-meta">
        <div class="file-icon">${file.typeLabel.charAt(0)}</div>
        <div>
          <h4>${file.name}</h4>
          <p>${file.typeLabel} · ${file.sizeLabel}</p>
        </div>
      </div>
      <div class="file-status-wrap">
        <span class="status-chip ${file.statusClass}">${file.status}</span>
        <button class="ghost-btn danger-text remove-file-btn" type="button" data-index="${index}">
          Remove
        </button>
      </div>
    `;
    fileList.appendChild(row);
  });

  updateFileCount();

  document.querySelectorAll(".remove-file-btn").forEach((button) => {
    button.addEventListener("click", () => {
      const index = Number(button.dataset.index);
      const removedFile = state.files[index];
      state.files.splice(index, 1);
      renderFiles();
      resetAssessmentView();
      addTimelineItem("Document removed", `${removedFile.name} was removed from the file set.`);
      updateReadiness();
    });
  });
}

function handleFiles(fileCollection) {
  const incomingFiles = Array.from(fileCollection);
  if (!incomingFiles.length) return;

  incomingFiles.forEach((file) => {
    const exists = state.files.some(
      (existing) => existing.name === file.name && existing.size === file.size
    );

    if (!exists) {
      state.files.push(createFileRecord(file));
      addTimelineItem("Document uploaded", `${file.name} was added for AI validation and review.`);
    }
  });

  renderFiles();
  updateReadiness();
}

function getFieldValue(id) {
  const element = document.getElementById(id);
  return element ? element.value.trim() : "";
}

function countCompletedFields() {
  let completed = 0;

  formIds.forEach((id) => {
    const value = getFieldValue(id);
    if (value !== "") completed += 1;
  });

  return completed;
}

function updateReadiness() {
  const completedFields = countCompletedFields();
  const fieldRatio = Math.round((completedFields / formIds.length) * 55);
  const fileRatio = Math.min(state.files.length * 8, 25);
  const assessmentRatio = state.assessmentRun ? 20 : 0;
  const total = Math.min(fieldRatio + fileRatio + assessmentRatio, 100);

  readinessScore.textContent = `${total}%`;
}

function resetAssessmentView() {
  state.assessmentRun = false;
  state.alerts = [];
  state.averageConfidence = 0;
  state.floorRuleTriggered = false;
  state.escalationTriggered = false;

  classificationStatus.textContent = "Pending";
  extractionStatus.textContent = "Pending";
  crossValidationStatus.textContent = "Pending";
  confidenceScore.textContent = "0%";

  validationAlerts.innerHTML = `<li>No validation issues detected yet.</li>`;

  sanctionsStatus.textContent = "Pending";
  pepStatus.textContent = "Pending";
  adverseMediaStatus.textContent = "Pending";
  jurisdictionStatus.textContent = "Pending";

  state.files = state.files.map((file) => ({
    ...file,
    confidence: 0,
    status: "Uploaded",
    statusClass: "info",
    issues: []
  }));

  renderFiles();
  updateRiskAndPricing();
  updateReadiness();
}

browseFilesBtn.addEventListener("click", () => uploadInput.click());

uploadInput.addEventListener("change", (event) => {
  handleFiles(event.target.files);
  uploadInput.value = "";
});

uploadZone.addEventListener("dragover", (event) => {
  event.preventDefault();
  uploadZone.classList.add("drag-active");
});

uploadZone.addEventListener("dragleave", () => {
  uploadZone.classList.remove("drag-active");
});

uploadZone.addEventListener("drop", (event) => {
  event.preventDefault();
  uploadZone.classList.remove("drag-active");
  handleFiles(event.dataTransfer.files);
});

formIds.forEach((id) => {
  const element = document.getElementById(id);
  if (!element) return;

  element.addEventListener("input", () => {
    resetAssessmentView();
    updateReadiness();
  });

  element.addEventListener("change", () => {
    resetAssessmentView();
    updateReadiness();
  });
});
  state.averageConfidence = Math.round(totalConfidence / state.files.length);

  classificationStatus.textContent = "Complete";
  extractionStatus.textContent = "Complete";
  crossValidationStatus.textContent =
    state.averageConfidence >= 90 ? "Passed" : "Review";
  confidenceScore.textContent = `${state.averageConfidence}%`;

  assessScreeningResults();
  updateRiskAndPricing();

  state.alerts = generateValidationAlerts();
  renderValidationAlerts();

  state.assessmentRun = true;
  updateOutcome(state.riskScore);
  updateReadiness();

  addTimelineItem(
    "AI validation completed",
    `Assessment finished with ${state.averageConfidence}% average confidence across ${state.files.length} file(s).`
  );

  if (
    state.alerts.length &&
    state.alerts[0] !== "No material validation issues detected."
  ) {
    addTimelineItem(
      "Validation alerts generated",
      `${state.alerts.length} onboarding alert(s) were raised for follow-up review.`
    );
  }
}

function updateOutcome(totalScore) {
  const hasEscalationAlert = state.alerts.some((alert) =>
    /sanctioned|very high|black list|floor rule|mandatory compliance approval/i.test(alert)
  );

  if (!state.assessmentRun) {
    outcomeChip.textContent = "Awaiting Review";
    outcomeChip.className = "status-chip neutral";
    outcomeTitle.textContent = "Assessment Not Yet Run";
    outcomeText.textContent =
      "Run the AI assessment to generate a risk-based onboarding recommendation.";
    return;
  }

  if (hasEscalationAlert || totalScore >= 85) {
    outcomeChip.textContent = "Escalate";
    outcomeChip.className = "status-chip danger";
    outcomeTitle.textContent = "Compliance Approval Required";
    outcomeText.textContent =
      "This onboarding case meets escalation criteria and requires compliance approval before onboarding can proceed.";
    return;
  }

  if (totalScore >= 70) {
    outcomeChip.textContent = "EDD Required";
    outcomeChip.className = "status-chip danger";
    outcomeTitle.textContent = "Enhanced Due Diligence Required";
    outcomeText.textContent =
      "This onboarding case falls within the high-risk range and requires enhanced due diligence before acceptance.";
    return;
  }

  if (totalScore >= 40) {
    outcomeChip.textContent = "CDD Review";
    outcomeChip.className = "status-chip warning";
    outcomeTitle.textContent = "Customer Due Diligence Required";
    outcomeText.textContent =
      "This onboarding case is medium risk and should proceed through standard customer due diligence and compliance review.";
    return;
  }

  outcomeChip.textContent = "Proceed";
  outcomeChip.className = "status-chip success";
  outcomeTitle.textContent = "Simplified Due Diligence Eligible";
  outcomeText.textContent =
    "This onboarding case currently falls within the low-risk range and appears eligible for simplified due diligence, subject to final checks.";
}

function submitOnboardingReview() {
  const entityName = getInputValue("entityName").trim();
  const registrationNumber = getInputValue("registrationNumber").trim();
  const clientType = getInputValue("clientType");
  const jurisdiction = getInputValue("jurisdiction");

  if (!entityName || !clientType || !jurisdiction) {
    alert("Complete the entity profile before submitting the onboarding review.");
    addTimelineItem(
      "Submission blocked",
      "The onboarding file could not be submitted because required entity profile fields are incomplete."
    );
    return;
  }

  if (!state.files.length) {
    alert("Upload the required documents before submitting the onboarding review.");
    addTimelineItem(
      "Submission blocked",
      "The onboarding file could not be submitted because no supporting documents were uploaded."
    );
    return;
  }

  if (!state.assessmentRun) {
    alert("Run the AI assessment before submitting the onboarding review.");
    addTimelineItem(
      "Submission blocked",
      "The onboarding file could not be submitted because the AI assessment has not yet been run."
    );
    return;
  }

  const ref = registrationNumber || `OB-${Date.now().toString().slice(-6)}`;

  addTimelineItem(
    "Onboarding review submitted",
    `${entityName} (${ref}) was submitted with a ${state.riskLevel.toUpperCase()} risk profile and indicative fee of ${formatCurrency(state.price)}.`
  );

  alert(
    `Onboarding submitted successfully.\n\nEntity: ${entityName}\nRisk Rating: ${state.riskLevel}\nRisk Score: ${state.riskScore}/100\nIndicative Fee: ${formatCurrency(state.price)}`
  );
}

runAssessmentBtn.addEventListener("click", runAiAssessment);
submitOnboardingBtn.addEventListener("click", submitOnboardingReview);

[
  "entityName",
  "registrationNumber",
  "jurisdiction",
  "industry",
  "clientType",
  "beneficialOwners",
  "businessActivity",
  "pepQuestion",
  "adverseMediaQuestion",
  "sourceOfWealth",
  "sourceOfFunds",
  "serviceRequired",
  "monthlyVolume",
  "corridorComplexity",
  "introductionMethod",
  "interactionType",
  "uboNationalityRisk",
  "intermediaryJurisdictionRisk",
  "countriesOperationRisk",
  "targetMarketsRisk"
].forEach((id) => {
  const field = document.getElementById(id);
  if (!field) return;

  field.addEventListener("input", () => {
    if (state.assessmentRun) {
      updateRiskAndPricing();
      state.alerts = generateValidationAlerts();
      renderValidationAlerts();
      updateOutcome(state.riskScore);
      updateReadiness();
    } else {
      updateRiskAndPricing();
      updateReadiness();
    }
  });

  field.addEventListener("change", () => {
    if (state.assessmentRun) {
      updateRiskAndPricing();
      state.alerts = generateValidationAlerts();
      renderValidationAlerts();
      updateOutcome(state.riskScore);
      updateReadiness();
    } else {
      updateRiskAndPricing();
      updateReadiness();
    }
  });
});

renderFiles();
updateRiskAndPricing();
updateReadiness();
renderValidationAlerts();
