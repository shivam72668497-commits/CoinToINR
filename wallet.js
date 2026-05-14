(async function () {
  const user = await window.requireAuth({ redirect: "login.html" });
  if (!user) return;
  await window.ensureUserRecord(user);

  const nameEl = document.getElementById("name");
  const balanceEl = document.getElementById("balance");
  const earnedEl = document.getElementById("earned");
  const statusEl = document.getElementById("status");
  const logoutBtn = document.getElementById("logoutBtn");

  logoutBtn?.addEventListener("click", async () => {
    await window.logout();
    window.location.replace("login.html");
  });

  const snap = await window.db.ref(`users/${user.uid}`).get();
  const u = snap.val() || {};
  nameEl.textContent = u.name || user.displayName || "User";
  balanceEl.textContent = window.formatNumber(u.balance || 0);
  earnedEl.textContent = window.formatNumber(u.earned || 0);
  statusEl.textContent = u.status || "active";
})();
