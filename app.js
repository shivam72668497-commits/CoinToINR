(function () {
  const toast = document.getElementById("toast");
  const toastMsg = document.getElementById("toastMsg");
  const toastBadge = document.getElementById("toastBadge");
  let toastTimer = null;

  function showToast(message, type = "info") {
    if (!toast || !toastMsg || !toastBadge) return;
    toast.className = `toast ${type} show`;
    toastMsg.textContent = message;
    toastBadge.textContent = type === "success" ? "✓" : type === "error" ? "!" : "i";
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove("show"), 2800);
  }

  function setLoading(btn, loading, textWhenLoading = "Loading...") {
    if (!btn) return;
    const t = btn.querySelector(".btnText");
    btn.disabled = !!loading;
    btn.classList.toggle("loading", !!loading);
    if (loading && t) {
      btn.dataset.oldText = t.textContent;
      t.textContent = textWhenLoading;
    } else if (!loading && t && btn.dataset.oldText) {
      t.textContent = btn.dataset.oldText;
    }
  }

  function escapeHTML(str = "") {
    return String(str)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function formatNumber(value) {
    const n = Number(value || 0);
    return Number.isFinite(n) ? n.toLocaleString() : "0";
  }

  function formatDate(ts) {
    if (!ts) return "-";
    const d = new Date(ts);
    return d.toLocaleString();
  }

  function requireAuth(options = {}) {
    if (!window.auth || !window.FIREBASE_READY) {
      showToast("Paste Firebase config first.", "error");
      return null;
    }
    return new Promise((resolve) => {
      window.auth.onAuthStateChanged(async (user) => {
        if (!user) {
          window.location.replace(options.redirect || "login.html");
          resolve(null);
          return;
        }
        resolve(user);
      });
    });
  }

  async function ensureUserRecord(user) {
    if (!window.db || !user) return;
    const ref = window.db.ref(`users/${user.uid}`);
    const snap = await ref.get();
    if (!snap.exists()) {
      await ref.set({
        name: user.displayName || "New User",
        email: user.email || "",
        photoURL: user.photoURL || "",
        balance: 0,
        earned: 0,
        joinedAt: Date.now(),
        status: "active",
        role: "user"
      });
    }
  }

  async function requireAdmin(redirect = "../login.html") {
    const user = await requireAuth({ redirect });
    if (!user || !window.db) return null;
    const snap = await window.db.ref(`admins/${user.uid}`).get();
    if (!snap.exists() || snap.val() !== true) {
      showToast("Admin access denied.", "error");
      setTimeout(() => window.location.replace(redirect), 900);
      return null;
    }
    return user;
  }

  function logout() {
    if (!window.auth) return;
    return window.auth.signOut();
  }

  window.showToast = showToast;
  window.setLoading = setLoading;
  window.escapeHTML = escapeHTML;
  window.formatNumber = formatNumber;
  window.formatDate = formatDate;
  window.requireAuth = requireAuth;
  window.ensureUserRecord = ensureUserRecord;
  window.requireAdmin = requireAdmin;
  window.logout = logout;
})();
