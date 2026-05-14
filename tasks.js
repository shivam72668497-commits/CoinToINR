(async function () {
  const user = await window.requireAuth({ redirect: "login.html" });
  if (!user) return;
  await window.ensureUserRecord(user);

  const list = document.getElementById("taskList");
  const tabs = document.querySelectorAll("[data-filter]");
  const search = document.getElementById("search");
  const logoutBtn = document.getElementById("logoutBtn");
  const countEl = document.getElementById("count");
  let currentFilter = "all";
  let allItems = [];

  logoutBtn?.addEventListener("click", async () => {
    await window.logout();
    window.location.replace("login.html");
  });

  function render(items) {
    const filtered = items.filter(item => {
      const typeMatch = currentFilter === "all" || (item.type || "task") === currentFilter;
      const text = `${item.title || ""} ${item.description || ""} ${item.subtitle || ""}`.toLowerCase();
      const searchMatch = !search.value.trim() || text.includes(search.value.trim().toLowerCase());
      return typeMatch && searchMatch;
    });

    countEl.textContent = window.formatNumber(filtered.length);
    if (!filtered.length) {
      list.innerHTML = '<div class="item"><p class="itemDesc">No items found. New tasks or games added by admin will appear here automatically.</p></div>';
      return;
    }

    list.innerHTML = filtered.map(item => `
      <article class="item">
        <div class="itemTop">
          <div style="display:flex;gap:12px;align-items:flex-start">
            <div class="preview" style="width:84px;height:84px;flex:0 0 auto">
              ${item.imageUrl ? `<img src="${window.escapeHTML(item.imageUrl)}" alt="${window.escapeHTML(item.title || 'Item')}">` : `<span>Preview</span>`}
            </div>
            <div>
              <p class="itemTitle">${window.escapeHTML(item.title || "Untitled")}</p>
              <p class="itemDesc">${window.escapeHTML(item.description || item.subtitle || "")}</p>
              <div class="pillRow">
                <span class="pill ${item.type === "game" ? "orange" : "blue"}">${window.escapeHTML(item.type || "task")}</span>
                <span class="pill green">Reward: ${window.escapeHTML(item.reward || "0")}</span>
                <span class="pill">${window.escapeHTML(item.status || "active")}</span>
              </div>
            </div>
          </div>
        </div>
        <div class="sep"></div>
        <div class="actions">
          ${item.actionUrl ? `<a class="secondary" href="${window.escapeHTML(item.actionUrl)}" target="_blank" rel="noopener" style="display:grid;place-items:center;text-decoration:none"><span class="btnText">${window.escapeHTML(item.buttonText || "Open")}</span></a>` : ""}
          <button class="ghost" type="button" data-copy="${window.escapeHTML(item.id)}">Copy ID</button>
        </div>
      </article>
    `).join("");

    list.querySelectorAll("[data-copy]").forEach(btn => {
      btn.addEventListener("click", async () => {
        await navigator.clipboard.writeText(btn.dataset.copy || "");
        window.showToast("Item ID copied.", "success");
      });
    });
  }

  tabs.forEach(btn => {
    btn.addEventListener("click", () => {
      tabs.forEach(x => x.classList.remove("active"));
      btn.classList.add("active");
      currentFilter = btn.dataset.filter;
      render(allItems);
    });
  });

  search?.addEventListener("input", () => render(allItems));

  window.db.ref("items").on("value", snap => {
    const obj = snap.val() || {};
    allItems = Object.entries(obj)
      .map(([id, v]) => ({ id, ...v }))
      .filter(v => v.enabled !== false)
      .sort((a,b) => (b.createdAt || 0) - (a.createdAt || 0));
    render(allItems);
  });
})();
