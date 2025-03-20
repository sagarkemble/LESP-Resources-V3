import {
  database,
  app,
  getDatabase,
  ref,
  set,
  get,
  push,
  update,
  onValue,
  remove,
  signOut,
  auth,
  onAuthStateChanged,
} from "./firebase.js";
import { fadeInEffect, fadeOutEffect } from "./animation.js";
const studentInfoForm = document.querySelector(".student-info-form");
const classInfoForm = document.querySelector(".class-info-form");
const classInfoFormBackButton = document.querySelector(
  ".class-info-form .back-button",
);
const emailAndPasswordForm = document.querySelector(".email-password-form");
const studentInfoNextButton = document.querySelector(
  ".student-info-form .next-button",
);
const classInfoNextButton = document.querySelector(
  ".class-info-form .next-button",
);
const emailAndPasswordFormNextButton = document.querySelector(
  ".email-password-form .next-button",
);
const emailAndPasswordFormBackButton = document.querySelector(
  ".email-password-form .back-button",
);
const dbRef = ref(database, `users`);
const accountCreatedPopup = document.querySelector(".accounted-created-popup");
let incomingDbData = {};
let localObj = {};
async function fetchDbData() {
  await get(dbRef)
    .then((snapshot) => {
      if (snapshot.exists()) {
        incomingDbData = snapshot.val();
      } else {
        console.log("No data available");
      }
      fadeInEffect(document.body);
    })
    .catch((error) => {
      console.error(error);
      window.location.href = "error.html";
    });
}
fetchDbData();
function lengthAndNumberCheck(str, length) {
  const regex = new RegExp(`^\\d{${length}}$`);
  return regex.test(str);
}

studentInfoNextButton.addEventListener("click", () => {
  const inputFirstName = document.querySelector(
    ".student-info-form .input-first-name",
  ).value;
  const inputLastName = document.querySelector(
    ".student-info-form .input-last-name",
  ).value;
  const inputEnrollment = document.querySelector(
    ".student-info-form .input-enrollment-no",
  ).value;
  const errorMsg = document.querySelector(".student-info-form  .invalid-msg");
  if (
    inputFirstName.trim() !== "" &&
    inputLastName.trim() !== "" &&
    inputEnrollment.trim() !== ""
  ) {
    if (!lengthAndNumberCheck(inputEnrollment, 11)) {
      errorMsg.textContent = "Enter valid enrollment";
      errorMsg.classList.remove("hidden");
      return;
    }
    for (let key in incomingDbData) {
      if (inputEnrollment === key) {
        errorMsg.textContent = "Enrollment-no Used";
        errorMsg.classList.remove("hidden");
        return;
      }
    }
    localObj["first-name"] = inputFirstName;
    localObj["last-name"] = inputLastName;
    localObj["enrollment"] = inputEnrollment;
    console.log(localObj);

    fadeOutEffect(studentInfoForm);
    setTimeout(() => {
      fadeInEffect(classInfoForm);
    }, 200);
  } else {
    errorMsg.textContent = "Fill all fields ";
    errorMsg.classList.remove("hidden");
    return;
  }
});
classInfoFormBackButton.addEventListener("click", () => {
  fadeOutEffect(classInfoForm);
  setTimeout(() => {
    fadeInEffect(studentInfoForm);
  }, 200);
});
classInfoNextButton.addEventListener("click", () => {
  const year = document.querySelector(".selected-year").value;
  const div = document.querySelector(".selected-div").value;
  const batch = document.querySelector(".selected-batch").value;
  const rollNo = document.querySelector(".input-roll-number").value;
  const errorMsg = document.querySelector(".class-info-form  .invalid-msg");
  if (
    rollNo.trim() !== "" &&
    div.trim() !== "" &&
    year.trim() !== "" &&
    batch.trim() !== ""
  ) {
    if (!lengthAndNumberCheck(rollNo, 6)) {
      errorMsg.textContent = "Enter valid Roll no";
      errorMsg.classList.remove("hidden");
      return;
    }
    for (let key in incomingDbData) {
      let obj = incomingDbData[key];
      if (obj.rollno === rollNo) {
        errorMsg.textContent = "Roll-no Used";
        errorMsg.classList.remove("hidden");
        return;
      }
    }
    localObj["rollno"] = rollNo;
    localObj["div"] = div;
    localObj["batch"] = batch;
    fadeOutEffect(classInfoForm);
    setTimeout(() => {
      fadeInEffect(emailAndPasswordForm);
    }, 200);
  } else {
    errorMsg.textContent = "Select all fields ";
    errorMsg.classList.remove("hidden");
    return;
  }
});
emailAndPasswordFormBackButton.addEventListener("click", () => {
  fadeOutEffect(emailAndPasswordForm);
  setTimeout(() => {
    fadeInEffect(classInfoForm);
  }, 200);
});
emailAndPasswordFormNextButton.addEventListener("click", () => {
  const email = document.querySelector(".input-email").value;
  const password = document.querySelector(".input-password").value;
  const reEnterPassword = document.querySelector(
    ".input-re-enter-password",
  ).value;
  const errorMsg = document.querySelector(".email-password-form .invalid-msg");
  if (
    email.trim() !== "" &&
    password.trim() !== "" &&
    reEnterPassword.trim() !== ""
  ) {
    if (!email.endsWith("@gmail.com")) {
      errorMsg.textContent = "include @gmail.com";
      errorMsg.classList.remove("hidden");
      return;
    }
    if (password != reEnterPassword) {
      errorMsg.textContent = "Passwords do not match";
      errorMsg.classList.remove("hidden");
      document.querySelector(".input-password").value = "";
      document.querySelector(".input-re-enter-password").value = "";
      return;
    }
    for (let key in incomingDbData) {
      let obj = incomingDbData[key];
      console.log(obj.email);
      console.log(email);

      if (obj.email === email) {
        errorMsg.textContent = "Email used";
        errorMsg.classList.remove("hidden");
        return;
      }
    }
    localObj["email"] = email;
    localObj["password"] = password;
    writeDataInDb();
  } else {
    errorMsg.textContent = "Select all fields ";
    errorMsg.classList.remove("hidden");
    return;
  }
});
function writeDataInDb() {
  const Ref = ref(database, `users/${localObj.enrollment}`);
  set(Ref, localObj)
    .then(() => {
      fadeInEffect(accountCreatedPopup);
    })
    .catch((error) => {
      // errorMsg.textContent = error;
      // errorMsg.classList.remove("hidden");
      console.log(error);
      window.location.href = "error.html";
    });
}
