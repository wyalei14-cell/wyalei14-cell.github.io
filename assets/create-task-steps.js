const STEP_DEFS = [
  {
    title: "基础信息",
    desc: "任务类型、标题和交付说明",
    fields: ["type", "title", "description", "requirements", "plugin"],
  },
  {
    title: "分类与赏金",
    desc: "分类、代币、金额和人数",
    fields: ["category", "token", "bounty", "maxParticipants"],
  },
  {
    title: "时间与确认",
    desc: "开始结束时间和费用确认",
    fields: ["time", "payment", "submit"],
  },
];

const FIELD_TO_STEP = new Map(
  STEP_DEFS.flatMap((step, index) =>
    step.fields.map((field) => [field, index]),
  ),
);

let enhancedForm = null;
let activeStep = 0;
let createStepScheduled = false;

function createStepHeader() {
  const header = document.createElement("div");
  header.className = "create-stepper";
  header.setAttribute("aria-label", "发布任务步骤");

  STEP_DEFS.forEach((step, index) => {
    const item = document.createElement("div");
    item.className = "create-step";
    item.dataset.stepIndicator = String(index);
    item.innerHTML = `
      <span class="create-step-index">${index + 1}</span>
      <span class="create-step-copy">
        <span class="create-step-title">${step.title}</span>
        <span class="create-step-desc">${step.desc}</span>
      </span>
    `;
    header.appendChild(item);
  });

  return header;
}

function createPanel(index) {
  const panel = document.createElement("div");
  panel.className = "create-step-panel";
  panel.dataset.stepPanel = String(index);
  return panel;
}

function classifyFormChild(child) {
  if (child.classList.contains("task-type-selector")) return "type";
  if (child.classList.contains("submit-btn")) return "submit";
  if (child.classList.contains("form-summary")) return "payment";
  if (child.classList.contains("form-row")) return "time";
  return child.dataset.field || "";
}

function moveSubmitIntoActions(form, panel) {
  const submit = panel.querySelector(".submit-btn");
  if (!submit) return;

  const actions = document.createElement("div");
  actions.className = "create-step-actions";

  const prev = document.createElement("button");
  prev.type = "button";
  prev.className = "create-step-prev";
  prev.textContent = "上一步";
  prev.addEventListener("click", () => setStep(activeStep - 1));

  actions.append(prev, submit);
  panel.appendChild(actions);
}

function addNavigation(panel, index) {
  const actions = document.createElement("div");
  actions.className = "create-step-actions";

  if (index > 0) {
    const prev = document.createElement("button");
    prev.type = "button";
    prev.className = "create-step-prev";
    prev.textContent = "上一步";
    prev.addEventListener("click", () => setStep(index - 1));
    actions.appendChild(prev);
  }

  const next = document.createElement("button");
  next.type = "button";
  next.className = "create-step-next";
  next.textContent = "下一步";
  next.addEventListener("click", () => setStep(index + 1));
  actions.appendChild(next);

  panel.appendChild(actions);
}

function setStep(index) {
  activeStep = Math.max(0, Math.min(STEP_DEFS.length - 1, index));

  enhancedForm
    ?.querySelectorAll("[data-step-panel]")
    .forEach((panel) =>
      panel.classList.toggle(
        "is-active",
        Number(panel.dataset.stepPanel) === activeStep,
      ),
    );

  enhancedForm
    ?.querySelectorAll("[data-step-indicator]")
    .forEach((indicator) => {
      const itemStep = Number(indicator.dataset.stepIndicator);
      indicator.classList.toggle("is-active", itemStep === activeStep);
      indicator.classList.toggle("is-done", itemStep < activeStep);
    });

  enhancedForm?.scrollIntoView({ behavior: "smooth", block: "start" });
}

function stepForField(field) {
  if (FIELD_TO_STEP.has(field)) return FIELD_TO_STEP.get(field);
  return 0;
}

function revealFirstError() {
  if (!enhancedForm) return;
  const field = enhancedForm.querySelector(
    "[data-field].field-has-error, .form-summary.field-has-error",
  );
  if (!field) return;

  setStep(stepForField(field.dataset.field || "payment"));
  field.scrollIntoView({ behavior: "smooth", block: "center" });
}

function enhanceCreateTaskForm() {
  const form = document.querySelector(
    ".create-task .task-form:not(.stepper-enhanced)",
  );
  if (!form) return;

  enhancedForm = form;
  form.classList.add("stepper-enhanced");

  const header = createStepHeader();
  const panels = STEP_DEFS.map((_, index) => createPanel(index));
  const children = Array.from(form.children);

  form.append(header, ...panels);

  children.forEach((child) => {
    const field = classifyFormChild(child);
    const step = stepForField(field);
    panels[step].appendChild(child);
  });

  addNavigation(panels[0], 0);
  addNavigation(panels[1], 1);
  moveSubmitIntoActions(form, panels[2]);

  form.addEventListener("submit", () => setTimeout(revealFirstError, 80));
  setStep(0);
}

const observer = new MutationObserver(() => {
  if (!location.pathname.includes("/create") || createStepScheduled) return;
  createStepScheduled = true;
  requestAnimationFrame(() => {
    createStepScheduled = false;
    enhanceCreateTaskForm();
  });
});

observer.observe(document.documentElement, { childList: true, subtree: true });
window.addEventListener("popstate", enhanceCreateTaskForm);
window.addEventListener("hashchange", enhanceCreateTaskForm);
enhanceCreateTaskForm();
