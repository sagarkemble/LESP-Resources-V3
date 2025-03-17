import { initializeApp } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-app.js";
import {
  getAuth,
  signInWithEmailAndPassword,
  onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/11.4.0/firebase-auth.js";
import {
  getDatabase,
  ref,
  set,
  get,
  onValue,
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

onAuthStateChanged(auth, (user) => {
  if (user) {
    console.log("User is already logged in:", user);
    loginPopup.classList.remove("hidden");
    setTimeout(() => {
      window.location.href = "individual.html";
    }, 100);
  } else {
    console.log("User not logged in, showing login form");
  }
});

const inputEmail = document.querySelector("#input-email");
const inputPassword = document.querySelector("#input-password");
const loginPopup = document.querySelector(".login-popup");
const button = document.querySelector("#login-button");
const errmsg = document.querySelector(".invalid-msg");
button.addEventListener("click", () => {
  const inputEmailValue = inputEmail.value;
  const inputPasswordValue = inputPassword.value;
  console.log(inputEmailValue);
  console.log(inputPasswordValue);

  signInWithEmailAndPassword(auth, inputEmailValue, inputPasswordValue)
    .then((userCredential) => {
      const user = userCredential.user;
      console.log(user);
      loginPopup.classList.remove("hidden");
      setTimeout(() => {
        window.location.href = "individual.html";
      }, 100);
    })
    .catch((error) => {
      const errorCode = error.code;
      const errorMessage = error.message;
      errmsg.classList.remove("hidden");
      inputEmail.value = "";
      inputPassword.value = "";
    });
});
