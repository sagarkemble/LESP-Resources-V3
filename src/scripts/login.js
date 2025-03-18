import {
  signInWithEmailAndPassword,
  auth,
  onAuthStateChanged,
} from "./firebase.js";
import { fadeInEffect } from "./animation.js";
const inputEmail = document.querySelector("#input-email");
const inputPassword = document.querySelector("#input-password");
const loginPopup = document.querySelector(".login-popup");
const button = document.querySelector("#login-button");
const errmsg = document.querySelector(".invalid-msg");

window.addEventListener("load", function () {
  fadeInEffect(this.document.body);
});
onAuthStateChanged(auth, (user) => {
  if (user) {
    console.log(user);

    loginPopup.classList.remove("hidden");
    setTimeout(() => {
      window.location.href = "../html/subjectpage.html";
    }, 100);
  } else {
    console.log("Login in using email and password");
  }
});
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
        window.location.href = "../html/subjectpage.html";
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
