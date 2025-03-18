import { initializeApp } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-app.js";
import {
  getAuth,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut,
} from "https://www.gstatic.com/firebasejs/11.4.0/firebase-auth.js";
import {
  getDatabase,
  ref,
  set,
  get,
  onValue,
  update,
  remove,
} from "https://www.gstatic.com/firebasejs/11.4.0/firebase-database.js";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDMmNS2rcOyAZ5JLcuKX-dNCCl6uCLUAuQ",
  authDomain: "lesp-resources.firebaseapp.com",
  projectId: "lesp-resources",
  storageBucket: "lesp-resources.appspot.com",
  messagingSenderId: "152804379031",
  appId: "1:152804379031:web:03c67a880689436de11cd2",
  measurementId: "G-P3KBEVHXJ4",
};
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const database = getDatabase();
// firebaseConfig end
function isUserLoggedIn() {
  return new Promise((resolve, reject) => {
    onAuthStateChanged(auth, (user) => {
      if (user) {
        resolve("User is already logged in:");
      } else {
        reject("User not logged in");
      }
    });
  });
}

export {
  app,
  database,
  isUserLoggedIn,
  getDatabase,
  ref,
  set,
  get,
  update,
  onValue,
  remove,
  signOut,
  auth,
  signInWithEmailAndPassword,
};
