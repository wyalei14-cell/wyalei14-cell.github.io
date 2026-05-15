const text = (value) => value;

const HOME_COPY = {
  eyebrow: "NIUMA WORKS",
  title: "NIUMA WORKS",
  body: text(
    "\u8ba9\u4efb\u52a1\u53d1\u5e03\u3001\u5de5\u4f5c\u4ea4\u4ed8\u3001\u8d44\u91d1\u6258\u7ba1\u3001\u9a8c\u6536\u7ed3\u7b97\uff0c\u90fd\u5728 X Layer \u4e0a\u5b8c\u6210\u3002\u96c7\u4e3b\u53d1\u9700\u6c42\uff0c\u725b\u9a6c\u63a5\u4efb\u52a1\uff0c\u8d21\u732e\u88ab\u8bb0\u5f55\uff0c\u52b3\u52a8\u88ab\u7ed3\u7b97\u3002",
  ),
};

const FILTER_FIELDS = [
  "taskType",
  "status",
  "category",
  "token",
  "sort",
  "amount",
];

let scheduled = false;
let lastPath = "";

function currentPath() {
  return window.location.pathname || "/";
}

function setText(node, value) {
  if (node && node.textContent !== value) node.textContent = value;
}

function setRouteClass() {
  const path = currentPath();
  document.body.classList.toggle("route-home", path === "/");
  document.body.classList.toggle("route-tasks", path === "/tasks");
  document.body.classList.toggle("route-workspace", path === "/my-tasks");
  document.body.classList.toggle("route-profile", path === "/profile");
  if (path !== "/tasks") {
    document.body.classList.remove("sort-open", "filters-open");
  }
  if (path !== "/my-tasks") {
    document.body.classList.remove("workspace-messages-open");
  }
}

function attachEmbeddedAppStyle(iframe, styleId) {
  iframe.addEventListener("load", () => {
    try {
      const doc = iframe.contentDocument;
      if (!doc || doc.getElementById(styleId)) return;
      const style = doc.createElement("style");
      style.id = styleId;
      style.textContent = `
        html,
        body {
          background: transparent !important;
        }

        aside,
        .top-command,
        nav.mobile-bottom-nav {
          display: none !important;
        }

        .workspace,
        main {
          width: 100% !important;
          max-width: none !important;
          padding: 0 !important;
        }

        .messages-page > .page-header {
          display: none !important;
        }

        .messages-page {
          max-width: 980px !important;
          padding: 0.25rem 0 1.5rem !important;
        }

        .messages-page .conv-list {
          display: grid !important;
          gap: 0.55rem !important;
        }

        .messages-page .conv-item {
          display: grid !important;
          grid-template-columns: minmax(0, 1fr) auto !important;
          align-items: center !important;
          min-height: 84px !important;
          padding: 0.95rem 1rem !important;
          border-radius: 12px !important;
          background: #ffffff08 !important;
          border: 1px solid #e0cc991f !important;
          box-shadow: none !important;
          transition:
            background 0.18s ease,
            border-color 0.18s ease,
            transform 0.18s ease !important;
        }

        .messages-page .conv-item:hover {
          background: #79dacd0d !important;
          border-color: #79dacd42 !important;
          transform: translateY(-1px) !important;
        }

        .messages-page .conv-info {
          min-width: 0 !important;
        }

        .messages-page .conv-top,
        .messages-page .conv-bottom {
          display: flex !important;
          align-items: center !important;
          gap: 0.75rem !important;
        }

        .messages-page .conv-name,
        .messages-page .conv-preview {
          overflow: hidden !important;
          text-overflow: ellipsis !important;
          white-space: nowrap !important;
        }

        .messages-page .conv-name {
          color: #fff8e8 !important;
          font-size: 0.98rem !important;
          font-weight: 800 !important;
        }

        .messages-page .conv-preview,
        .messages-page .conv-time {
          color: #f5ead38f !important;
          font-size: 0.86rem !important;
        }

        .messages-page .conv-time {
          flex: none !important;
          margin-left: auto !important;
        }

        .messages-page .conv-task-link {
          max-width: 100% !important;
          color: #d6b45f !important;
          background: #d6b45f12 !important;
          border: 1px solid #d6b45f2e !important;
          border-radius: 999px !important;
          padding: 0.35rem 0.65rem !important;
          overflow: hidden !important;
          text-overflow: ellipsis !important;
          white-space: nowrap !important;
        }

        .messages-page .conv-badge {
          min-width: 1.45rem !important;
          height: 1.45rem !important;
          border-radius: 999px !important;
        }

        @media (width <= 700px) {
          .messages-page {
            padding: 0 !important;
          }

          .messages-page .conv-item {
            grid-template-columns: 1fr !important;
            min-height: 0 !important;
            padding: 0.85rem !important;
          }

          .messages-page .conv-task-link {
            margin-top: 0.55rem !important;
          }
        }
      `;
      doc.head.appendChild(style);
    } catch {
      // Same-origin iframe styling is best-effort.
    }
  });
}

function ensurePlatformShowcase() {
  if (currentPath() !== "/") return;
  const page = document.querySelector(".home.desk-page");
  const hero = page?.querySelector(".market-hero");
  if (!page || !hero) return;

  setText(hero.querySelector(".eyebrow"), HOME_COPY.eyebrow);
  setText(hero.querySelector(".hero-copy h1"), HOME_COPY.title);
  setText(hero.querySelector(".hero-copy p"), HOME_COPY.body);
  setText(hero.querySelector(".primary-action"), "\u53d1\u5e03\u4efb\u52a1");

  const secondary = hero.querySelector(".secondary-action");
  setText(secondary, "\u9886\u53d6\u4efb\u52a1");
  if (secondary && secondary.dataset.tasksLinkReady !== "1") {
    secondary.dataset.tasksLinkReady = "1";
    secondary.addEventListener("click", () => {
      window.location.href = "/tasks";
    });
  }

  const panel = hero.querySelector(".hero-panel");
  if (panel && panel.dataset.workflowReady !== "1") {
    panel.dataset.workflowReady = "1";
    panel.innerHTML = `
      <div class="home-flow-card">
        <h2>\u4efb\u52a1\u5982\u4f55\u6d41\u52a8</h2>
        <div class="home-flow-steps">
          <div><span>01</span><strong>\u96c7\u4e3b\u53d1\u5e03\u4efb\u52a1</strong></div>
          <i></i>
          <div><span>02</span><strong>\u5de5\u4eba\u63a5\u5355\u4ea4\u4ed8</strong></div>
          <i></i>
          <div><span>03</span><strong>\u5408\u7ea6\u6258\u7ba1\u8d44\u91d1</strong></div>
          <i></i>
          <div><span>04</span><strong>\u9a8c\u6536\u81ea\u52a8\u7ed3\u7b97</strong></div>
        </div>
      </div>
    `;
  }

  if (document.querySelector(".platform-showcase")) return;
  const section = document.createElement("section");
  section.className = "platform-showcase";
  section.innerHTML = `
    <section class="platform-stats" aria-label="\u5e73\u53f0\u6838\u5fc3\u6570\u636e">
      <article><strong>--</strong><span>Total Tasks</span><small>\u5df2\u53d1\u5e03\u4efb\u52a1</small></article>
      <article><strong>--</strong><span>Completed Orders</span><small>\u5df2\u5b8c\u6210\u8ba2\u5355</small></article>
      <article><strong>--</strong><span>Total Settlement</span><small>\u7d2f\u8ba1\u7ed3\u7b97\u91d1\u989d</small></article>
      <article><strong>--</strong><span>Active Workers</span><small>\u6d3b\u8dc3\u725b\u4eba</small></article>
      <article><strong>OKB / USDT / NIUMA</strong><span>Supported Assets</span><small>\u4e3b\u8981\u7ed3\u7b97\u8d44\u4ea7</small></article>
    </section>
    <section class="platform-section platform-modes">
      <div class="section-heading"><h2>\u628a Web3 \u7684\u534f\u4f5c\uff0c\u53d8\u6210\u771f\u5b9e\u7684\u5de5\u4f5c\u6d41</h2></div>
      <div class="mode-grid">
        <article><h3>\u666e\u901a\u6a21\u5f0f</h3><p>\u9002\u5408\u70b9\u8d5e\u3001\u8f6c\u63a8\u3001\u8bc4\u8bba\u3001\u6253\u5361\u3001\u6d4b\u8bd5\u53cd\u9988\u3001\u5185\u5bb9\u4f20\u64ad\u7b49\u8f7b\u91cf\u4efb\u52a1\u3002\u4f4e\u95e8\u69db\u53c2\u4e0e\uff0c\u5b8c\u6210\u540e\u6309\u89c4\u5219\u83b7\u5f97\u5956\u52b1\u3002</p></article>
        <article><h3>\u62db\u6807\u6a21\u5f0f</h3><p>\u96c7\u4e3b\u53d1\u5e03\u8bbe\u8ba1\u3001\u5f00\u53d1\u3001\u8fd0\u8425\u3001\u5185\u5bb9\u3001\u793e\u533a\u7ba1\u7406\u7b49\u9700\u6c42\u3002\u5de5\u4eba\u62a5\u540d\uff0c\u96c7\u4e3b\u7b5b\u9009\uff0c\u6309\u8ba2\u5355\u5b8c\u6210\u4ea4\u4ed8\u3002</p></article>
      </div>
    </section>
    <section class="platform-section platform-timeline">
      <div class="section-heading"><h2>\u4ece\u53d1\u5e03\u5230\u7ed3\u7b97\uff0c\u4e00\u6761\u6e05\u6670\u7684\u94fe\u4e0a\u6d41\u7a0b</h2></div>
      <div class="timeline-track">
        <article><span>01</span><h3>\u53d1\u5e03\u9700\u6c42</h3><p>\u586b\u5199\u4efb\u52a1\u5185\u5bb9\u3001\u9884\u7b97\u3001\u5468\u671f\u548c\u9a8c\u6536\u6807\u51c6</p></article>
        <article><span>02</span><h3>\u6258\u7ba1\u8d44\u91d1</h3><p>\u4efb\u52a1\u8d44\u91d1\u8fdb\u5165\u5408\u7ea6\u6258\u7ba1\uff0c\u964d\u4f4e\u4fe1\u4efb\u6210\u672c</p></article>
        <article><span>03</span><h3>\u63a5\u5355\u4ea4\u4ed8</h3><p>\u725b\u4eba\u5b8c\u6210\u4efb\u52a1\u5e76\u63d0\u4ea4\u7ed3\u679c</p></article>
        <article><span>04</span><h3>\u9a8c\u6536\u653e\u6b3e</h3><p>\u96c7\u4e3b\u786e\u8ba4\u540e\u91ca\u653e\u8d44\u91d1</p></article>
        <article><span>05</span><h3>\u8bb0\u5f55\u8d21\u732e</h3><p>\u4efb\u52a1\u7ed3\u679c\u3001\u8ba2\u5355\u8bc4\u4ef7\u3001\u8d21\u732e\u884c\u4e3a\u53ef\u6c89\u6dc0\u4e3a\u4e2a\u4eba\u4fe1\u7528</p></article>
      </div>
    </section>
    <section class="platform-section platform-why">
      <div class="section-heading"><h2>\u4e3a\u771f\u5b9e\u5efa\u8bbe\u8005\u8bbe\u8ba1\u7684\u5de5\u4f5c\u5e73\u53f0</h2></div>
      <div class="why-grid">
        <article><h3>\u516c\u5e73\u7ed3\u7b97</h3><p>\u4efb\u52a1\u89c4\u5219\u63d0\u524d\u786e\u8ba4\uff0c\u8d44\u91d1\u6258\u7ba1\u540e\u518d\u5f00\u59cb\u5de5\u4f5c\uff0c\u51cf\u5c11\u53e3\u5934\u627f\u8bfa\u548c\u626f\u76ae\u3002</p></article>
        <article><h3>\u8d21\u732e\u6c89\u6dc0</h3><p>\u6bcf\u4e00\u6b21\u4efb\u52a1\u3001\u4ea4\u4ed8\u3001\u8bc4\u4ef7\u90fd\u53ef\u4ee5\u6210\u4e3a\u4e2a\u4eba\u94fe\u4e0a\u4fe1\u7528\u7684\u4e00\u90e8\u5206\u3002</p></article>
        <article><h3>\u793e\u533a\u534f\u4f5c</h3><p>\u4e0d\u53ea\u662f\u63a5\u5355\u5e73\u53f0\uff0c\u4e5f\u662f\u793e\u533a\u7ec4\u7ec7\u4efb\u52a1\u3001\u5206\u914d\u6fc0\u52b1\u3001\u6c89\u6dc0\u4eba\u624d\u7684\u5de5\u5177\u3002</p></article>
        <article><h3>\u591a\u8d44\u4ea7\u7ed3\u7b97</h3><p>\u652f\u6301 OKB\u3001USDT\u3001NIUMA \u4f5c\u4e3a\u4e3b\u8981\u7ed3\u7b97\u8d44\u4ea7\uff0c\u8ba9\u793e\u533a\u4ee3\u5e01\u771f\u6b63\u8fdb\u5165\u4f7f\u7528\u573a\u666f\u3002</p></article>
      </div>
    </section>
  `;
  hero.insertAdjacentElement("afterend", section);
}

function ensureTasksLayout() {
  if (currentPath() !== "/tasks") return;
  const page = document.querySelector(".home.desk-page");
  const filter = page?.querySelector(".filter-dock");
  const board = page?.querySelector(".task-board");
  if (!page || !filter || !board) return;

  if (!document.querySelector(".tasks-hub-header")) {
    const header = document.createElement("section");
    header.className = "tasks-hub-header";
    header.innerHTML = `
      <div class="tasks-hub-header-inner">
        <span>TASKS</span>
        <h1>\u4efb\u52a1</h1>
        <p>\u6d4f\u89c8\u53ef\u9886\u53d6\u7684\u516c\u5f00\u4efb\u52a1\uff0c\u6309\u7c7b\u578b\u3001\u72b6\u6001\u3001\u8d44\u4ea7\u548c\u6392\u5e8f\u5feb\u901f\u7b5b\u9009\uff0c\u627e\u5230\u9002\u5408\u81ea\u5df1\u7684\u5de5\u4f5c\u3002</p>
      </div>
    `;
    page.insertAdjacentElement("beforebegin", header);
  }

  if (!document.querySelector(".tasks-mobile-toolbar")) {
    const toolbar = document.createElement("div");
    toolbar.className = "tasks-mobile-toolbar";
    toolbar.innerHTML = `
      <button type="button" data-task-sort>\u66f4\u6539\u6392\u5e8f</button>
      <button type="button" class="secondary" data-task-filter>\u7b5b\u9009\u4efb\u52a1</button>
    `;
    page.insertAdjacentElement("beforebegin", toolbar);
    toolbar.querySelector("[data-task-sort]").addEventListener("click", () => {
      document.body.classList.toggle("sort-open");
      document.body.classList.remove("filters-open");
    });
    toolbar
      .querySelector("[data-task-filter]")
      .addEventListener("click", () => {
        document.body.classList.toggle("filters-open");
        document.body.classList.remove("sort-open");
      });
  }

  if (!document.querySelector(".task-modal-backdrop")) {
    const backdrop = document.createElement("div");
    backdrop.className = "task-modal-backdrop";
    backdrop.addEventListener("click", () =>
      document.body.classList.remove("sort-open", "filters-open"),
    );
    document.body.appendChild(backdrop);
  }

  if (!page.querySelector(".tasks-layout")) {
    const layout = document.createElement("div");
    layout.className = "tasks-layout";
    filter.insertAdjacentElement("beforebegin", layout);
    layout.append(filter, board);
  }

  filter.querySelectorAll(".filter-grid > label").forEach((label, index) => {
    const field = FILTER_FIELDS[index] || `field-${index}`;
    if (label.dataset.filterField !== field) label.dataset.filterField = field;
  });
}

function ensureWorkspaceLayout() {
  if (currentPath() !== "/my-tasks") return;
  const main = document.querySelector(".main-content");
  const firstContent = main?.firstElementChild;
  if (!main || !firstContent) return;

  if (!document.querySelector(".workspace-hub-header")) {
    const header = document.createElement("section");
    header.className = "workspace-hub-header";
    header.innerHTML = `
      <div class="workspace-hub-header-inner">
        <span>WORKSPACE</span>
        <h1>\u5de5\u4f5c\u53f0</h1>
        <p>\u7ba1\u7406\u81ea\u5df1\u53d1\u5e03\u6216\u53c2\u4e0e\u7684\u4efb\u52a1\uff0c\u540c\u65f6\u5728\u8fd9\u91cc\u5904\u7406\u4efb\u52a1\u6d88\u606f\u548c\u79c1\u4fe1\u6c9f\u901a\u3002</p>
        <div class="workspace-page-tabs" role="tablist" aria-label="\u5de5\u4f5c\u53f0\u89c6\u56fe">
          <button type="button" data-workspace-tab="tasks" class="is-active">\u5de5\u4f5c\u53f0</button>
          <button type="button" data-workspace-tab="messages">\u6d88\u606f</button>
        </div>
      </div>
    `;
    main.insertBefore(header, firstContent);
  }

  const tabRoot = document.querySelector(".workspace-page-tabs");
  tabRoot?.querySelectorAll("[data-workspace-tab]").forEach((button) => {
    if (button.dataset.ready === "1") return;
    button.dataset.ready = "1";
    button.addEventListener("click", () => {
      const openMessages = button.dataset.workspaceTab === "messages";
      document.body.classList.toggle("workspace-messages-open", openMessages);
      tabRoot
        .querySelectorAll("[data-workspace-tab]")
        .forEach((item) => item.classList.toggle("is-active", item === button));
    });
  });

  if (!document.querySelector(".workspace-messages-panel")) {
    const panel = document.createElement("section");
    panel.className = "workspace-messages-panel";
    panel.innerHTML = `
      <iframe title="\u6d88\u606f" src="/messages" loading="lazy"></iframe>
    `;
    attachEmbeddedAppStyle(
      panel.querySelector("iframe"),
      "niuma-embedded-messages-style",
    );
    main.appendChild(panel);
  }
}

function setNavLink(link, target, label, textSelector, activePath) {
  link.setAttribute("href", target);
  link.dataset.navTarget = target;
  link.dataset.navReady = "1";
  setText(textSelector ? link.querySelector(textSelector) : link, label);
  link.classList.toggle("router-link-active", currentPath() === activePath);
  link.classList.toggle("active", currentPath() === activePath);

  if (link.dataset.navClickReady === "1") return;
  link.dataset.navClickReady = "1";
  link.addEventListener(
    "click",
    (event) => {
      const next = link.dataset.navTarget;
      if (!next) return;
      event.preventDefault();
      event.stopImmediatePropagation();
      if (currentPath() !== next) {
        window.location.href = next;
      }
    },
    true,
  );
}

function ensureDirectoryNavLinks() {
  document
    .querySelectorAll(
      '[data-tasks-directory-link="rail"], [data-tasks-directory-link="bottom"]',
    )
    .forEach((link) => link.remove());

  const railNav = document.querySelector("aside nav");
  const mobileDrawer = document.querySelector(".mobile-drawer");
  const bottomNav = document.querySelector("nav.mobile-bottom-nav");

  railNav
    ?.querySelectorAll('a[href="/my-tasks"]:not([data-workspace-nav="1"])')
    .forEach((link) => {
      link.dataset.tasksNav = "1";
      setNavLink(link, "/tasks", "\u4efb\u52a1", "span:last-child", "/tasks");
    });

  railNav?.querySelectorAll('a[href="/messages"]').forEach((link) => {
    link.dataset.workspaceNav = "1";
    setNavLink(
      link,
      "/my-tasks",
      "\u5de5\u4f5c\u53f0",
      "span:last-child",
      "/my-tasks",
    );
  });

  railNav?.querySelectorAll('[data-tasks-nav="1"]').forEach((link) => {
    setNavLink(link, "/tasks", "\u4efb\u52a1", "span:last-child", "/tasks");
  });

  railNav?.querySelectorAll('[data-workspace-nav="1"]').forEach((link) => {
    setNavLink(
      link,
      "/my-tasks",
      "\u5de5\u4f5c\u53f0",
      "span:last-child",
      "/my-tasks",
    );
  });

  mobileDrawer
    ?.querySelectorAll('a[href="/my-tasks"]:not([data-workspace-nav="1"])')
    .forEach((link) => {
      link.dataset.tasksNav = "1";
      setNavLink(link, "/tasks", "\u4efb\u52a1", null, "/tasks");
    });

  mobileDrawer?.querySelectorAll('a[href="/messages"]').forEach((link) => {
    link.dataset.workspaceNav = "1";
    setNavLink(link, "/my-tasks", "\u5de5\u4f5c\u53f0", null, "/my-tasks");
  });

  mobileDrawer?.querySelectorAll('[data-tasks-nav="1"]').forEach((link) => {
    setNavLink(link, "/tasks", "\u4efb\u52a1", null, "/tasks");
  });

  mobileDrawer?.querySelectorAll('[data-workspace-nav="1"]').forEach((link) => {
    setNavLink(link, "/my-tasks", "\u5de5\u4f5c\u53f0", null, "/my-tasks");
  });

  bottomNav
    ?.querySelectorAll('a[href="/my-tasks"]:not([data-workspace-nav="1"])')
    .forEach((link) => {
      link.dataset.tasksNav = "1";
      setNavLink(link, "/tasks", "\u4efb\u52a1", "small", "/tasks");
    });

  bottomNav?.querySelectorAll('a[href="/messages"]').forEach((link) => {
    link.dataset.workspaceNav = "1";
    setNavLink(link, "/my-tasks", "\u5de5\u4f5c\u53f0", "small", "/my-tasks");
  });

  bottomNav?.querySelectorAll('[data-tasks-nav="1"]').forEach((link) => {
    setNavLink(link, "/tasks", "\u4efb\u52a1", "small", "/tasks");
  });

  bottomNav?.querySelectorAll('[data-workspace-nav="1"]').forEach((link) => {
    setNavLink(link, "/my-tasks", "\u5de5\u4f5c\u53f0", "small", "/my-tasks");
  });
}

function cleanupRouteArtifacts(path) {
  if (path === "/") {
    document.querySelector(".tasks-hub-header")?.remove();
    document.querySelector(".tasks-mobile-toolbar")?.remove();
    document.querySelector(".task-modal-backdrop")?.remove();
    document.querySelector(".workspace-hub-header")?.remove();
    document.querySelector(".workspace-messages-panel")?.remove();
    document.body.classList.remove("workspace-messages-open");
  } else if (path === "/tasks") {
    document.querySelector(".platform-showcase")?.remove();
    document.querySelector(".workspace-hub-header")?.remove();
    document.querySelector(".workspace-messages-panel")?.remove();
  } else if (path === "/my-tasks") {
    document.querySelector(".platform-showcase")?.remove();
    document.querySelector(".tasks-hub-header")?.remove();
    document.querySelector(".tasks-mobile-toolbar")?.remove();
    document.querySelector(".task-modal-backdrop")?.remove();
  } else {
    document.querySelector(".platform-showcase")?.remove();
    document.querySelector(".tasks-hub-header")?.remove();
    document.querySelector(".tasks-mobile-toolbar")?.remove();
    document.querySelector(".task-modal-backdrop")?.remove();
    document.querySelector(".workspace-hub-header")?.remove();
    document.querySelector(".workspace-messages-panel")?.remove();
    document.body.classList.remove("sort-open", "filters-open");
    document.body.classList.remove("workspace-messages-open");
  }
}

function enhanceNow() {
  scheduled = false;
  const path = currentPath();
  setRouteClass();
  if (path !== lastPath) {
    cleanupRouteArtifacts(path);
    lastPath = path;
  }
  ensurePlatformShowcase();
  ensureTasksLayout();
  ensureWorkspaceLayout();
  ensureDirectoryNavLinks();
}

function scheduleEnhance() {
  if (scheduled) return;
  scheduled = true;
  requestAnimationFrame(enhanceNow);
}

const originalPushState = history.pushState;
history.pushState = function (...args) {
  const result = originalPushState.apply(this, args);
  scheduleEnhance();
  return result;
};

const originalReplaceState = history.replaceState;
history.replaceState = function (...args) {
  const result = originalReplaceState.apply(this, args);
  scheduleEnhance();
  return result;
};

window.addEventListener("popstate", scheduleEnhance);
new MutationObserver(scheduleEnhance).observe(document.body, {
  childList: true,
  subtree: true,
});
scheduleEnhance();
