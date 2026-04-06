// ═══════════════════════════════════════════════
// 1. PARTICLES
// ═══════════════════════════════════════════════
(function () {
  const canvas = document.getElementById("particles-canvas");
  if (!canvas) return;

  const ctx = canvas.getContext("2d");
  const particles = [];

  function resizeCanvas() {
    if (!canvas.parentElement) return;
    canvas.width = canvas.parentElement.offsetWidth;
    canvas.height = canvas.parentElement.offsetHeight;
  }

  resizeCanvas();
  window.addEventListener("resize", resizeCanvas);

  for (let i = 0; i < 60; i++) {
    particles.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
      r: Math.random() * 2 + 0.5,
      o: Math.random() * 0.3 + 0.05
    });
  }

  function drawParticles() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    particles.forEach((p) => {
      p.x += p.vx;
      p.y += p.vy;

      if (p.x < 0) p.x = canvas.width;
      if (p.x > canvas.width) p.x = 0;
      if (p.y < 0) p.y = canvas.height;
      if (p.y > canvas.height) p.y = 0;

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(99,102,241,${p.o})`;
      ctx.fill();
    });

    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < 120) {
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = `rgba(99,102,241,${(1 - distance / 120) * 0.08})`;
          ctx.stroke();
        }
      }
    }

    requestAnimationFrame(drawParticles);
  }

  drawParticles();
})();

// ═══════════════════════════════════════════════
// 2. TYPING ANIMATION
// ═══════════════════════════════════════════════
(function () {
  const lines = [
    { el: "typed-line1", text: "Compliance." },
    { el: "typed-line2", text: "Automated." },
    { el: "typed-line3", text: "Explained." }
  ];

  let lineIndex = 0;
  let charIndex = 0;
  const cursor = document.getElementById("cursor");

  function typeNext() {
    if (lineIndex >= lines.length) {
      if (cursor) cursor.style.display = "none";
      return;
    }

    const current = lines[lineIndex];
    const el = document.getElementById(current.el);
    if (!el) return;

    if (charIndex <= current.text.length) {
      el.textContent = current.text.slice(0, charIndex);
      charIndex++;
      setTimeout(typeNext, 60 + Math.random() * 40);
    } else {
      charIndex = 0;
      lineIndex++;
      setTimeout(typeNext, 300);
    }
  }

  setTimeout(typeNext, 800);
})();

// ═══════════════════════════════════════════════
// 3. SCROLL EFFECTS + COUNTERS
// ═══════════════════════════════════════════════
const fadeObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        fadeObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.12 }
);

document.querySelectorAll(".fade-in").forEach((el) => {
  fadeObserver.observe(el);
});

const counterObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;

      const el = entry.target;
      const target = parseInt(el.dataset.target || "0", 10);
      const suffix = el.dataset.suffix || "";
      const duration = 1500;
      let startTime = null;

      function animateCounter(timestamp) {
        if (!startTime) startTime = timestamp;
        const progress = Math.min((timestamp - startTime) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        el.textContent = Math.round(target * eased) + suffix;

        if (progress < 1) {
          requestAnimationFrame(animateCounter);
        }
      }

      requestAnimationFrame(animateCounter);
      counterObserver.unobserve(el);
    });
  },
  { threshold: 0.5 }
);

document.querySelectorAll(".counter").forEach((el) => {
  counterObserver.observe(el);
});

window.addEventListener("scroll", () => {
  const header = document.getElementById("site-header");
  if (header) {
    header.classList.toggle("scrolled", window.scrollY > 20);
  }

  document.querySelectorAll(".parallax-layer").forEach((el) => {
    const speed = parseFloat(el.dataset.speed || "0.05");
    el.style.transform = `translateY(${-window.scrollY * speed}px)`;
  });
});

// ═══════════════════════════════════════════════
// 4. DASHBOARD ROWS
// ═══════════════════════════════════════════════
(function () {
  const rows = [
    {
      ref: "ARF-2026-100421",
      company: "Meridian Holdings",
      risk: "LOW",
      riskColor: "#16a34a",
      score: 22,
      statuses: ["Approved", "Monitoring", "Approved"]
    },
    {
      ref: "ARF-2026-100422",
      company: "NovaPay Ltd",
      risk: "HIGH",
      riskColor: "#d97706",
      score: 68,
      statuses: ["Pre-Approval", "Under Review", "Pre-Approval"]
    },
    {
      ref: "ARF-2026-100423",
      company: "Atlas Ventures",
      risk: "MEDIUM",
      riskColor: "#2563eb",
      score: 41,
      statuses: ["KYC Review", "Compliance Review", "KYC Review"]
    },
    {
      ref: "ARF-2026-100424",
      company: "Zenith Capital",
      risk: "VERY HIGH",
      riskColor: "#dc2626",
      score: 82,
      statuses: ["Escalated", "EDD Required", "Escalated"]
    },
    {
      ref: "ARF-2026-100425",
      company: "Pacific Trade Co",
      risk: "LOW",
      riskColor: "#16a34a",
      score: 18,
      statuses: ["Approved", "Monitoring", "Approved"]
    }
  ];

  const container = document.getElementById("mockup-rows");
  if (!container) return;

  rows.forEach((row) => {
    const rowEl = document.createElement("div");
    rowEl.className = "mockup-row";
    rowEl.innerHTML = `
      <span class="mockup-ref">${row.ref}</span>
      <span class="mockup-company">${row.company}</span>
      <span>
        <span class="risk-badge" style="background:${row.riskColor}18;color:${row.riskColor}">
          ${row.risk}
        </span>
      </span>
      <span class="mockup-score">${row.score}</span>
      <span class="row-status" style="color:${row.riskColor};font-weight:500;font-size:12px">
        <span class="status-dot pulse" style="background:${row.riskColor}"></span>${row.statuses[0]}
      </span>
    `;
    container.appendChild(rowEl);
  });

  let statusIndex = 0;

  setInterval(() => {
    statusIndex = (statusIndex + 1) % 3;
    const statusEls = container.querySelectorAll(".row-status");

    statusEls.forEach((el, i) => {
      el.style.opacity = "0";
      el.style.transition = "opacity .3s";

      setTimeout(() => {
        el.innerHTML = `<span class="status-dot pulse" style="background:${rows[i].riskColor}"></span>${rows[i].statuses[statusIndex]}`;
        el.style.opacity = "1";
      }, 300);
    });
  }, 4000);
})();

// ═══════════════════════════════════════════════
// 5. PROOF BAR
// ═══════════════════════════════════════════════
(function () {
  const items = [
    "AML/CFT Compliant",
    "FATF Aligned",
    "Risk-Based Approach",
    "Regulator-Ready",
    "SOC 2 Architecture",
    "MFSA Aligned",
    "Audit Trail by Design",
    "PEP Screening",
    "Sanctions Monitoring"
  ];

  const track = document.getElementById("proof-track");
  if (!track) return;

  let html = "";

  for (let repeat = 0; repeat < 2; repeat++) {
    items.forEach((item) => {
      html += `
        <div class="proof-item">
          <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5"/>
          </svg>
          ${item}
        </div>
      `;
    });
  }

  track.innerHTML = html;
})();

// ═══════════════════════════════════════════════
// 6. PROBLEM CARDS
// ═══════════════════════════════════════════════
(function () {
  const problems = [
    {
      icon: `<svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>`,
      title: "Onboarding takes weeks",
      desc: "Manual forms, email chains, and spreadsheet tracking slow everything down."
    },
    {
      icon: `<svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"/></svg>`,
      title: "Compliance is manual",
      desc: "Officers spend hours on tasks that should take minutes. Review quality varies."
    },
    {
      icon: `<svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z"/></svg>`,
      title: "Scaling is painful",
      desc: "Adding clients means adding headcount. The process doesn’t scale."
    },
    {
      icon: `<svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"/><path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/></svg>`,
      title: "Audit trails are fragile",
      desc: "Scattered records across emails, drives, and legacy systems. Regulators aren’t impressed."
    }
  ];

  const grid = document.getElementById("problems-grid");
  if (!grid) return;

  problems.forEach((problem, index) => {
    const card = document.createElement("div");
    card.className = `fade-in d${index} feature-card`;
    card.innerHTML = `
      <div class="icon-box icon-box-red">${problem.icon}</div>
      <h3 class="heading-md" style="margin-bottom:8px">${problem.title}</h3>
      <p class="text-muted">${problem.desc}</p>
    `;
    grid.appendChild(card);
    fadeObserver.observe(card);
  });
})();

// ═══════════════════════════════════════════════
// 7. AI PIPELINE
// ═══════════════════════════════════════════════
(function () {
  const agents = [
    {
      agent: "Agent 1",
      task: "Entity & Ownership Analysis",
      status: "Complete",
      color: "#16a34a",
      bg: "rgba(22,163,74,.15)",
      time: "1.2s",
      pct: 100
    },
    {
      agent: "Agent 2",
      task: "Sanctions & PEP Screening",
      status: "Complete",
      color: "#16a34a",
      bg: "rgba(22,163,74,.15)",
      time: "2.4s",
      pct: 100
    },
    {
      agent: "Agent 3",
      task: "Adverse Media Scan",
      status: "Complete",
      color: "#16a34a",
      bg: "rgba(22,163,74,.15)",
      time: "3.1s",
      pct: 100
    },
    {
      agent: "Agent 4",
      task: "Document Verification",
      status: "Running",
      color: "#818cf8",
      bg: "rgba(99,102,241,.15)",
      time: "...",
      pct: 65,
      active: true
    },
    {
      agent: "Agent 5",
      task: "Compliance Memo Synthesis",
      status: "Queued",
      color: "rgba(255,255,255,.3)",
      bg: "rgba(255,255,255,.05)",
      time: "—",
      pct: 0
    }
  ];

  const container = document.getElementById("pipeline-container");
  if (!container) return;

  container.innerHTML = `<div class="pipeline-title">AI Agent Pipeline</div>`;

  agents.forEach((agent, index) => {
    const item = document.createElement("div");
    item.className = `pipeline-item${agent.active ? " active" : ""}`;

    item.innerHTML = `
      <div>
        <div class="pipeline-agent">${agent.agent}</div>
        <div class="pipeline-task">${agent.task}</div>
        <div class="pipeline-progress">
          <div class="pipeline-progress-fill" style="width:0;background:${agent.color}"></div>
        </div>
      </div>
      <div style="text-align:right">
        <div class="pipeline-status" style="background:${agent.bg};color:${agent.color}">
          ${agent.active ? `<span class="pipeline-status-dot" style="background:${agent.color}"></span>` : ""}
          ${agent.status}
        </div>
        <div class="pipeline-time">${agent.time}</div>
      </div>
    `;

    container.appendChild(item);

    const progressObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setTimeout(() => {
              const fill = item.querySelector(".pipeline-progress-fill");
              if (fill) fill.style.width = `${agent.pct}%`;
            }, 200 + index * 300);

            progressObserver.unobserve(item);
          }
        });
      },
      { threshold: 0.3 }
    );

    progressObserver.observe(item);
  });

  const activeItem = container.querySelectorAll(".pipeline-item")[3];
  const activeFill = activeItem ? activeItem.querySelector(".pipeline-progress-fill") : null;

  if (activeFill) {
    let direction = 1;
    let percent = 65;

    setInterval(() => {
      percent += direction * 2;
      if (percent >= 90) direction = -1;
      if (percent <= 55) direction = 1;
      activeFill.style.width = `${percent}%`;
    }, 200);
  }

  if (window.innerWidth <= 900) {
    const desktopPipeline = document.getElementById("pipeline-desktop");
    if (desktopPipeline) desktopPipeline.style.display = "none";
  }
})();

// ═══════════════════════════════════════════════
// 8. FEATURE CARDS
// ═══════════════════════════════════════════════
(function () {
  const icons = {
    brain: `<svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z"/></svg>`,
    doc: `<svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"/></svg>`,
    users: `<svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z"/></svg>`,
    search: `<svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"/></svg>`,
    clock: `<svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>`,
    eye: `<svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"/><path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/></svg>`
  };

  const features = [
    {
      icon: icons.brain,
      title: "AI Risk Scoring",
      desc: "Five-dimension weighted risk engine with explainable outputs. Every score has a clear rationale."
    },
    {
      icon: icons.doc,
      title: "KYC & Document Automation",
      desc: "Structured document collection with AI verification. Passport, PoA, certificates — validated automatically."
    },
    {
      icon: icons.users,
      title: "UBO & Structure Mapping",
      desc: "Multi-layer beneficial ownership analysis. Intermediary shareholders, PEP checks, ownership chains."
    },
    {
      icon: icons.search,
      title: "Screening & Adverse Media",
      desc: "Real-time sanctions, PEP, and adverse media screening against global watchlists."
    },
    {
      icon: icons.doc,
      title: "Compliance Memo Generation",
      desc: "AI-generated compliance memos synthesising all agent findings into a regulator-ready narrative."
    },
    {
      icon: icons.clock,
      title: "Ongoing Monitoring",
      desc: "Continuous client monitoring with periodic reviews, risk drift detection, and automated alerting."
    },
    {
      icon: icons.eye,
      title: "Audit Trail & Explainability",
      desc: "Every decision logged. Every AI output explained. Full agent decision trail for regulatory inspection."
    }
  ];

  const grid = document.getElementById("features-grid");
  if (!grid) return;

  features.forEach((feature, index) => {
    const card = document.createElement("div");
    card.className = `fade-in d${index % 3} feature-card`;
    card.innerHTML = `
      <div class="icon-box icon-box-indigo">${feature.icon}</div>
      <h3 style="font-size:16px;font-weight:700;margin-bottom:8px">${feature.title}</h3>
      <p class="text-muted">${feature.desc}</p>
    `;
    grid.appendChild(card);
    fadeObserver.observe(card);
  });
})();

// ═══════════════════════════════════════════════
// 9. WORKFLOW CARDS
// ═══════════════════════════════════════════════
(function () {
  const steps = [
    { number: "01", title: "Client Applies", sub: "Pre-screening data collected" },
    { number: "02", title: "AI Agents Run", sub: "5 agents score risk in parallel" },
    { number: "03", title: "Risk Routing", sub: "Low risk fast-tracked, high risk gated" },
    { number: "04", title: "Compliance Review", sub: "Officer reviews with full AI context" },
    { number: "05", title: "Decision", sub: "Approve, reject, or escalate" },
    { number: "06", title: "Monitoring", sub: "Ongoing surveillance activated" }
  ];

  const grid = document.getElementById("workflow-grid");
  if (!grid) return;

  steps.forEach((step, index) => {
    const card = document.createElement("div");
    card.className = `fade-in d${index % 3} workflow-card`;
    card.innerHTML = `
      <div class="workflow-num">${step.number}</div>
      <h3 class="workflow-title">${step.title}</h3>
      <p class="workflow-sub">${step.sub}</p>
    `;

    card.addEventListener("mousemove", (event) => {
      const rect = card.getBoundingClientRect();
      card.style.setProperty("--mx", `${((event.clientX - rect.left) / rect.width) * 100}%`);
      card.style.setProperty("--my", `${((event.clientY - rect.top) / rect.height) * 100}%`);
    });

    grid.appendChild(card);
    fadeObserver.observe(card);
  });
})();

// ═══════════════════════════════════════════════
// 10. MGMT FEATURES
// ═══════════════════════════════════════════════
(function () {
  const items = [
    {
      title: "Multi-client portfolio management",
      sub: "Centralised view across all entities with risk aggregation"
    },
    {
      title: "Automated periodic reviews",
      sub: "Risk-based review cycles — quarterly, semi-annual, or annual"
    },
    {
      title: "White-label ready",
      sub: "Deploy under your brand with configurable workflows"
    },
    {
      title: "Regulatory reporting",
      sub: "Pre-built reports for internal and regulator-ready review"
    }
  ];

  const container = document.getElementById("mgmt-features");
  if (!container) return;

  items.forEach((item) => {
    container.innerHTML += `
      <div class="detail-item">
        <div class="detail-icon">
          <svg viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5"/>
          </svg>
        </div>
        <div>
          <div style="font-size:15px;font-weight:600">${item.title}</div>
          <div style="font-size:13px;color:rgba(15,17,23,.45);margin-top:2px">${item.sub}</div>
        </div>
      </div>
    `;
  });
})();

// ═══════════════════════════════════════════════
// 11. DEMO + TRUST CARDS
// ═══════════════════════════════════════════════
(function () {
  const demos = [
    {
      tag: "CLIENT-FACING",
      title: "Client Portal",
      desc: "Clean, guided onboarding experience. Pre-screening, document upload, and real-time status tracking."
    },
    {
      tag: "OFFICER-FACING",
      title: "Back Office Dashboard",
      desc: "Full compliance workbench. Application queue, risk scoring, AI agent outputs, and decision tools."
    },
    {
      tag: "COMPLIANCE",
      title: "AI Explainability Layer",
      desc: "Every AI decision broken down. Agent-by-agent reasoning with confidence scores and evidence links."
    }
  ];

  const trust = [
    {
      icon: `<svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z"/></svg>`,
      title: "Regulator-ready workflows",
      desc: "Every workflow designed with regulatory defensibility in mind."
    },
    {
      icon: `<svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"/><path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/></svg>`,
      title: "Audit trail by design",
      desc: "Every action, every decision, every AI output — timestamped and inspection-ready."
    },
    {
      icon: `<svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z"/></svg>`,
      title: "No black-box decisions",
      desc: "See exactly why each risk score was assigned and what evidence was used."
    }
  ];

  const demoGrid = document.getElementById("demo-grid");
  const trustGrid = document.getElementById("trust-grid");

  if (demoGrid) {
    demos.forEach((demo, index) => {
      const card = document.createElement("div");
      card.className = `fade-in d${index} demo-card`;
      card.innerHTML = `
        <div class="demo-card-visual">
          <div class="demo-card-tag">${demo.tag}</div>
        </div>
        <div class="demo-card-body">
          <h3 style="font-size:18px;font-weight:700;margin-bottom:8px">${demo.title}</h3>
          <p class="text-muted">${demo.desc}</p>
        </div>
      `;
      demoGrid.appendChild(card);
      fadeObserver.observe(card);
    });
  }

  if (trustGrid) {
    trust.forEach((item, index) => {
      const card = document.createElement("div");
      card.className = `fade-in d${index} trust-card`;
      card.innerHTML = `
        <div class="icon-box icon-box-indigo icon-box-lg">${item.icon}</div>
        <h3 style="font-size:18px;font-weight:700;margin-bottom:10px">${item.title}</h3>
        <p class="text-muted">${item.desc}</p>
      `;
      trustGrid.appendChild(card);
      fadeObserver.observe(card);
    });
  }
})();

// ═══════════════════════════════════════════════
// 12. VALIDATION LOGIC + UPLOAD
// ═══════════════════════════════════════════════
(function () {
  const state = {
    files: [],
    validationVisible: false
  };

  const sampleText = `Certificate of Incorporation
Meridian Holdings Ltd
Registration Number: C18492
Date of Incorporation: 14 January 2021
Registered Address: 7 Harbour Street, Port Louis, Mauritius

Passport
Full Name: Ravi N. Sewchurn
Passport Number: MAU782134
Date of Birth: 03/09/1988
Nationality: Mauritian
Expiry Date: 11/05/2030

Utility Bill
Name: Ravi Sewchurn
Address: 7 Harbour Street, Port Louis, Mauritius
Issue Date: 04 February 2026

UBO Declaration
Ultimate Beneficial Owner: Ravi Sewchurn
Ownership: 82%
Source of Funds: Consulting income and retained earnings`;

  const sampleFiles = [
    { name: "certificate_of_incorporation.pdf", size: 482000, type: "application/pdf" },
    { name: "passport_ravi_sewchurn.jpg", size: 220000, type: "image/jpeg" },
    { name: "utility_bill_feb_2026.pdf", size: 315000, type: "application/pdf" },
    { name: "ubo_declaration.docx", size: 94000, type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document" }
  ];

  function byId(id) {
    return document.getElementById(id);
  }

  function formatBytes(bytes) {
    if (bytes === undefined || bytes === null) return "—";
    const units = ["B", "KB", "MB", "GB"];
    let i = 0;
    let n = bytes;
    while (n >= 1024 && i < units.length - 1) {
      n /= 1024;
      i++;
    }
    return `${n >= 10 || i === 0 ? Math.round(n) : n.toFixed(1)} ${units[i]}`;
  }

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function normalizeText(value) {
    return String(value || "").toLowerCase().replace(/[^a-z0-9]/g, "");
  }

  function extractField(pattern, text) {
    const match = text.match(pattern);
    return match ? match[1].trim() : "";
  }

  function confidenceBand(value, base) {
    if (!value) return Math.max(40, base - 35);
    return Math.min(99, base);
  }

  function setRing(percent) {
    const ring = byId("validation-ring");
    const text = byId("validation-ring-text");
    if (!ring || !text) return;

    const deg = Math.max(0, Math.min(100, percent)) * 3.6;
    ring.style.background = `conic-gradient(#6366f1 0deg, #6366f1 ${deg}deg, rgba(255,255,255,.08) ${deg}deg)`;
    text.textContent = `${percent}%`;
  }

  function renderFiles() {
    const wrap = byId("validation-files");
    const docs = byId("kpi-docs");
    if (!wrap || !docs) return;

    if (!state.files.length) {
      wrap.innerHTML = "";
      docs.textContent = "0";
      return;
    }

    wrap.innerHTML = state.files
      .map(
        (file) => `
          <div class="validation-file">
            <div>
              <strong>${escapeHtml(file.name)}</strong>
              <small>${escapeHtml(file.type || "unknown")} · ${formatBytes(file.size || 0)}</small>
            </div>
            <span class="validation-pill indigo">Loaded</span>
          </div>
        `
      )
      .join("");

    docs.textContent = String(state.files.length);
  }

  function buildResult() {
    const text = byId("validation-raw-text")?.value || "";
    const clientNameInput = byId("validation-client-name")?.value.trim() || "";
    const approveThreshold = Number(byId("validation-approve-threshold")?.value || 90);
    const reviewThreshold = Number(byId("validation-review-threshold")?.value || 80);

    const companyName =
      clientNameInput ||
      extractField(/(?:Certificate of Incorporation|Company|Entity Name)\s*[:\-]?\s*([A-Za-z0-9 .,&'-]+(?:Ltd|Limited|Inc|LLC)?)/i, text) ||
      extractField(/\n([A-Za-z][A-Za-z0-9 .,&'-]+(?:Ltd|Limited|Inc|LLC))\n/i, text);

    const regNumber = extractField(/Registration Number\s*[:\-]?\s*([A-Z0-9\-]+)/i, text);
    const incorporationDate = extractField(/Date of Incorporation\s*[:\-]?\s*([^\n]+)/i, text);
    const passportName = extractField(/Full Name\s*[:\-]?\s*([^\n]+)/i, text);
    const passportNumber = extractField(/Passport Number\s*[:\-]?\s*([A-Z0-9\-]+)/i, text);
    const dob = extractField(/Date of Birth\s*[:\-]?\s*([^\n]+)/i, text);
    const nationality = extractField(/Nationality\s*[:\-]?\s*([^\n]+)/i, text);
    const expiry = extractField(/Expiry Date\s*[:\-]?\s*([^\n]+)/i, text);
    const utilityName =
      extractField(/Utility Bill[\s\S]*?Name\s*[:\-]?\s*([^\n]+)/i, text) ||
      extractField(/Name\s*[:\-]?\s*([^\n]+)/i, text);
    const address = extractField(/(?:Registered Address|Address)\s*[:\-]?\s*([^\n]+)/i, text);
    const issueDate = extractField(/Issue Date\s*[:\-]?\s*([^\n]+)/i, text);
    const uboName = extractField(/Ultimate Beneficial Owner\s*[:\-]?\s*([^\n]+)/i, text);
    const ownership = extractField(/Ownership\s*[:\-]?\s*([^\n]+)/i, text);
    const sourceOfFunds = extractField(/Source of Funds\s*[:\-]?\s*([^\n]+)/i, text);

    const fields = [
      { field: "Company Name", value: companyName, source: "certificate_of_incorporation.pdf", confidence: confidenceBand(companyName, 95) },
      { field: "Registration Number", value: regNumber, source: "certificate_of_incorporation.pdf", confidence: confidenceBand(regNumber, 96) },
      { field: "Date of Incorporation", value: incorporationDate, source: "certificate_of_incorporation.pdf", confidence: confidenceBand(incorporationDate, 94) },
      { field: "Passport Holder Name", value: passportName, source: "passport.jpg", confidence: confidenceBand(passportName, 88) },
      { field: "Passport Number", value: passportNumber, source: "passport.jpg", confidence: confidenceBand(passportNumber, 91) },
      { field: "Date of Birth", value: dob, source: "passport.jpg", confidence: confidenceBand(dob, 87) },
      { field: "Nationality", value: nationality, source: "passport.jpg", confidence: confidenceBand(nationality, 89) },
      { field: "Passport Expiry", value: expiry, source: "passport.jpg", confidence: confidenceBand(expiry, 92) },
      { field: "Proof of Address Name", value: utilityName, source: "utility_bill.pdf", confidence: confidenceBand(utilityName, 79) },
      { field: "Registered / Residential Address", value: address, source: "utility_bill.pdf", confidence: confidenceBand(address, 93) },
      { field: "Proof of Address Issue Date", value: issueDate, source: "utility_bill.pdf", confidence: confidenceBand(issueDate, 84) },
      { field: "UBO Name", value: uboName, source: "ubo_declaration.docx", confidence: confidenceBand(uboName, 90) },
      { field: "Ownership %", value: ownership, source: "ubo_declaration.docx", confidence: confidenceBand(ownership, 90) },
      { field: "Source of Funds", value: sourceOfFunds, source: "ubo_declaration.docx", confidence: confidenceBand(sourceOfFunds, 86) }
    ].map((item) => ({
      ...item,
      status: item.value
        ? item.confidence >= approveThreshold
          ? "Verified"
          : item.confidence >= reviewThreshold
            ? "Needs Review"
            : "Weak"
        : "Missing"
    }));

    const issues = [];
    const checks = [];
    const timeline = [];

    timeline.push({ title: "Upload intake complete", body: `${state.files.length || 0} files staged for extraction.` });
    timeline.push({ title: "OCR / raw text loaded", body: text ? `Input contains ${text.length} characters of extracted text.` : "No OCR text provided. Output quality will be weak." });
    timeline.push({ title: "Field extraction finished", body: `${fields.filter((f) => f.value).length} of ${fields.length} fields returned a value.` });

    checks.push({
      title: "Document coverage",
      body: state.files.length >= 3
        ? "Enough supporting files were provided for a baseline onboarding review."
        : "Too few documents loaded. Coverage is below expected onboarding minimum."
    });

    checks.push({
      title: "Evidence traceability",
      body: fields.every((f) => f.source)
        ? "Every extracted field has a source reference."
        : "Some extracted fields do not show a clear origin file."
    });

    checks.push({
      title: "Confidence gating",
      body: `Fields below ${reviewThreshold}% are blocked from auto-approval. Fields between ${reviewThreshold}% and ${approveThreshold - 1}% are routed to review.`
    });

    const lowConfidenceFields = fields.filter((f) => f.confidence < reviewThreshold || !f.value);
    const reviewFields = fields.filter((f) => f.confidence >= reviewThreshold && f.confidence < approveThreshold);

    if (!text.trim()) {
      issues.push({
        title: "No OCR / extraction input provided",
        body: "The page cannot validate the AI output without raw extracted text.",
        severity: "red"
      });
    }

    if (!companyName) {
      issues.push({
        title: "Company name missing",
        body: "The certificate text did not return a reliable company name.",
        severity: "red"
      });
    }

    if (passportName && utilityName && normalizeText(passportName) !== normalizeText(utilityName)) {
      issues.push({
        title: "Name mismatch across documents",
        body: `Passport shows “${passportName}” while proof of address shows “${utilityName}”. This must be reviewed.`,
        severity: "orange"
      });
    }

    if (passportName && uboName && normalizeText(passportName) !== normalizeText(uboName)) {
      issues.push({
        title: "UBO identity mismatch",
        body: `Passport holder and UBO declaration do not perfectly match: “${passportName}” vs “${uboName}”.`,
        severity: "orange"
      });
    }

    if (!regNumber) {
      issues.push({
        title: "Registration number missing",
        body: "Corporate registration data is required for company onboarding.",
        severity: "red"
      });
    }

    if (!address) {
      issues.push({
        title: "Address not extracted",
        body: "Registered or residential address could not be confirmed from the files.",
        severity: "red"
      });
    }

    if (!issueDate) {
      issues.push({
        title: "Proof of address date missing",
        body: "The proof of address date could not be extracted, so freshness cannot be checked.",
        severity: "orange"
      });
    }

    if (lowConfidenceFields.length) {
      issues.push({
        title: "Low-confidence fields detected",
        body: `${lowConfidenceFields.length} extracted fields are below the review threshold or missing.`,
        severity: "orange"
      });
    }

    const baseConfidence =
      fields.reduce((sum, field) => sum + (field.value ? field.confidence : 35), 0) / fields.length;

    const penalty = issues.length * 4 + Math.max(0, 3 - state.files.length) * 5;
    const finalConfidence = Math.max(18, Math.min(99, Math.round(baseConfidence - penalty)));

    let decision = "Auto-Approve";
    let decisionSub = "Extraction quality is strong enough to move forward without manual review.";
    let chip = { text: "Approved path", cls: "green" };

    if (finalConfidence < reviewThreshold || issues.some((issue) => issue.severity === "red")) {
      decision = "Manual Review Required";
      decisionSub = "The validation layer blocked this onboarding pack because confidence or consistency is too weak.";
      chip = { text: "Review blocked", cls: "red" };
    } else if (finalConfidence < approveThreshold || reviewFields.length > 0 || issues.length > 0) {
      decision = "Needs Officer Review";
      decisionSub = "The extraction is usable, but one or more fields require confirmation before approval.";
      chip = { text: "Review queue", cls: "orange" };
    }

    timeline.push({ title: "Decision engine complete", body: `${decision} at ${finalConfidence}% confidence.` });

    return {
      finalConfidence,
      decision,
      decisionSub,
      chip,
      fields,
      issues,
      checks,
      timeline,
      issueCount: issues.length
    };
  }

  function renderResult(result) {
    setRing(result.finalConfidence);

    const decision = byId("validation-decision");
    const sub = byId("validation-sub");
    const pill = byId("validation-pill");
    const kpiFields = byId("kpi-fields");
    const kpiConfidence = byId("kpi-confidence");
    const kpiIssues = byId("kpi-issues");
    const fieldsBody = byId("validation-fields-body");
    const issuesList = byId("validation-issues-list");
    const checksList = byId("validation-checks-list");
    const timelineList = byId("validation-timeline-list");
    const banner = byId("validation-banner");

    if (decision) decision.textContent = result.decision;
    if (sub) sub.textContent = result.decisionSub;

    if (pill) {
      pill.className = `validation-pill ${result.chip.cls}`;
      pill.textContent = result.chip.text;
    }

    if (kpiFields) kpiFields.textContent = String(result.fields.filter((f) => f.value).length);
    if (kpiConfidence) kpiConfidence.textContent = `${result.finalConfidence}%`;
    if (kpiIssues) kpiIssues.textContent = String(result.issueCount);

    if (fieldsBody) {
      fieldsBody.innerHTML = result.fields
        .map((field) => {
          const cls =
            field.status === "Verified"
              ? "green"
              : field.status === "Needs Review"
                ? "orange"
                : "red";

          return `
            <tr>
              <td>${escapeHtml(field.field)}</td>
              <td>${field.value ? escapeHtml(field.value) : `<span style="color:rgba(255,255,255,.45)">Missing</span>`}</td>
              <td class="mono">${field.confidence}%</td>
              <td class="mono" style="color:rgba(255,255,255,.45)">${escapeHtml(field.source)}</td>
              <td><span class="validation-pill ${cls}">${escapeHtml(field.status)}</span></td>
            </tr>
          `;
        })
        .join("");
    }

    if (issuesList) {
      issuesList.innerHTML = result.issues.length
        ? result.issues
            .map(
              (issue) => `
                <div class="validation-card">
                  <div style="display:flex;justify-content:space-between;gap:12px;align-items:flex-start;margin-bottom:8px">
                    <h4>${escapeHtml(issue.title)}</h4>
                    <span class="validation-pill ${issue.severity === "red" ? "red" : "orange"}">
                      ${issue.severity === "red" ? "Critical" : "Review"}
                    </span>
                  </div>
                  <p>${escapeHtml(issue.body)}</p>
                </div>
              `
            )
            .join("")
        : `<div class="validation-card"><h4>No issues found</h4><p>The current document pack passed all validation checks.</p></div>`;
    }

    if (checksList) {
      checksList.innerHTML = result.checks
        .map(
          (check) => `
            <div class="validation-card">
              <h4>${escapeHtml(check.title)}</h4>
              <p>${escapeHtml(check.body)}</p>
            </div>
          `
        )
        .join("");
    }

    if (timelineList) {
      timelineList.innerHTML = result.timeline
        .map(
          (item, index) => `
            <div class="validation-card">
              <h4>${index + 1}. ${escapeHtml(item.title)}</h4>
              <p>${escapeHtml(item.body)}</p>
            </div>
          `
        )
        .join("");
    }

    if (banner) {
      if (result.decision !== "Auto-Approve") {
        banner.classList.add("show");
        banner.textContent =
          result.decision === "Manual Review Required"
            ? "Blocked from auto-onboarding. An officer must review the flagged fields before this pack can proceed."
            : "Routed to review queue. The pack is usable, but some fields need confirmation.";
      } else {
        banner.classList.remove("show");
        banner.textContent = "";
      }
    }
  }

  function resetValidation() {
    state.files = [];

    if (byId("validation-client-name")) byId("validation-client-name").value = "";
    if (byId("validation-entity-type")) byId("validation-entity-type").value = "Company";
    if (byId("validation-approve-threshold")) byId("validation-approve-threshold").value = "90";
    if (byId("validation-review-threshold")) byId("validation-review-threshold").value = "80";
    if (byId("validation-raw-text")) byId("validation-raw-text").value = "";
    if (byId("validation-file-input")) byId("validation-file-input").value = "";

    renderFiles();
    setRing(0);

    if (byId("validation-decision")) byId("validation-decision").textContent = "Awaiting analysis";
    if (byId("validation-sub")) {
      byId("validation-sub").textContent =
        "Upload documents, pass them through the backend, and validate extracted data with safer logic.";
    }
    if (byId("validation-pill")) {
      byId("validation-pill").className = "validation-pill indigo";
      byId("validation-pill").textContent = "No result yet";
    }
    if (byId("kpi-fields")) byId("kpi-fields").textContent = "0";
    if (byId("kpi-confidence")) byId("kpi-confidence").textContent = "0%";
    if (byId("kpi-issues")) byId("kpi-issues").textContent = "0";
    if (byId("validation-fields-body")) {
      byId("validation-fields-body").innerHTML =
        `<tr><td colspan="5" style="color:rgba(255,255,255,.45)">No analysis yet.</td></tr>`;
    }
    if (byId("validation-issues-list")) {
      byId("validation-issues-list").innerHTML =
        `<div class="validation-card"><h4>No issues yet</h4><p>Run analysis to detect weak fields, mismatches, and review blockers.</p></div>`;
    }
    if (byId("validation-checks-list")) {
      byId("validation-checks-list").innerHTML =
        `<div class="validation-card"><h4>No checks run</h4><p>The validation layer will score coverage, consistency, traceability, and approval readiness.</p></div>`;
    }
    if (byId("validation-timeline-list")) {
      byId("validation-timeline-list").innerHTML =
        `<div class="validation-card"><h4>No events yet</h4><p>Pipeline activity will appear here.</p></div>`;
    }
    if (byId("validation-banner")) {
      byId("validation-banner").classList.remove("show");
      byId("validation-banner").textContent = "";
    }
  }

  function loadSample() {
    state.files = sampleFiles.slice();
    if (byId("validation-client-name")) byId("validation-client-name").value = "Meridian Holdings Ltd";
    if (byId("validation-raw-text")) byId("validation-raw-text").value = sampleText;
    renderFiles();
    renderResult(buildResult());
  }

  function toggleValidationMode(event) {
    if (event) event.preventDefault();

    state.validationVisible = !state.validationVisible;

    const mockup = byId("hero-mode-mockup");
    const validation = byId("hero-mode-validation");
    const toggleBtn = byId("toggle-validation-btn");

    if (mockup) mockup.classList.toggle("hidden", state.validationVisible);
    if (validation) validation.classList.toggle("hidden", !state.validationVisible);
    if (toggleBtn) toggleBtn.textContent = state.validationVisible ? "Back to Platform Preview" : "Open Validation Demo";
  }

  async function uploadFilesToBackend() {
    const uploadBtn = byId("validation-upload-btn");
    const banner = byId("validation-banner");

    if (!state.files.length) {
      if (banner) {
        banner.classList.add("show");
        banner.textContent = "Select at least one document before uploading.";
      }
      return;
    }

    const formData = new FormData();
    state.files.forEach((file) => formData.append("files", file));

    if (uploadBtn) uploadBtn.textContent = "Uploading...";

    try {
      const response = await fetch("http://127.0.0.1:5000/upload", {
        method: "POST",
        body: formData
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Upload failed.");
      }

      if (banner) {
        banner.classList.add("show");
        banner.textContent = result.message || "Files uploaded successfully.";
      }
    } catch (error) {
      if (banner) {
        banner.classList.add("show");
        banner.textContent = `Upload failed: ${error.message}`;
      }
      console.error("Upload error:", error);
    } finally {
      if (uploadBtn) uploadBtn.textContent = "Upload to Backend";
    }
  }

  const fileInput = byId("validation-file-input");
  if (fileInput) {
    fileInput.addEventListener("change", (event) => {
      state.files = Array.from(event.target.files || []);
      renderFiles();
    });
  }

  const analyzeBtn = byId("validation-analyze-btn");
  if (analyzeBtn) {
    analyzeBtn.addEventListener("click", () => {
      renderResult(buildResult());
    });
  }

  const uploadBtn = byId("validation-upload-btn");
  if (uploadBtn) {
    uploadBtn.addEventListener("click", uploadFilesToBackend);
  }

  const sampleBtn = byId("validation-load-sample-btn");
  if (sampleBtn) {
    sampleBtn.addEventListener("click", loadSample);
  }

  const resetBtn = byId("validation-reset-btn");
  if (resetBtn) {
    resetBtn.addEventListener("click", resetValidation);
  }

  const toggleBtn = byId("toggle-validation-btn");
  if (toggleBtn) {
    toggleBtn.addEventListener("click", toggleValidationMode);
  }

  document.querySelectorAll(".validation-tab").forEach((tab) => {
    tab.addEventListener("click", () => {
      const target = tab.dataset.tab;

      document.querySelectorAll(".validation-tab").forEach((btn) => {
        btn.classList.remove("active");
      });

      document.querySelectorAll(".validation-panel").forEach((panel) => {
        panel.classList.remove("active");
      });

      tab.classList.add("active");
      const panel = byId(`validation-panel-${target}`);
      if (panel) panel.classList.add("active");
    });
  });

  resetValidation();
})();
