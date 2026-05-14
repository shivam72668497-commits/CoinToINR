(async function () {
  const user = await window.requireAuth({ redirect: "login.html" });
  if (!user) return;
  await window.ensureUserRecord(user);

  const nameEl = document.getElementById("name");
  const emailEl = document.getElementById("email");
  const uidEl = document.getElementById("uid");
  const joinedEl = document.getElementById("joined");
  const logoutBtn = document.getElementById("logoutBtn");
  const photoEl = document.getElementById("photo");

  logoutBtn?.addEventListener("click", async () => {
    await window.logout();
    window.location.replace("login.html");
  });

  const snap = await window.db.ref(`users/${user.uid}`).get();
  const u = snap.val() || {};

  nameEl.textContent = u.name || user.displayName || "User";
  emailEl.textContent = u.email || user.email || "";
  uidEl.textContent = user.uid;
  joinedEl.textContent = window.formatDate(u.joinedAt || Date.now());

  if (photoEl && (u.photoURL || user.photoURL)) {
    photoEl.src = u.photoURL || user.photoURL;
  }
})();
