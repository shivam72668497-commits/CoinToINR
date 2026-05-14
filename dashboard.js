(async function () {
  const user = await window.requireAuth({ redirect: "login.html" });
  if (!user) return;

  await window.ensureUserRecord(user);

  const nameEl = document.getElementById("name");
  const emailEl = document.getElementById("email");
  const balanceEl = document.getElementById("balance");
  const earnedEl = document.getElementById("earned");
  const totalItemsEl = document.getElementById("totalItems");
  const recentList = document.getElementById("recentList");
  const logoutBtn = document.getElementById("logoutBtn");

  if (logoutBtn) {
    logoutBtn.addEventListener("click", async () => {
      await window.logout();
      window.location.replace("login.html");
    });
  }

  const userSnap = await window.db.ref(`users/${user.uid}`).get();
  const u = userSnap.val() || {};
  nameEl.textContent = u.name || user.displayName || "User";
  emailEl.textContent = u.email || user.email || "";

  function renderStats(items = []) {
    balanceEl.textContent = window.formatNumber(u.balance || 0);
    earnedEl.textContent = window.formatNumber(u.earned || 0);
    totalItemsEl.textContent = window.formatNumber(items.length);
  }

  function renderRecent(items = []) {
    if (!items.length) {
      recentList.innerHTML = '<div class="item"><p class="itemDesc">No live tasks or games yet. Admin additions will appear here automatically.</p></div>';
      return;
    }
    recentList.innerHTML = items.slice(0, 4).map(item => `
      <div class="item">
        <div class="itemTop">
          <div>
            <p class="itemTitle">${window.escapeHTML(item.title || "Untitled")}</p>
            <p class="itemDesc">${window.escapeHTML(item.description || item.subtitle || "")}</p>
          </div>
          <span class="pill ${item.type === "game" ? "orange" : "blue"}">${window.escapeHTML(item.type || "task")}</span>
        </div>
        <div class="pillRow">
          <span class="pill green">Reward: ${window.escapeHTML(item.reward || "0")}</span>
          <span class="pill">${window.escapeHTML(item.status || "active")}</span>
        </div>
      </div>
    `).join("");
  }

  window.db.ref("items").on("value", snap => {
    const obj = snap.val() || {};
    const items = Object.entries(obj)
      .map(([id, v]) => ({ id, ...v }))
      .filter(v => v.enabled !== false)
      .sort((a,b) => (b.createdAt || 0) - (a.createdAt || 0));

    renderStats(items);
    renderRecent(items);
  });
})();
