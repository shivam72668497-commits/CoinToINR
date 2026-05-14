(function () {
  const form = document.getElementById("authForm");
  const loginBtn = document.getElementById("loginBtn");
  const googleBtn = document.getElementById("googleBtn");
  const signupBtn = document.getElementById("signupBtn");
  const logoutBtn = document.getElementById("logoutBtn");
  const togglePassword = document.getElementById("togglePassword");
  const password = document.getElementById("password");
  const eyeOpen = document.getElementById("eyeOpen");
  const eyeOff = document.getElementById("eyeOff");
  const rememberMe = document.getElementById("rememberMe");
  const nameInput = document.getElementById("name");
  const emailInput = document.getElementById("email");
  const resetBtn = document.getElementById("resetBtn");

  function hasAuthUI() {
    return !!(form || loginBtn || googleBtn || signupBtn);
  }

  function validEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email || "").trim());
  }

  async function configurePersistence() {
    if (!window.auth) return;
    try {
      await window.auth.setPersistence(
        rememberMe && rememberMe.checked
          ? firebase.auth.Auth.Persistence.LOCAL
          : firebase.auth.Auth.Persistence.SESSION
      );
    } catch (e) {
      console.warn("Persistence error", e);
    }
  }

  function setPasswordVisible(show) {
    if (!password || !togglePassword) return;
    password.type = show ? "text" : "password";
    eyeOpen && eyeOpen.classList.toggle("hidden", show);
    eyeOff && eyeOff.classList.toggle("hidden", !show);
    togglePassword.setAttribute("aria-pressed", String(show));
    togglePassword.setAttribute("aria-label", show ? "Hide password" : "Show password");
  }

  if (togglePassword && password) {
    togglePassword.addEventListener("click", () => setPasswordVisible(password.type === "password"));
  }

  async function initAuthGuard() {
    if (!window.FIREBASE_READY) {
      window.showToast("Paste Firebase config in firebaseconfig.js", "error");
      return;
    }
    if (!window.auth) return;
    window.auth.onAuthStateChanged(async (user) => {
      if (user && (location.pathname.endsWith("login.html") || location.pathname.endsWith("signup.html") || location.pathname.endsWith("admin/login.html"))) {
        if (window.ensureUserRecord) await window.ensureUserRecord(user);
        const target = location.pathname.includes("/admin/") ? "dashboard.html" : "dashboard.html";
        window.location.replace(target);
      }
    });
  }

  if (hasAuthUI()) {
    initAuthGuard();
  }

  if (form && location.pathname.endsWith("login.html")) {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      if (!window.FIREBASE_READY || !window.auth) return window.showToast("Paste Firebase config first.", "error");
      const email = (emailInput?.value || "").trim().toLowerCase();
      const pass = (password?.value || "").trim();

      if (!validEmail(email)) return window.showToast("Enter a valid email address.", "error");
      if (pass.length < 6) return window.showToast("Password must be at least 6 characters.", "error");

      try {
        await configurePersistence();
        window.setLoading(loginBtn, true, "Logging in...");
        const cred = await window.auth.signInWithEmailAndPassword(email, pass);
        if (cred?.user) {
          await window.ensureUserRecord(cred.user);
          window.showToast("Login successful. Redirecting...", "success");
          setTimeout(() => window.location.replace("dashboard.html"), 650);
        }
      } catch (err) {
        console.error(err);
        window.showToast(err.message || "Login failed.", "error");
      } finally {
        window.setLoading(loginBtn, false);
      }
    });
  }

  if (form && location.pathname.endsWith("signup.html")) {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      if (!window.FIREBASE_READY || !window.auth) return window.showToast("Paste Firebase config first.", "error");
      const name = (nameInput?.value || "").trim();
      const email = (emailInput?.value || "").trim().toLowerCase();
      const pass = (password?.value || "").trim();

      if (name.length < 2) return window.showToast("Enter your name.", "error");
      if (!validEmail(email)) return window.showToast("Enter a valid email address.", "error");
      if (pass.length < 6) return window.showToast("Password must be at least 6 characters.", "error");

      try {
        await configurePersistence();
        window.setLoading(signupBtn, true, "Creating...");
        const cred = await window.auth.createUserWithEmailAndPassword(email, pass);
        if (cred?.user) {
          await cred.user.updateProfile({ displayName: name });
          await window.db.ref(`users/${cred.user.uid}`).set({
            name,
            email,
            photoURL: cred.user.photoURL || "",
            balance: 0,
            earned: 0,
            joinedAt: Date.now(),
            status: "active",
            role: "user"
          });
          window.showToast("Account created successfully.", "success");
          setTimeout(() => window.location.replace("dashboard.html"), 650);
        }
      } catch (err) {
        console.error(err);
        window.showToast(err.message || "Signup failed.", "error");
      } finally {
        window.setLoading(signupBtn, false);
      }
    });
  }

  if (googleBtn) {
    googleBtn.addEventListener("click", async () => {
      if (!window.FIREBASE_READY || !window.auth) return window.showToast("Paste Firebase config first.", "error");
      try {
        await configurePersistence();
        window.setLoading(googleBtn, true, "Connecting...");
        const provider = new firebase.auth.GoogleAuthProvider();
        provider.setCustomParameters({ prompt: "select_account" });
        const result = await window.auth.signInWithPopup(provider);
        if (result?.user) {
          await window.ensureUserRecord(result.user);
          window.showToast("Google login successful.", "success");
          setTimeout(() => window.location.replace("dashboard.html"), 650);
        }
      } catch (err) {
        console.error(err);
        window.showToast(err.message || "Google sign-in failed.", "error");
      } finally {
        window.setLoading(googleBtn, false);
      }
    });
  }

  if (logoutBtn) {
    logoutBtn.addEventListener("click", async () => {
      await window.logout();
      window.location.replace("login.html");
    });
  }

  if (resetBtn) {
    resetBtn.addEventListener("click", async () => {
      const email = (emailInput?.value || "").trim().toLowerCase();
      if (!validEmail(email)) return window.showToast("Enter a valid email first.", "error");
      try {
        window.setLoading(resetBtn, true, "Sending...");
        await window.auth.sendPasswordResetEmail(email);
        window.showToast("Password reset email sent.", "success");
      } catch (e) {
        window.showToast(e.message || "Could not send reset email.", "error");
      } finally {
        window.setLoading(resetBtn, false);
      }
    });
  }
})();
