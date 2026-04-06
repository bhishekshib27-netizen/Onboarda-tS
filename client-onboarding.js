document.addEventListener("DOMContentLoaded", () => {
  const browseBtn = document.getElementById("browseBtn");
  const documentUpload = document.getElementById("documentUpload");
  const uploadArea = document.getElementById("uploadArea");
  const fileList = document.getElementById("fileList");
  const fileCount = document.getElementById("fileCount");
  const reviewBtn = document.getElementById("reviewBtn");

  const fullName = document.getElementById("fullName");
  const companyName = document.getElementById("companyName");
  const email = document.getElementById("email");
  const clientType = document.getElementById("clientType");
  const country = document.getElementById("country");
  const serviceLevel = document.getElementById("serviceLevel");

  const submissionStatus = document.getElementById("submissionStatus");
  const summaryDocs = document.getElementById("summaryDocs");

  const resultState = document.getElementById("resultState");
  const resultContent = document.getElementById("resultContent");
  const riskBadge = document.getElementById("riskBadge");
  const reviewStatus = document.getElementById("reviewStatus");
  const riskLevelText = document.getElementById("riskLevelText");
  const priceText = document.getElementById("priceText");
  const nextStepText = document.getElementById("nextStepText");

  let uploadedFiles = [];

  if (browseBtn && documentUpload) {
    browseBtn.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      documentUpload.click();
    });
  }

  if (documentUpload) {
    documentUpload.addEventListener("change", (event) => {
      handleFiles(event.target.files);
      documentUpload.value = "";
    });
  }

  if (uploadArea) {
    uploadArea.addEventListener("dragover", (event) => {
      event.preventDefault();
      uploadArea.classList.add("dragover");
    });

    uploadArea.addEventListener("dragleave", () => {
      uploadArea.classList.remove("dragover");
    });

    uploadArea.addEventListener("drop", (event) => {
      event.preventDefault();
      uploadArea.classList.remove("dragover");
      handleFiles(event.dataTransfer.files);
    });
  }

  [fullName, companyName, email, clientType, country, serviceLevel].forEach((field) => {
    if (!field) return;
    field.addEventListener("input", updateSubmissionStatus);
    field.addEventListener("change", updateSubmissionStatus);
  });

  if (reviewBtn) {
    reviewBtn.addEventListener("click", runAIReview);
  }

  function handleFiles(files) {
    if (!files || !files.length) return;

    const allowedExtensions = ["pdf", "jpg", "jpeg", "png", "doc", "docx"];

    Array.from(files).forEach((file) => {
      const extension = file.name.split(".").pop().toLowerCase();

      if (!allowedExtensions.includes(extension)) {
        alert(`File type not supported: ${file.name}`);
        return;
      }

      const duplicate = uploadedFiles.some(
        (existing) =>
          existing.name === file.name &&
          existing.size === file.size &&
          existing.lastModified === file.lastModified
      );

      if (!duplicate) {
        uploadedFiles.push(file);
      }
    });

    renderFileList();
    updateSubmissionStatus();
  }

  function renderFileList() {
    fileCount.textContent = `${uploadedFiles.length} ${uploadedFiles.length === 1 ? "file" : "files"}`;
    summaryDocs.textContent = uploadedFiles.length;

    if (!uploadedFiles.length) {
      fileList.className = "file-list empty";
      fileList.innerHTML = "No documents uploaded yet.";
      return;
    }

    fileList.className = "file-list";
    fileList.innerHTML = uploadedFiles
      .map((file) => {
        return `
          <div class="file-item">
            <div class="file-info">
              <div class="file-name">${escapeHtml(file.name)}</div>
              <div class="file-meta">${formatFileSize(file.size)}</div>
            </div>
            <div class="file-status">Uploaded</div>
          </div>
        `;
      })
      .join("");
  }

  function updateSubmissionStatus() {
    const detailsComplete =
      fullName.value.trim() &&
      email.value.trim() &&
      clientType.value &&
      country.value &&
      serviceLevel.value;

    if (!detailsComplete && uploadedFiles.length === 0) {
      submissionStatus.textContent = "Waiting for details";
      return;
    }

    if (detailsComplete && uploadedFiles.length === 0) {
      submissionStatus.textContent = "Ready for documents";
      return;
    }

    if (!detailsComplete && uploadedFiles.length > 0) {
      submissionStatus.textContent = "Waiting for client details";
      return;
    }

    submissionStatus.textContent = "Ready for AI review";
  }

  function runAIReview() {
    const detailsComplete =
      fullName.value.trim() &&
      email.value.trim() &&
      clientType.value &&
      country.value &&
      serviceLevel.value;

    if (!detailsComplete) {
      alert("Please complete all required client details before running the AI review.");
      return;
    }

    if (uploadedFiles.length === 0) {
      alert("Please upload at least one document before running the AI review.");
      return;
    }

    const result = calculateRiskAndPrice();

    resultState.classList.add("hidden");
    resultContent.classList.remove("hidden");

    riskBadge.className = `risk-badge ${result.riskClass}`;
    riskBadge.textContent = result.riskLabel;
    reviewStatus.textContent = result.reviewStatus;
    riskLevelText.textContent = result.riskLabel;

    if (result.riskClass === "high") {
      priceText.textContent = "Pending";
      nextStepText.textContent =
        "Compliance Review Required. Your submission has been escalated for manual compliance assessment before pricing can be confirmed.";
    } else if (result.riskClass === "medium") {
      priceText.textContent = result.price;
      nextStepText.textContent =
        "Your submission requires an enhanced review path. Preliminary pricing is shown above and additional checks may apply.";
    } else {
      priceText.textContent = result.price;
      nextStepText.textContent =
        "Your onboarding can proceed with the preliminary pricing shown above.";
    }

    submissionStatus.textContent =
      result.riskClass === "high"
        ? "Escalated to compliance"
        : "AI review completed";
  }

  function calculateRiskAndPrice() {
    let score = 0;

    const type = clientType.value;
    const jurisdiction = country.value;
    const service = serviceLevel.value;
    const docs = uploadedFiles.length;

    if (type === "individual") score += 1;
    if (type === "startup") score += 2;
    if (type === "sme") score += 3;
    if (type === "corporate") score += 5;
    if (type === "trust") score += 7;

    if (jurisdiction === "mauritius") score += 1;
    if (jurisdiction === "singapore") score += 2;
    if (jurisdiction === "uae") score += 3;
    if (jurisdiction === "uk") score += 2;
    if (jurisdiction === "south-africa") score += 3;
    if (jurisdiction === "seychelles") score += 6;
    if (jurisdiction === "bvi") score += 7;
    if (jurisdiction === "other") score += 5;

    if (service === "basic") score += 1;
    if (service === "standard") score += 2;
    if (service === "enhanced") score += 4;

    if (docs >= 1 && docs <= 2) score += 2;
    if (docs >= 3 && docs <= 4) score += 1;
    if (docs >= 5) score += 0;

    if (score >= 13) {
      return {
        riskClass: "high",
        riskLabel: "High Risk",
        reviewStatus: "Compliance Review Required",
        price: "Pending"
      };
    }

    if (score >= 8) {
      return {
        riskClass: "medium",
        riskLabel: "Medium Risk",
        reviewStatus: "Enhanced Review Path",
        price: "$1,250"
      };
    }

    return {
      riskClass: "low",
      riskLabel: "Low Risk",
      reviewStatus: "Preliminary Review Complete",
      price: "$650"
    };
  }

  function formatFileSize(bytes) {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  function escapeHtml(value) {
    return value
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }
});
