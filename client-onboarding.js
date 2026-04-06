const state = {
  files: [],
  riskScore: 58,
  riskLevel: "Medium",
  price: 650,
  averageConfidence: 0,
  alerts: [],
  assessmentRun: false
};

const uploadInput = document.getElementById("documentUpload");
const browseFilesBtn = document.getElementById("browseFilesBtn");
const uploadZone = document.getElementById("uploadZone");
const fileList = document.getElementById("fileList");
const fileCountBadge = document.getElementById("fileCountBadge");
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

const jurisdictionScore = document.getElementById("jurisdictionScore");
const ownershipScore = document.getElementById("ownershipScore");
const screeningScore = document.getElementById("screeningScore");
const documentScore = document.getElementById("documentScore");

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

function formatCurrency(amount) {
  return `$${amount}`;
}

function getRandomConfidence(min = 82, max = 98) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getDocumentType(fileName) {
  const name = fileName.toLowerCase();

  if (
    name.includes("passport") ||
    name.includes("id") ||
    name.includes("identity")
  ) {
    return "Identity Document";
  }

  if (
    name.includes("address") ||
    name.includes("utility") ||
    name.includes("proof")
  ) {
    return "Proof of Address";
  }

  if (
    name.includes("incorporation") ||
    name.includes("certificate") ||
    name.includes("company")
  ) {
    return "Corporate Registration";
  }

  if (
    name.includes("bank") ||
    name.includes("statement")
  ) {
    return "Bank Statement";
  }

  if (
    name.includes("shareholder") ||
    name.includes("register")
  ) {
    return "Shareholder Register";
  }

  if (
    name.includes("fund") ||
    name.includes("wealth") ||
    name.includes("source")
  ) {
    return "Source of Funds";
  }

  return "Supporting Document";
}

function getRiskLevel(score) {
  if (score >= 80) return "High";
  if (score >= 50) return "Medium";
  return "Low";
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

function updateFileCount() {
  const count = state.files.length;
  fileCountBadge.textContent = `${count} file${count === 1 ? "" : "s"}`;
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
        <button class="ghost-btn danger-text remove-file-btn" data-index="${index}" type="button">
          Remove
        </button>
      </div>
    `;

    fileList.appendChild(row);
  });

  updateFileCount();

  const removeButtons = document.querySelectorAll(".remove-file-btn");
  removeButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const index = Number(button.dataset.index);
      const removedFile = state.files[index];

      state.files.splice(index, 1);
      renderFiles();
      resetAssessmentView();

      addTimelineItem(
        "Document removed",
        `${removedFile.name} was removed from the onboarding file set.`
      );
    });
  });
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

function handleFiles(fileCollection) {
  const incomingFiles = Array.from(fileCollection);

  if (!incomingFiles.length) return;

  incomingFiles.forEach((file) => {
    const exists = state.files.some(
      (existing) =>
        existing.name === file.name && existing.size === file.size
    );

    if (!exists) {
      state.files.push(createFileRecord(file));

      addTimelineItem(
        "Document uploaded",
        `${file.name} was added for AI validation and screening.`
      );
    }
  });

  renderFiles();
  updateReadiness();
}

function resetAssessmentView() {
  state.assessmentRun = false;
  state.alerts = [];
  state.averageConfidence = 0;

  classificationStatus.textContent = "Pending";
  extractionStatus.textContent = "Pending";
  crossValidationStatus.textContent = "Pending";
  confidenceScore.textContent = "0%";

  validationAlerts.innerHTML = `<li>No validation issues detected yet.</li>`;

  sanctionsStatus.textContent = "Clear";
  pepStatus.textContent = "Watchlist";
  adverseMediaStatus.textContent = "Clear";
  jurisdictionStatus.textContent = "Moderate";

  state.files = state.files.map((file) => ({
    ...file,
    confidence: 0,
    status: "Uploaded",
    statusClass: "info",
    issues: []
  }));

  renderFiles();
  updateRiskAndPricing();
}

function updateReadiness() {
  const base = state.files.length ? 55 : 20;
  const fileBoost = Math.min(state.files.length * 8, 24);
  const completed = state.assessmentRun ? 18 : 0;
  const score = Math.min(base + fileBoost + completed, 100);

  readinessScore.textContent = `${score}%`;
}

browseFilesBtn.addEventListener("click", () => {
  uploadInput.click();
});

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
function generateValidationAlerts() {
  const alerts = [];

  if (!state.files.length) {
    alerts.push("No documents uploaded for validation.");
    return alerts;
  }

  const hasIdentity = state.files.some((file) =>
    file.typeLabel === "Identity Document"
  );
  const hasAddress = state.files.some((file) =>
    file.typeLabel === "Proof of Address"
  );
  const hasCorporate = state.files.some((file) =>
    file.typeLabel === "Corporate Registration"
  );
  const hasBank = state.files.some((file) =>
    file.typeLabel === "Bank Statement"
  );

  if (!hasIdentity) {
    alerts.push("Missing identity document for primary verification.");
  }

  if (!hasAddress) {
    alerts.push("Proof of address has not been provided.");
  }

  const clientType = document.getElementById("clientType").value;
  if ((clientType === "corporate" || clientType === "fund" || clientType === "trust") && !hasCorporate) {
    alerts.push("Corporate formation documents are missing for this entity type.");
  }

  if (!hasBank) {
    alerts.push("Bank statement not uploaded for financial profile review.");
  }

  const beneficialOwnersValue = Number(
    document.getElementById("beneficialOwners").value || 0
  );
  if (beneficialOwnersValue >= 4) {
    alerts.push("High ownership complexity detected due to multiple beneficial owners.");
  }

  const lowConfidenceDocs = state.files.filter((file) => file.confidence < 88);
  if (lowConfidenceDocs.length) {
    alerts.push(
      `${lowConfidenceDocs.length} document(s) returned lower AI confidence and may require manual review.`
    );
  }

  const supportingDocs = state.files.filter(
    (file) => file.typeLabel === "Supporting Document"
  );
  if (supportingDocs.length >= 2) {
    alerts.push("Multiple unsupported file types detected; document classification should be reviewed.");
  }

  const businessActivity = document.getElementById("businessActivity").value.trim().toLowerCase();
  if (
    businessActivity.includes("crypto") ||
    businessActivity.includes("virtual asset") ||
    businessActivity.includes("digital asset")
  ) {
    alerts.push("Business activity indicates elevated sector risk exposure.");
  }

  return alerts.length ? alerts : ["No material validation issues detected."];
}

function renderValidationAlerts() {
  validationAlerts.innerHTML = "";

  state.alerts.forEach((alert) => {
    const item = document.createElement("li");
    item.textContent = alert;
    validationAlerts.appendChild(item);
  });
}

function assessScreeningResults() {
  const jurisdiction = document.getElementById("jurisdiction").value;
  const industry = document.getElementById("industry").value;
  const beneficialOwnersValue = Number(
    document.getElementById("beneficialOwners").value || 0
  );
  const entityName = document.getElementById("entityName").value.trim().toLowerCase();

  let sanctions = "Clear";
  let pep = "Watchlist";
  let adverseMedia = "Clear";
  let jurisdictionRisk = "Moderate";

  if (jurisdiction === "seychelles") {
    jurisdictionRisk = "High";
  } else if (jurisdiction === "uae" || jurisdiction === "south-africa") {
    jurisdictionRisk = "Moderate";
  } else if (jurisdiction === "uk" || jurisdiction === "singapore") {
    jurisdictionRisk = "Low";
  }

  if (industry === "crypto") {
    pep = "Review";
    adverseMedia = "Review";
  }

  if (beneficialOwnersValue >= 5) {
    pep = "Review";
  }

  if (
    entityName.includes("global") ||
    entityName.includes("holdings") ||
    entityName.includes("international")
  ) {
    adverseMedia = "Review";
  }

  sanctionsStatus.textContent = sanctions;
  pepStatus.textContent = pep;
  adverseMediaStatus.textContent = adverseMedia;
  jurisdictionStatus.textContent = jurisdictionRisk;

  sanctionsStatus.className = `screening-badge ${sanctions === "Clear" ? "clear" : "watch"}`;
  pepStatus.className = `screening-badge ${
    pep === "Clear" ? "clear" : pep === "Watchlist" ? "watch" : "medium"
  }`;
  adverseMediaStatus.className = `screening-badge ${
    adverseMedia === "Clear" ? "clear" : "medium"
  }`;
  jurisdictionStatus.className = `screening-badge ${
    jurisdictionRisk === "High"
      ? "high"
      : jurisdictionRisk === "Moderate"
      ? "medium"
      : "clear"
  }`;

  return { sanctions, pep, adverseMedia, jurisdictionRisk };
}

function runAiAssessment() {
  if (!state.files.length) {
    addTimelineItem(
      "Assessment blocked",
      "AI assessment could not start because no documents were uploaded."
    );
    alert("Upload at least one document before running the AI assessment.");
    return;
  }

  classificationStatus.textContent = "Running";
  extractionStatus.textContent = "Running";
  crossValidationStatus.textContent = "Running";

  state.files = state.files.map((file) => {
    const confidence = getRandomConfidence(
      file.typeLabel === "Supporting Document" ? 80 : 86,
      file.typeLabel === "Supporting Document" ? 91 : 98
    );

    const issues = [];

    if (confidence < 88) {
      issues.push("Low extraction confidence");
    }

    if (file.typeLabel === "Supporting Document") {
      issues.push("Document type requires manual classification review");
    }

    return {
      ...file,
      confidence,
      status: confidence >= 90 ? "Validated" : "Review Required",
      statusClass: confidence >= 90 ? "success" : "warning",
      issues
    };
  });

  renderFiles();

  const totalConfidence = state.files.reduce(
    (sum, file) => sum + file.confidence,
    0
  );

  state.averageConfidence = Math.round(totalConfidence / state.files.length);
  confidenceScore.textContent = `${state.averageConfidence}%`;

  classificationStatus.textContent = "Complete";
  extractionStatus.textContent = "Complete";
  crossValidationStatus.textContent = state.averageConfidence >= 90 ? "Passed" : "Review";

  state.alerts = generateValidationAlerts();
  renderValidationAlerts();

  const screening = assessScreeningResults();

  addTimelineItem(
    "AI validation completed",
    `Assessment finished with ${state.averageConfidence}% average confidence across ${state.files.length} file(s).`
  );

  if (state.alerts.length && state.alerts[0] !== "No material validation issues detected.") {
    addTimelineItem(
      "Validation alerts generated",
      `${state.alerts.length} onboarding alert(s) were raised for follow-up review.`
    );
  }

  addTimelineItem(
    "Screening updated",
    `Sanctions: ${screening.sanctions}, PEP: ${screening.pep}, Adverse Media: ${screening.adverseMedia}, Jurisdiction: ${screening.jurisdictionRisk}.`
  );

  state.assessmentRun = true;
  updateRiskAndPricing();
  updateReadiness();
}
function updateRiskAndPricing() {
  const jurisdiction = document.getElementById("jurisdiction").value;
  const industry = document.getElementById("industry").value;
  const beneficialOwnersValue = Number(
    document.getElementById("beneficialOwners").value || 0
  );
  const clientType = document.getElementById("clientType").value;

  let jurisdictionPoints = 12;
  let ownershipPoints = 8;
  let screeningPoints = 14;
  let documentPoints = 10;

  if (jurisdiction === "seychelles") {
    jurisdictionPoints = 26;
  } else if (jurisdiction === "uae" || jurisdiction === "south-africa") {
    jurisdictionPoints = 18;
  } else if (jurisdiction === "uk" || jurisdiction === "singapore") {
    jurisdictionPoints = 8;
  } else if (jurisdiction === "mauritius") {
    jurisdictionPoints = 12;
  }

  if (beneficialOwnersValue >= 5) {
    ownershipPoints = 22;
  } else if (beneficialOwnersValue >= 3) {
    ownershipPoints = 16;
  } else if (beneficialOwnersValue >= 1) {
    ownershipPoints = 10;
  }

  if (industry === "crypto") {
    screeningPoints = 24;
  } else if (industry === "financial-services" || industry === "investment-holding") {
    screeningPoints = 18;
  } else if (industry === "real-estate" || industry === "trading") {
    screeningPoints = 16;
  } else {
    screeningPoints = 10;
  }

  if (!state.files.length) {
    documentPoints = 6;
  } else if (state.averageConfidence >= 94) {
    documentPoints = 8;
  } else if (state.averageConfidence >= 89) {
    documentPoints = 12;
  } else {
    documentPoints = 18;
  }

  if (clientType === "fund" || clientType === "trust") {
    ownershipPoints += 4;
    screeningPoints += 3;
  }

  const alertPenalty =
    state.alerts.length &&
    state.alerts[0] !== "No material validation issues detected."
      ? Math.min(state.alerts.length * 3, 12)
      : 0;

  const totalScore = Math.min(
    jurisdictionPoints + ownershipPoints + screeningPoints + documentPoints + alertPenalty,
    100
  );

  state.riskScore = totalScore;
  state.riskLevel = getRiskLevel(totalScore);

  jurisdictionScore.textContent = jurisdictionPoints;
  ownershipScore.textContent = ownershipPoints;
  screeningScore.textContent = screeningPoints;
  documentScore.textContent = documentPoints;

  riskScoreNumber.textContent = totalScore;
  riskChip.textContent = `${state.riskLevel} Risk`;

  riskChip.className = `status-chip ${
    state.riskLevel === "High"
      ? "danger"
      : state.riskLevel === "Medium"
      ? "warning"
      : "success"
  }`;

  if (state.riskLevel === "High") {
    riskSummaryTitle.textContent = "High-Risk Client Profile";
    riskSummaryText.textContent =
      "This onboarding case requires enhanced due diligence due to elevated exposure across screening, ownership, or jurisdiction factors.";
  } else if (state.riskLevel === "Medium") {
    riskSummaryTitle.textContent = "Enhanced Due Diligence Recommended";
    riskSummaryText.textContent =
      "Initial onboarding indicators suggest a moderate-risk profile requiring targeted compliance review before approval.";
  } else {
    riskSummaryTitle.textContent = "Standard Due Diligence Suitable";
    riskSummaryText.textContent =
      "The current onboarding profile appears lower risk, with no major indicators requiring escalation at this stage.";
  }

  updatePricing(totalScore);
  updateOutcome(totalScore);

  heroRiskLevel.textContent = state.riskLevel;
}

function updatePricing(totalScore) {
  let base = 250;
  let complexity = 100;
  let riskAdjustment = 100;

  if (state.files.length >= 4) {
    complexity += 100;
  } else if (state.files.length >= 2) {
    complexity += 50;
  }

  const beneficialOwnersValue = Number(
    document.getElementById("beneficialOwners").value || 0
  );
  if (beneficialOwnersValue >= 4) {
    complexity += 100;
  } else if (beneficialOwnersValue >= 2) {
    complexity += 50;
  }

  if (totalScore >= 80) {
    riskAdjustment = 700;
    priceTier.textContent = "High-risk onboarding package";
  } else if (totalScore >= 50) {
    riskAdjustment = 250;
    priceTier.textContent = "Medium-risk onboarding package";
  } else {
    riskAdjustment = 100;
    priceTier.textContent = "Low-risk onboarding package";
  }

  const totalPrice = base + complexity + riskAdjustment;

  state.price = totalPrice;

  priceOutput.textContent = formatCurrency(totalPrice);
  baseFee.textContent = formatCurrency(base);
  complexityFee.textContent = formatCurrency(complexity);
  riskFee.textContent = formatCurrency(riskAdjustment);
  heroPrice.textContent = formatCurrency(totalPrice);
}

function updateOutcome(totalScore) {
  if (!state.assessmentRun) {
    outcomeChip.textContent = "Awaiting Review";
    outcomeChip.className = "status-chip neutral";
    outcomeTitle.textContent = "Assessment Not Yet Run";
    outcomeText.textContent =
      "Run the AI assessment to generate a risk-based onboarding recommendation.";
    return;
  }

  if (totalScore >= 80) {
    outcomeChip.textContent = "Escalate";
    outcomeChip.className = "status-chip danger";
    outcomeTitle.textContent = "Compliance Escalation Required";
    outcomeText.textContent =
      "This case should be escalated for enhanced due diligence and senior compliance review before onboarding can proceed.";
  } else if (totalScore >= 50) {
    outcomeChip.textContent = "Manual Review";
    outcomeChip.className = "status-chip warning";
    outcomeTitle.textContent = "Further Review Required";
    outcomeText.textContent =
      "Additional verification is recommended before client acceptance. AI checks identified items requiring compliance review.";
  } else {
    outcomeChip.textContent = "Proceed";
    outcomeChip.className = "status-chip success";
    outcomeTitle.textContent = "Eligible for Standard Processing";
    outcomeText.textContent =
      "The onboarding profile is currently suitable for standard due diligence and can proceed to the next workflow stage.";
  }
}

runAssessmentBtn.addEventListener("click", () => {
  runAiAssessment();
});

submitOnboardingBtn.addEventListener("click", () => {
  if (!state.files.length) {
    addTimelineItem(
      "Submission blocked",
      "Submission was attempted without any uploaded supporting documents."
    );
    alert("Please upload documents before submitting the onboarding review.");
    return;
  }

  if (!state.assessmentRun) {
    addTimelineItem(
      "Submission blocked",
      "Submission was attempted before the AI assessment was completed."
    );
    alert("Run the AI assessment before submitting the review.");
    return;
  }

  addTimelineItem(
    "Onboarding review submitted",
    `Case submitted with ${state.riskLevel} risk rating and indicative fee of ${formatCurrency(state.price)}.`
  );

  alert(
    `Onboarding review submitted.\nRisk Level: ${state.riskLevel}\nIndicative Fee: ${formatCurrency(state.price)}`
  );
});

[
  "entityName",
  "registrationNumber",
  "jurisdiction",
  "industry",
  "clientType",
  "beneficialOwners",
  "businessActivity"
].forEach((fieldId) => {
  const field = document.getElementById(fieldId);
  if (!field) return;

  field.addEventListener("input", () => {
    if (state.assessmentRun) {
      state.assessmentRun = false;
      addTimelineItem(
        "Profile updated",
        "Entity information changed, so the previous assessment should be rerun."
      );
    }

    updateRiskAndPricing();
    updateReadiness();
    updateOutcome(state.riskScore);
  });

  field.addEventListener("change", () => {
    if (state.assessmentRun) {
      state.assessmentRun = false;
      addTimelineItem(
        "Profile updated",
        "Entity information changed, so the previous assessment should be rerun."
      );
    }

    updateRiskAndPricing();
    updateReadiness();
    updateOutcome(state.riskScore);
  });
});

renderFiles();
updateReadiness();
updateRiskAndPricing();
updateOutcome(state.riskScore);
