import {
  database,
  app,
  getDatabase,
  ref,
  set,
  get,
  update,
  onValue,
  remove,
  signOut,
  auth,
  onAuthStateChanged,
} from "./firebase.js";
import { fadeInEffect, fadeOutEffect, smoothTextChange } from "./animation.js";

// variables
const updateSection = document.querySelector(".content-description-wrapper");
const addUpdateButton = document.querySelector(".add-content-button-wrapper");
const loginToggleButton = document.querySelector("#loginToggleButton");
const containerWrapper = document.querySelector(".containerWrapper");
const editModeToggleButton = document.querySelector("#editModeToggleButton");
const addContainerButton = document.querySelector("#addContainerButton");
const editItemPopup = document.querySelector("#editItemPopup");
const addItemPopup = document.querySelector("#addNewItemPopup");
const warningPopup = document.querySelector("#warningPopup");
const deleteItemButton = document.querySelector("#deleteItemButton");
const addContainerPopup = document.querySelector("#addContainerPopup");
let isDeleteContainerFlag = false;
const subject = "ees";
const sem = "sem1";
const div = "div-A";
const dbRef = ref(database, `resources/${sem}/${div}/${subject}`);
let incomingDbData = {};
let currentEditingData = {};
let isEditing = false;

//checks if the user is logged in before if not it redirects to login.html to relogin
onAuthStateChanged(auth, (user) => {
  if (user) {
    console.log("user logged in");
    loginToggleButton.textContent = "Logout";
    editModeToggleButton.classList.remove("hidden");
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
        location.reload();
      })
      .catch((error) => {
        window.location.href = "error.html";
      });
  } else {
    window.location.href = "index.html";
  }
});

// fetches Database data
async function fetchDbData() {
  await get(dbRef)
    .then((snapshot) => {
      if (snapshot.exists()) {
        console.log(snapshot.val());
        incomingDbData = snapshot.val();
        loadUpdates();
        createWrapper();
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
fetchDbData();

async function reloadDataDb() {
  await get(dbRef)
    .then((snapshot) => {
      if (snapshot.exists()) {
        console.log(snapshot.val());
        containerWrapper.innerHTML = "";
        incomingDbData = snapshot.val();
        createWrapper();
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

//loads the content in updates section
function loadUpdates() {
  for (let key in incomingDbData.updates) {
    let update = incomingDbData.updates[key];
    const wrapper = document.createElement("div");
    const deleteUpdateIconWrapper = document.createElement("div");
    const deleteUpdateIcon = document.createElement("i");
    wrapper.className = "flex gap-3 items-center";
    deleteUpdateIconWrapper.className =
      "hidden flex item-center  deleteUpdateIconWrapper";
    deleteUpdateIcon.className = "fa-solid fa-trash  text-base";
    deleteUpdateIconWrapper.appendChild(deleteUpdateIcon);
    const description = document.createElement("p");
    description.textContent = update.description;
    wrapper.appendChild(description);
    wrapper.appendChild(deleteUpdateIconWrapper);
    updateSection.appendChild(wrapper);
    deleteUpdateIconWrapper.addEventListener("click", () => {
      deleteUpdate(key);
    });
  }
}
//creates card container
function createWrapper() {
  for (let key in incomingDbData) {
    if (key == "updates") {
      continue;
    }
    const wrapper = document.createElement("div");
    const deleteContainerIcon = document.createElement("i");
    const title = document.createElement("p");
    const subWrapper = document.createElement("div");
    const addElementIcon = document.createElement("i");
    const parentContainerName = key;
    const cardContainer = document.createElement("div");
    const iconsWrapper = document.createElement("div");
    wrapper.className =
      "my-3 mb-6 flex flex-col px-3 text-base font-semibold text-white ";
    iconsWrapper.className = "iconsWrapper hidden flex gap-2 flex  w-full";
    addElementIcon.className = "fa-solid fa-plus  addElementIcon ";
    deleteContainerIcon.className =
      "fa-solid fa-trash  deleteContainerIcon ml-auto mr-2 text-xl";
    subWrapper.className =
      "title mb-3 text-2xl font-bold flex items-center gap-2 w-full";
    title.textContent = incomingDbData[key].name;
    cardContainer.className = "grid-auto-fit";
    subWrapper.appendChild(title);
    subWrapper.appendChild(iconsWrapper);
    iconsWrapper.appendChild(addElementIcon);
    iconsWrapper.appendChild(deleteContainerIcon);
    wrapper.appendChild(subWrapper);
    wrapper.appendChild(cardContainer);
    containerWrapper.appendChild(wrapper);
    addElementIcon.addEventListener("click", (event) => {
      event.preventDefault();
      addCard(key);
    });
    deleteContainerIcon.addEventListener("click", () => {
      deleteContainer(key);
    });
    if (isEditing) {
      iconsWrapper.classList.remove("hidden");
    }
    createCard(incomingDbData[key], cardContainer, parentContainerName);
  }
}

//creates cards and appeds in card container
function createCard(obj, container, parentContainerName) {
  // if (!container) return;
  // if (!obj || typeof obj !== "object") return;

  for (let subKey in obj) {
    const item = obj[subKey];

    if (typeof item === "object" && item.link && item.name) {
      const link = document.createElement("a");
      link.href = item.link;
      link.target = "_blank"; // Open in new tab

      const card = document.createElement("div");
      card.className =
        "assignment-card click-effect md:hover-effect flex cursor-pointer justify-center rounded-2xl bg-[#171D2B] py-4 px-6";

      const nameDiv = document.createElement("div");
      nameDiv.textContent = item.name;

      card.appendChild(nameDiv);
      link.appendChild(card);
      container.appendChild(link);
      link.addEventListener("click", (event) => {
        if (isEditing) {
          event.preventDefault();
          event.stopPropagation();
          currentEditingData = {
            parentContainerKey: parentContainerName,
            key: subKey,
            link: item.link,
            name: item.name,
          };
          editCard(item.name, item.link);
        }
      });
      deleteItemButton.addEventListener("click", () => {
        deleteCard();
      });
    }
  }
}

editModeToggleButton.addEventListener("click", () => {
  document.querySelectorAll(".deleteUpdateIconWrapper").forEach((icon) => {
    icon.classList.toggle("hidden");
  });
  addUpdateButton.classList.toggle("hidden");
  const editIcons = document.querySelectorAll(".iconsWrapper");
  editIcons.forEach((icon) => {
    icon.classList.toggle("hidden");
  });
  isEditing = !isEditing;
  console.log("ineditingmode");
  if (editModeToggleButton.textContent.trim() === "Edit") {
    smoothTextChange(editModeToggleButton, "Exit mode");
  } else if (editModeToggleButton.textContent.trim() === "Exit mode") {
    smoothTextChange(editModeToggleButton, "Edit");
  }
  if (addContainerButton.classList.contains("hidden")) {
    addContainerButton.classList.add("mt-3");
    fadeInEffect(addContainerButton);
  } else {
    fadeOutEffect(addContainerButton);
    addContainerButton.classList.remove("mt-3");
  }
  // addContainerButton.classList.toggle("hidden");
});

// CRUD operation functions of update section
// adds updates in update section
addUpdateButton.addEventListener("click", () => {
  const addupdatePopup = document.querySelector("#udpateSectionForm");
  const saveButton = document.querySelector("#udpateSectionForm .save-button");
  const CancelButton = document.querySelector(
    "#udpateSectionForm .cancel-button",
  );
  const updateDescription = document.querySelector("#updateDescription");
  const errorMsg = document.querySelector("#udpateSectionForm .error-msg");
  const now = new Date();
  const dateWithTime = `${now.toLocaleDateString("en-US", { month: "long", day: "numeric" })} ${now.toTimeString().slice(0, 5)}`;
  fadeInEffect(addupdatePopup);
  saveButton.addEventListener("click", () => {
    if (updateDescription.value.trim() !== "") {
      errorMsg.classList.add("hidden");
      const newRef = ref(
        database,
        `resources/${sem}/${div}/${subject}/updates/${dateWithTime}`,
      );

      set(newRef, { description: updateDescription.value })
        .then(() => {
          console.log("New item added successfully!");
          fadeOutEffect(addupdatePopup);

          location.reload();
        })
        .catch((error) => {
          window.location.href = "error.html";
        });
    } else {
      errorMsg.textContent = "Fill all the fields";
      errorMsg.classList.remove("hidden");
    }
  });
  CancelButton.addEventListener("click", () => {
    updateDescription.value = "";
    errorMsg.classList.add("hidden");
    fadeOutEffect(addupdatePopup);
  });
});

// deletes updates in update section
function deleteUpdate(obj) {
  fadeInEffect(warningPopup);
  const saveButton = document.querySelector("#warningPopup .save-button");
  const CancelButton = document.querySelector("#warningPopup .cancel-button");

  saveButton.addEventListener("click", () => {
    let deleteRef = ref(
      database,
      `resources/${sem}/${div}/${subject}/updates/${obj}`,
    );

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

// CRUD operation functions of card container
// adds container
addContainerButton.addEventListener("click", () => {
  const saveButton = document.querySelector("#addContainerPopup .save-button");
  const newContainerName = document.querySelector("#newContainerName");
  const CancelButton = document.querySelector(
    "#addContainerPopup .cancel-button",
  );

  const errorMsg = document.querySelector("#addContainerPopup .error-msg");
  // addContainerPopup.classList.remove("hidden");
  fadeInEffect(addContainerPopup);

  saveButton.addEventListener("click", () => {
    if (newContainerName.value.length >= 20) {
      errorMsg.textContent = "Name too long";
      errorMsg.classList.remove("hidden");
      return;
    }
    if (newContainerName.value.trim() !== "") {
      errorMsg.classList.add("hidden");
      const ContainerName = newContainerName.value;
      for (let key in incomingDbData) {
        console.log(key);
        if (key == ContainerName) {
          errorMsg.textContent = "Container name exists";
          errorMsg.classList.remove("hidden");
          return;
        }
      }

      const currentDate = new Date().toISOString().split("T")[0];
      const newRef = ref(
        database,
        `resources/${sem}/${div}/${subject}/${ContainerName}`,
      );

      set(newRef, { name: ContainerName })
        .then(() => {
          console.log("New item added successfully!");
          fadeOutEffect(addContainerPopup);

          // addContainerPopup.classList.add("hidden");
          location.reload();
        })
        .catch((error) => {
          window.location.href = "error.html";
        });
    } else {
      errorMsg.textContent = "Fill all the fields";
      errorMsg.classList.remove("hidden");
    }
  });
  CancelButton.addEventListener("click", () => {
    errorMsg.textContent = "Fill all the fields";
    errorMsg.classList.add("hidden");
    newContainerName.value = "";
    // addContainerPopup.classList.add("hidden");
    fadeOutEffect(addContainerPopup);
  });
});

// delete's container
function deleteContainer(key) {
  fadeInEffect(warningPopup);
  const saveButton = document.querySelector("#warningPopup .save-button");
  const CancelButton = document.querySelector("#warningPopup .cancel-button");
  saveButton.addEventListener("click", () => {
    let deleteRef = ref(database, `resources/${sem}/${div}/${subject}/${key}`);

    remove(deleteRef)
      .then(() => {
        console.log(
          `resources/${sem}/${div}/${subject}/${currentEditingData.parentContainerKey}`,
        );

        console.log("Card updated successfully!");
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

// CRUD operation functions of individual card
// adds card
function addCard(key) {
  const saveButton = document.querySelector("#addNewItemPopup .save-button");
  const CancelButton = document.querySelector(
    "#addNewItemPopup .cancel-button",
  );
  const newItemName = document.querySelector("#newItemName");
  const newItemLink = document.querySelector("#newItemLink");
  const errorMsg = document.querySelector("#addNewItemPopup .error-msg");
  console.log(incomingDbData[key]);
  fadeInEffect(addItemPopup);

  saveButton.addEventListener("click", () => {
    if (newItemLink.value.trim() !== "" && newItemName.value.trim() !== "") {
      const newName = newItemName.value;
      const newLink = newItemLink.value;
      const newRef = ref(
        database,
        `resources/${sem}/${div}/${subject}/${key}/${newName}`,
      );
      for (let subkey in incomingDbData[key]) {
        console.log(subkey);
        if (subkey == newName) {
          errorMsg.textContent = "Content exists";
          errorMsg.classList.remove("hidden");
          return;
        }
        if (newName.length >= 20) {
          errorMsg.textContent = "Name too long";
          errorMsg.classList.remove("hidden");
          return;
        }
      }
      const currentDate = new Date().toISOString().split("T")[0];

      set(newRef, {
        name: newName,
        link: newLink,
      })
        .then(() => {
          containerWrapper.innerHTML = "";
          readDataDb();
          console.log("New item added successfully!");
          fadeOutEffect(addItemPopup);
          readDataDb();
          location.reload();
          // reloadDataDb();
        })
        .catch((error) => {
          window.location.href = "error.html";
        });
    } else {
      errorMsg.textContent = "Fill all the fields";
      errorMsg.classList.remove("hidden");
    }
  });
  CancelButton.addEventListener("click", () => {
    newItemName.value = "";
    newItemLink.value = "";
    errorMsg.classList.add("hidden");
    fadeOutEffect(addItemPopup);
  });
}

// delete's card
function deleteCard() {
  fadeInEffect(warningPopup);
  const saveButton = document.querySelector("#warningPopup .save-button");
  const CancelButton = document.querySelector("#warningPopup .cancel-button");

  saveButton.addEventListener("click", () => {
    let deleteRef = ref(
      database,
      `resources/${sem}/${div}/${subject}/${currentEditingData.parentContainerKey}/${currentEditingData.key}`,
    );

    remove(deleteRef)
      .then(() => {
        console.log(
          `resources/${sem}/${div}/${subject}/${currentEditingData.parentContainerKey}/${currentEditingData.key}`,
        );

        console.log("Card updated successfully!");
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

// edits card
function editCard(currentItemName, currentItemLink) {
  const errorMsg = document.querySelector("#editItemPopup .error-msg");
  const editedName = document.querySelector("#editedName");
  const editedLink = document.querySelector("#editedLink");
  const CancelButton = document.querySelector("#editItemPopup .cancel-button");
  const saveButton = document.querySelector("#editItemPopup .save-button");

  editedLink.value = currentItemLink;
  editedName.value = currentItemName;
  console.log(currentEditingData.parentContainerKey);
  fadeInEffect(editItemPopup);
  console.log("Editing Mode Active:", isEditing);
  saveButton.addEventListener("click", () => {
    if (editedLink.value.trim() !== "" && editedName.value.trim() !== "") {
      if (editedName.value.length >= 20) {
        errorMsg.textContent = "Name too long";
        errorMsg.classList.remove("hidden");
        return;
      }
      fadeOutEffect(editItemPopup);

      const updatedData = {
        link: editedLink.value,
        name: editedName.value,
      };

      let updateRef = ref(
        database,
        `resources/${sem}/${div}/${subject}/${currentEditingData.parentContainerKey}/${currentEditingData.key}`,
      );

      update(updateRef, updatedData)
        .then(() => {
          console.log(
            `resources/${sem}/${div}/${subject}/${currentEditingData.parentContainerKey}/${currentEditingData.key}`,
          );

          console.log("Card updated successfully!");
          fadeOutEffect(editItemPopup);
          location.reload();
        })
        .catch((error) => {
          window.location.href = "error.html";
        });
    } else {
      errorMsg.textContent = "Fill all the fields";

      errorMsg.classList.remove("hidden");
    }
  });
  CancelButton.addEventListener("click", (event) => {
    errorMsg.classList.add("hidden");

    fadeOutEffect(editItemPopup);
    event.stopPropagation();
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
