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
import { fadeInEffect, fadeOutEffect, smoothTextChange } from "./animation.js";
let incomingDbData = {};
let NoticeData = {};
const editToggleButton = document.querySelector("#editModeToggleButton");
let isEditing = false;
const addNoticeSlide = document.querySelector("#addContainerButton");
const loginToggleButton = document.querySelector("#loginToggleButton");
const subject = "ees";
const sem = "sem1";
const div = "div-A";

//checks if the user is logged in before if not it redirects to login.html to relogin
onAuthStateChanged(auth, (user) => {
  if (user) {
    console.log("user logged in");
    loginToggleButton.textContent = "Logout";
    editToggleButton.classList.remove("hidden");
  } else {
    window.location.href = "./login.html";
  }
});

//this toggles the login state
loginToggleButton.addEventListener("click", () => {
  if (loginToggleButton.textContent === "Logout") {
    signOut(auth)
      .then(() => {
        console.log("User logged out");
        window.location.href = "./login.html";
      })
      .catch((error) => {
        window.location.href = "error.html";
      });
  } else {
    window.location.href = "login.html";
  }
});

// fetches Database data
async function fetchDbdata() {
  const divRef = ref(database, `resources/${sem}/${div}`); //division data ref
  const commmonNoticeRef = ref(database, `resources/common/notice`); //global notice dbRef
  const divNoticeRef = ref(database, `resources/${sem}/${div}/notice`); //class specific notice dbRef

  await Promise.all([get(commmonNoticeRef), get(divNoticeRef)])
    .then(([commonSnapshot, divSnapshot]) => {
      let combinedData = {};

      if (commonSnapshot.exists()) {
        combinedData = { ...commonSnapshot.val() };
      }

      if (divSnapshot.exists()) {
        combinedData = { ...combinedData, ...divSnapshot.val() };
      }

      NoticeData = combinedData;
      createSwiperSlide();
    })
    .catch((error) => {
      console.error(error);
      window.location.href = "error.html";
    });
  await get(divRef)
    .then((snapshot) => {
      if (snapshot.exists()) {
        console.log(snapshot.val());
        incomingDbData = snapshot.val();
      } else {
        console.log("No data available");
      }
      fadeInEffect(document.body);
      document.querySelector("nav").classList.remove("hidden");
    })
    .catch((error) => {
      console.error(error);
      window.location.href = "error.html";
    });
}
fetchDbdata();

// creating and appending slides
function createSwiperSlide() {
  const swiperWrapper = document.querySelector(".swiper-wrapper");
  for (let key in NoticeData) {
    const obj = NoticeData[key];
    const swiperSlide = document.createElement("div");
    const card = document.createElement("div");
    const contentContainer = document.createElement("div");
    const iconTitleWrapper = document.createElement("div");
    const icon = document.createElement("img");
    const title = document.createElement("p");
    const contentDescription = document.createElement("p");
    const linkToNotice = document.createElement("a");
    const deleteNoticeIcon = document.createElement("i");
    const deleteNoticeIconWrapper = document.createElement("div");
    icon.className = "icon -translate-x-1 h-12";
    icon.src = "../assets/icons/black_bg _icons/notice.png";
    title.className = "title text-lg font-semibold";
    title.textContent = obj.title;
    deleteNoticeIcon.className =
      "fa-solid fa-trash  deleteContainerIcon  ml-2 text-xl";
    deleteNoticeIconWrapper.className = "hidden deleteNoticeIconWrapper";
    deleteNoticeIconWrapper.appendChild(deleteNoticeIcon);
    iconTitleWrapper.className = "icon-title-wrapper flex items-center gap-1";
    iconTitleWrapper.append(icon, title, deleteNoticeIconWrapper);
    contentDescription.className =
      "content-description-wrapper text-base font-medium";
    contentDescription.textContent = obj.description;
    linkToNotice.href = obj.link;
    linkToNotice.className = "anchor-link-button-wrapper mb-3 text-[#7EA1F4]";
    linkToNotice.textContent = "Read more";
    contentContainer.className =
      "content-container flex flex-col gap-2 text-white";
    contentContainer.append(iconTitleWrapper, contentDescription);
    if (obj.link) {
      contentContainer.append(linkToNotice);
    }
    card.className =
      "card min-h-[250px] rounded-3xl bg-[#171D2B] p-6 sm:min-h-[200px]";
    card.appendChild(contentContainer);
    swiperSlide.className = "swiper-slide w-auto max-w-[600px]";
    swiperSlide.appendChild(card);
    swiperWrapper.appendChild(swiperSlide);
    deleteNoticeIconWrapper.addEventListener("click", () => {
      console.log(key);
      deleteNotice(key);
    });
  }

  initilizeSwiper();
}
// swiper initilisation
function initilizeSwiper() {
  let swiper1 = new Swiper("#swiper-1", {
    direction: "horizontal",
    loop: true,
    centeredSlides: true,
    slidesPerView: 1.2,
    spaceBetween: 20,
    breakpoints: {
      768: {
        slidesPerView: "auto",
      },
    },

    pagination: {
      el: ".swiper-pagination",
      clickable: true,
    },
  });
}

// edit button click
editToggleButton.addEventListener("click", () => {
  document.querySelectorAll(".deleteNoticeIconWrapper").forEach((icon) => {
    icon.classList.toggle("hidden");
  });
  isEditing = !isEditing;
  console.log("ineditingmode");
  if (editToggleButton.textContent.trim() === "Edit") {
    smoothTextChange(editToggleButton, "Exit mode");
  } else if (editToggleButton.textContent.trim() === "Exit mode") {
    smoothTextChange(editToggleButton, "Edit");
  }
  if (addNoticeSlide.classList.contains("hidden")) {
    addNoticeSlide.classList.add("mt-1");
    fadeInEffect(addNoticeSlide);
  } else {
    fadeOutEffect(addNoticeSlide);
    addNoticeSlide.classList.remove("mt-1");
  }
  // addContainerButton.classList.toggle("hidden");
});

// CRUD operations functions of notice slides
// add notice
addNoticeSlide.addEventListener("click", () => {
  const saveButton = document.querySelector("#addNewNoticeForm .saveButton");
  const titleInput = document.querySelector("#addNewNoticeForm #title");
  const descriptionInput = document.querySelector(
    "#addNewNoticeForm #description",
  );
  let linkInput = document.querySelector("#addNewNoticeForm #link");
  const newNoticeSlide = document.querySelector("#addNewNoticeForm");
  const warningPopup = document.querySelector("#warningPopup");
  const warningPopupText = document.querySelector("#warningPopup p");
  const warningPopupSaveButton = document.querySelector(
    "#warningPopup .saveButton",
  );
  const warningPopupCancelButton = document.querySelector(
    "#warningPopup .CancelButton",
  );

  const cancelButton = document.querySelector(
    "#addNewNoticeForm .CancelButton",
  );
  const globalUploadCheckBox = document.querySelector(
    "#addNewNoticeForm .checkbox",
  );

  const errorMsg = document.querySelector("#addNewNoticeForm .errorMsg");
  fadeInEffect(newNoticeSlide);
  let newRef;

  globalUploadCheckBox.addEventListener("click", () => {
    if (globalUploadCheckBox.checked) {
      fadeInEffect(warningPopup);
    }
  });
  warningPopupSaveButton.addEventListener("click", () => {
    fadeOutEffect(warningPopup);
  });
  warningPopupCancelButton.addEventListener("click", () => {
    fadeOutEffect(warningPopup);
    globalUploadCheckBox.checked = false;
  });
  saveButton.addEventListener("click", () => {
    const title = titleInput.value;
    const description = descriptionInput.value;
    let link = null;
    let globalNoticeFlag = null;
    if (linkInput.value !== "") {
      link = linkInput.value;
    } else {
    }
    if (title.length >= 20) {
      errorMsg.textContent = "Name too long";
      errorMsg.classList.remove("hidden");
      return;
    }
    if (globalUploadCheckBox.checked) {
      globalNoticeFlag = true;
      newRef = push(ref(database, `resources/common/notice`));
    } else newRef = push(ref(database, `resources/${sem}/${div}/notice`));
    if (title !== "" && description !== "") {
      errorMsg.classList.add("hidden");
      set(newRef, {
        title: title,
        description: description,
        link: link,
        global: globalNoticeFlag,
      })
        .then(() => {
          console.log("New item added successfully!");
          fadeOutEffect(newNoticeSlide);
          location.reload();
        })
        .catch((error) => {
          console.error("Error adding new item:", error);
          window.location.href = "error.html";
        });
    } else {
      errorMsg.textContent = "Fill all the fields";
      errorMsg.classList.remove("hidden");
    }
  });
  cancelButton.addEventListener("click", () => {
    errorMsg.textContent = "Fill all the fields";
    errorMsg.classList.add("hidden");
    fadeOutEffect(newNoticeSlide);
  });
});
// delete notice
function deleteNotice(key) {
  fadeInEffect(warningPopup);
  const obj = NoticeData[key];
  const saveButton = document.querySelector("#warningPopup .saveButton");
  const CancelButton = document.querySelector("#warningPopup .CancelButton");
  let deleteRef = ref(database, `resources/${sem}/${div}/notice/${key}`);
  if (obj.global) {
    deleteRef = ref(database, `resources/common/notice/${key}`);
  }
  saveButton.addEventListener("click", () => {
    remove(deleteRef)
      .then(() => {
        fadeOutEffect(warningPopup);
        location.reload();
      })
      .catch((error) => {
        window.location.href = "error.html";
      });
  });
  CancelButton.addEventListener("click", () => {
    fadeOutEffect(warningPopup);
  });
}

//navigation bar start
const navLinks = document.querySelector(".links-container");
const navMenuIcon = document.querySelector(".menu-button-wrapper");
const subLink = document.querySelector(".sublink");
const subLinkToggleButton = document.querySelector(".sublink-toggle-button");
const updatePopupButton = document.querySelector(".updateShowBtn");
const popup = document.querySelector(".popup-container");
const cbutton = document.querySelector(".donate-btn");
navMenuIcon.addEventListener("click", () => {
  if (navLinks.style.maxHeight) {
    navLinks.style.maxHeight = null;

    navLinks.style.opacity = "0";
  } else {
    navLinks.style.maxHeight = "100vh";
    navLinks.style.opacity = "100";
  }
});

subLinkToggleButton.addEventListener("click", () => {
  if (window.innerWidth < 768) {
    if (subLink.style.maxHeight) {
      subLink.style.maxHeight = null;
      subLink.style.paddingTop = "0";
      subLink.style.opacity = "0";
    } else {
      subLink.style.maxHeight = "800px";
      subLink.style.paddingTop = "1.5rem";
      subLink.style.opacity = "100";
    }
  } else {
  }
});

//navigation bar end
