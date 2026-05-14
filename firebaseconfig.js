/* Paste Firebase Config Here */
const firebaseConfig = {
  apiKey: "",
  authDomain: "",
  databaseURL: "",
  projectId: "",
  storageBucket: "",
  messagingSenderId: "",
  appId: ""
};

window.FIREBASE_READY = Boolean(
  firebaseConfig.apiKey &&
  firebaseConfig.authDomain &&
  firebaseConfig.databaseURL &&
  firebaseConfig.projectId &&
  firebaseConfig.storageBucket &&
  firebaseConfig.messagingSenderId &&
  firebaseConfig.appId
);

if (window.FIREBASE_READY && typeof firebase !== "undefined") {
  if (!firebase.apps.length) firebase.initializeApp(firebaseConfig);
}

window.auth = window.FIREBASE_READY ? firebase.auth() : null;
window.db = window.FIREBASE_READY ? firebase.database() : null;
window.storage = window.FIREBASE_READY && firebase.storage ? firebase.storage() : null;
