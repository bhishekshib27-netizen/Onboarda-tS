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

function getInputValue(id) {
  const element = document.getElementById(id);
  return element ? element.value.trim() : "";
}

function getNumericRiskValue(id, fallback = 1) {
  const raw = getInputValue(id);
  const parsed = Number(raw);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
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

  if (uploadStatusChip) {
    uploadStatusChip.textContent = count ? "Files Added" : "Awaiting Files";
    uploadStatusChip.className = count ? "status-chip info" : "status-chip neutral";
  }
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

      addTimelineItem(
        "Document removed",
        `${removedFile.name} was removed from the onboarding file set.`
      );

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
      addTimelineItem(
        "Document uploaded",
        `${file.name} was added for AI validation and review.`
      );
    }
  });

  renderFiles();
  updateReadiness();
}

function countCompletedFields() {
  let completed = 0;

  formIds.forEach((id) => {
    const value = getInputValue(id);
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

function setScreeningBadge(element, value) {
  if (!element) return;

  element.textContent = value;
  const normalized = value.toLowerCase();

  if (normalized.includes("clear") || normalized.includes("low")) {
    element.className = "screening-badge clear";
  } else if (normalized.includes("pending") || normalized.includes("watch")) {
    element.className = "screening-badge watch";
  } else if (normalized.includes("medium") || normalized.includes("review")) {
    element.className = "screening-badge medium";
  } else {
    element.className = "screening-badge high";
  }
}

function assessScreeningResults() {
  const pepValue = getInputValue("pepStatusInput");
  const adverseMediaValue = getInputValue("adverseMediaInput");
  const jurisdiction = getInputValue("jurisdiction");

  let sanctionsValue = "Clear";
  let pepValueLabel = "Clear";
  let adverseValueLabel = "Clear";
  let jurisdictionValue = "Medium";

  if (pepValue === "close-associate" || pepValue === "domestic-pep") {
    pepValueLabel = "Review";
  }

  if (pepValue === "foreign-pep") {
    pepValueLabel = "High";
  }

  if (adverseMediaValue === "minor") {
    adverseValueLabel = "Review";
  }

  if (adverseMediaValue === "confirmed") {
    adverseValueLabel = "High";
  }

  if (jurisdiction === "uk" || jurisdiction === "singapore") {
    jurisdictionValue = "Low";
  } else if (
    jurisdiction === "mauritius" ||
    jurisdiction === "uae" ||
    jurisdiction === "seychelles"
  ) {
    jurisdictionValue = "Medium";
  } else if (jurisdiction === "south-africa") {
    jurisdictionValue = "High";
  }

  setScreeningBadge(sanctionsStatus, sanctionsValue);
  setScreeningBadge(pepStatus, pepValueLabel);
  setScreeningBadge(adverseMediaStatus, adverseValueLabel);
  setScreeningBadge(jurisdictionStatus, jurisdictionValue);
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
function generateValidationAlerts() {
  const alerts = [];

  const clientType = getInputValue("clientType");
  const jurisdiction = getInputValue("jurisdiction");
  const pepValue = getInputValue("pepStatusInput");
  const adverseMediaValue = getInputValue("adverseMediaInput");
  const industry = getInputValue("industry");
  const files = state.files;

  const hasIdentity = files.some((file) => file.typeLabel === "Identity Document");
  const hasAddress = files.some((file) => file.typeLabel === "Proof of Address");
  const hasCorporate = files.some((file) => file.typeLabel === "Corporate Registration");
  const hasBank = files.some((file) => file.typeLabel === "Bank Statement");
  const hasShareholder = files.some((file) => file.typeLabel === "Shareholder Register");
  const hasFunds = files.some((file) => file.typeLabel === "Source of Funds");

  if (!files.length) {
    alerts.push("No documents uploaded for validation.");
    return alerts;
  }

  if (!hasIdentity) {
    alerts.push("Missing identity document for primary verification.");
  }

  if (!hasAddress) {
    alerts.push("Proof of address has not been provided.");
  }

  if ((clientType === "corporate" || clientType === "trust" || clientType === "fund") && !hasCorporate) {
    alerts.push("Corporate formation documents are missing for this entity type.");
  }

  if ((clientType === "corporate" || clientType === "trust" || clientType === "fund") && !hasShareholder) {
    alerts.push("Shareholder register or equivalent ownership documentation is missing.");
  }

  if (!hasBank) {
    alerts.push("Bank statement not uploaded for financial profile review.");
  }

  if (!hasFunds) {
    alerts.push("Source of funds documentation has not been uploaded.");
  }

  const lowConfidenceDocs = files.filter((file) => file.confidence > 0 && file.confidence < 90);
  if (lowConfidenceDocs.length) {
    alerts.push(
      `${lowConfidenceDocs.length} document(s) returned lower extraction confidence and may require manual review.`
    );
  }

  const supportingDocs = files.filter((file) => file.typeLabel === "Supporting Document");
  if (supportingDocs.length >= 2) {
    alerts.push("Multiple unsupported file types detected; document classification should be reviewed.");
  }

  if (pepValue === "foreign-pep") {
    alerts.push("Foreign PEP exposure detected and enhanced due diligence is required.");
  } else if (pepValue === "domestic-pep" || pepValue === "close-associate") {
    alerts.push("PEP-related exposure detected and compliance review is recommended.");
  }

  if (adverseMediaValue === "confirmed") {
    alerts.push("Confirmed adverse media or regulatory action identified.");
  } else if (adverseMediaValue === "minor") {
    alerts.push("Minor or unsubstantiated adverse media identified.");
  }

  if (industry === "crypto") {
    alerts.push("Very high-risk sector detected: cryptocurrency / virtual asset services.");
  }

  if (jurisdiction === "south-africa") {
    alerts.push("High-risk geographic exposure detected based on jurisdiction selection.");
  }

  if (state.floorRuleTriggered) {
    alerts.push("Floor rule triggered: sanctioned-country or sanctioned-nationality override applied.");
  }

  if (state.escalationTriggered) {
    alerts.push("Mandatory compliance approval required based on escalation criteria.");
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

function updatePricing(totalScore) {
  let base = 250;
  let complexity = 100;
  let riskAdjustment = 100;

  const clientType = getInputValue("clientType");
  const beneficialOwners = Number(getInputValue("beneficialOwners") || 0);
  const filesCount = state.files.length;

  if (clientType === "trust" || clientType === "fund") {
    complexity += 150;
  } else if (clientType === "corporate") {
    complexity += 75;
  }

  if (filesCount >= 6) {
    complexity += 125;
  } else if (filesCount >= 4) {
    complexity += 75;
  } else if (filesCount >= 2) {
    complexity += 40;
  }

  if (beneficialOwners >= 5) {
    complexity += 150;
  } else if (beneficialOwners >= 3) {
    complexity += 90;
  } else if (beneficialOwners >= 2) {
    complexity += 50;
  }

  if (totalScore >= 70) {
    riskAdjustment = 700;
    priceTier.textContent = "High-risk onboarding package";
  } else if (totalScore >= 40) {
    riskAdjustment = 300;
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

function updateRiskAndPricing() {
  const clientType = getInputValue("clientType");
  const ownershipStructure = getNumericRiskValue("ownershipStructure", 1);
  const jurisdiction = getInputValue("jurisdiction");
  const uboNationality = getNumericRiskValue("uboNationality", 1);
  const intermediaryJurisdiction = getNumericRiskValue("intermediaryJurisdiction", 1);
  const countriesOfOperation = getNumericRiskValue("countriesOfOperation", 1);
  const paymentCorridors = getNumericRiskValue("paymentCorridors", 1);
  const primaryService = getNumericRiskValue("primaryService", 1);
  const transactionVolume = getNumericRiskValue("transactionVolume", 1);
  const transactionComplexity = getNumericRiskValue("transactionComplexity", 1);
  const industry = getInputValue("industry");
  const pepStatusInput = getInputValue("pepStatusInput");
  const adverseMediaInput = getInputValue("adverseMediaInput");
  const sourceOfWealth = getInputValue("sourceOfWealth");
  const sourceOfFunds = getInputValue("sourceOfFunds");
  const referralMethod = getNumericRiskValue("referralMethod", 1);
  const interactionType = getNumericRiskValue("interactionType", 1);
  const beneficialOwners = Number(getInputValue("beneficialOwners") || 0);

  let entityTypeScore = 2;
  if (clientType === "individual") entityTypeScore = 1;
  else if (clientType === "corporate") entityTypeScore = 2;
  else if (clientType === "trust") entityTypeScore = 3;
  else if (clientType === "fund") entityTypeScore = 4;

  let ownershipStructureScore = ownershipStructure;
  if (!getInputValue("ownershipStructure")) {
    if (beneficialOwners >= 5) ownershipStructureScore = 4;
    else if (beneficialOwners >= 3) ownershipStructureScore = 3;
    else if (beneficialOwners >= 2) ownershipStructureScore = 2;
    else ownershipStructureScore = 1;
  }

  let pepScore = 1;
  if (pepStatusInput === "foreign-pep") pepScore = 4;
  else if (pepStatusInput === "domestic-pep" || pepStatusInput === "close-associate") pepScore = 3;

  let adverseMediaScore = 1;
  if (adverseMediaInput === "confirmed") adverseMediaScore = 4;
  else if (adverseMediaInput === "minor") adverseMediaScore = 2;

  let sourceWealthScore = 2;
  if (
    sourceOfWealth === "business-revenue" ||
    sourceOfWealth === "investment-returns" ||
    sourceOfWealth === "government-funding"
  ) {
    sourceWealthScore = 1;
  } else if (
    sourceOfWealth === "sale-assets" ||
    sourceOfWealth === "venture-capital"
  ) {
    sourceWealthScore = 2;
  } else if (
    sourceOfWealth === "inheritance" ||
    sourceOfWealth === "loan-proceeds" ||
    sourceOfWealth === "other"
  ) {
    sourceWealthScore = 3;
  }

  let sourceFundsScore = 2;
  if (
    sourceOfFunds === "company-account" ||
    sourceOfFunds === "group-transfer" ||
    sourceOfFunds === "client-payments" ||
    sourceOfFunds === "business-revenue"
  ) {
    sourceFundsScore = 1;
  } else if (
    sourceOfFunds === "capital-injection" ||
    sourceOfFunds === "fundraise" ||
    sourceOfFunds === "sale-assets"
  ) {
    sourceFundsScore = 2;
  } else if (
    sourceOfFunds === "loan-drawdown" ||
    sourceOfFunds === "other"
  ) {
    sourceFundsScore = 3;
  }

  const dimension1Raw =
    entityTypeScore * 0.2 +
    ownershipStructureScore * 0.2 +
    pepScore * 0.25 +
    adverseMediaScore * 0.15 +
    sourceWealthScore * 0.1 +
    sourceFundsScore * 0.1;

  const dimension1Weighted = dimension1Raw * 0.3;

  let countryOfIncorporationScore = 2;
  if (jurisdiction === "uk" || jurisdiction === "singapore") {
    countryOfIncorporationScore = 1;
  } else if (
    jurisdiction === "mauritius" ||
    jurisdiction === "uae" ||
    jurisdiction === "seychelles"
  ) {
    countryOfIncorporationScore = 2;
  } else if (jurisdiction === "south-africa") {
    countryOfIncorporationScore = 3;
  } else if (jurisdiction === "blacklist" || jurisdiction === "sanctioned") {
    countryOfIncorporationScore = 4;
  }

  const dimension2Raw =
    countryOfIncorporationScore * 0.25 +
    uboNationality * 0.2 +
    intermediaryJurisdiction * 0.2 +
    countriesOfOperation * 0.2 +
    paymentCorridors * 0.15;

  const dimension2Weighted = dimension2Raw * 0.25;

  const dimension3Raw =
    primaryService * 0.4 +
    transactionVolume * 0.35 +
    transactionComplexity * 0.25;

  const dimension3Weighted = dimension3Raw * 0.2;

  let industryScoreValue = 2;
  if (industry === "financial-services") {
    industryScoreValue = 1;
  } else if (
    industry === "consulting" ||
    industry === "investment-holding" ||
    industry === "trading" ||
    industry === "real-estate"
  ) {
    industryScoreValue = 3;
  } else if (industry === "crypto") {
    industryScoreValue = 4;
  }

  const dimension4Weighted = industryScoreValue * 0.15;

  const dimension5Raw =
    referralMethod * 0.5 +
    interactionType * 0.5;

  const dimension5Weighted = dimension5Raw * 0.1;

  let compositeScore =
    ((dimension1Weighted +
      dimension2Weighted +
      dimension3Weighted +
      dimension4Weighted +
      dimension5Weighted) / 4) * 100;

  compositeScore = Math.round(compositeScore);

  state.floorRuleTriggered = false;
  state.escalationTriggered = false;

  const sanctionedCountry = countryOfIncorporationScore === 4;
  const sanctionedNationality = uboNationality === 4;

  if (sanctionedCountry || sanctionedNationality) {
    compositeScore = Math.max(compositeScore, 70);
    state.floorRuleTriggered = true;
  }

  if (industryScoreValue === 4) {
    compositeScore = Math.max(compositeScore, 70);
    state.escalationTriggered = true;
  }

  if (compositeScore >= 85) {
    state.escalationTriggered = true;
  }

  state.riskScore = compositeScore;

  if (compositeScore >= 70) {
    state.riskLevel = "High";
  } else if (compositeScore >= 40) {
    state.riskLevel = "Medium";
  } else {
    state.riskLevel = "Low";
  }

  dimension1Score.textContent = dimension1Raw.toFixed(2);
  dimension2Score.textContent = dimension2Raw.toFixed(2);
  dimension3Score.textContent = dimension3Raw.toFixed(2);
  dimension4Score.textContent = industryScoreValue.toFixed(2);
  dimension5Score.textContent = dimension5Raw.toFixed(2);

  riskScoreNumber.textContent = compositeScore;
  riskChip.textContent = `${state.riskLevel} Risk`;
  heroRiskLevel.textContent = state.riskLevel;

  riskChip.className = `status-chip ${
    state.riskLevel === "High"
      ? "danger"
      : state.riskLevel === "Medium"
      ? "warning"
      : "success"
  }`;

  if (state.floorRuleTriggered) {
    riskSummaryTitle.textContent = "Floor Rule Triggered";
    riskSummaryText.textContent =
      "A sanctioned-country or sanctioned-nationality override has forced the onboarding case into the high-risk category.";
  } else if (compositeScore >= 70) {
    riskSummaryTitle.textContent = "Enhanced Due Diligence Required";
    riskSummaryText.textContent =
      "This client profile falls within the high-risk range and requires enhanced due diligence based on the weighted onboarding model.";
  } else if (compositeScore >= 40) {
    riskSummaryTitle.textContent = "Customer Due Diligence Required";
    riskSummaryText.textContent =
      "This client profile falls within the medium-risk range and requires standard customer due diligence and compliance review.";
  } else {
    riskSummaryTitle.textContent = "Simplified Due Diligence Eligible";
    riskSummaryText.textContent =
      "This client profile currently falls within the low-risk range and appears eligible for simplified due diligence, subject to document completeness.";
  }

  updatePricing(compositeScore);
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
    let confidence = 96;

    if (file.typeLabel === "Supporting Document") {
      confidence = 84;
    } else if (file.typeLabel === "Source of Funds") {
      confidence = 89;
    } else if (file.typeLabel === "Bank Statement") {
      confidence = 91;
    } else if (file.typeLabel === "Shareholder Register") {
      confidence = 90;
    } else {
      confidence = 95;
    }

    const issues = [];

    if (confidence < 90) {
      issues.push("Lower extraction confidence detected");
    }

    if (file.typeLabel === "Supporting Document") {
      issues.push("Manual classification review recommended");
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

  const totalConfidence = state.files.reduce((sum, file) => sum + file.confidence, 0);
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

  if (hasEscalationAlert || totalScore >= 85 || state.escalationTriggered) {
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
  const entityName = getInputValue("entityName");
  const registrationNumber = getInputValue("registrationNumber");
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

if (browseFilesBtn) {
  browseFilesBtn.addEventListener("click", () => uploadInput.click());
}

if (uploadInput) {
  uploadInput.addEventListener("change", (event) => {
    handleFiles(event.target.files);
    uploadInput.value = "";
  });
}

if (uploadZone) {
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
}

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

if (runAssessmentBtn) {
  runAssessmentBtn.addEventListener("click", runAiAssessment);
}

if (submitOnboardingBtn) {
  submitOnboardingBtn.addEventListener("click", submitOnboardingReview);
}

renderFiles();
updateRiskAndPricing();
updateReadiness();
renderValidationAlerts();
