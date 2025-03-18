import {
  database,
  app,
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
} from "./firebase.js";
// variables
const loginStatus = document.querySelector("#loginStatus");
const containerWrapper = document.querySelector(".containerWrapper");
const editToggleButton = document.querySelector("#editModeToggleButton");
const addContainerButton = document.querySelector("#addContainerButton");
const editPopup = document.querySelector("#editForm");
const addPopup = document.querySelector("#addNewItemForm");
const warningPopup = document.querySelector("#warningPopup");
const deleteButton = document.querySelector("#deleteButton");
const addContainerPopup = document.querySelector("#addContainerForm");
let isDeleteContainerFlag = false;
const subject = "ees";
const sem = "sem1";
const dbRef = ref(database, `resources/${sem}/${subject}`);
let dbIncomingData = {};
let currentEditingData = {};
let isEditing = false;

isUserLoggedIn() //checks if user has already loggedin
  .then(() => {
    console.log("user logged in");

    loginStatus.textContent = "Logout";
    editToggleButton.classList.remove("hidden");
  })
  .catch(() => {
    window.location.href = "./login.html";
  });

// login/logout toggle
loginStatus.addEventListener("click", () => {
  if (loginStatus.textContent === "Logout") {
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

// animation function
async function fadeInEffect(element) {
  element.classList.remove("hidden");
  await new Promise((resolve) => setTimeout(resolve, 10));
  element.style.opacity = "1";
  if (element.id == "addContainerButton") {
    element.style.paddingTop = "0.5rem";
    element.style.paddingBottom = "0.5rem";
    element.style.maxHeight = "100px";
  }
}

async function fadeOutEffect(element) {
  element.style.opacity = "0";
  if (element.id == "addContainerButton") {
    element.style.maxHeight = "0";
    element.style.paddingTop = "0";
    element.style.paddingBottom = "0";
  }
  await new Promise((resolve) => setTimeout(resolve, 200)); // Wait for transition
  element.classList.add("hidden");
}

async function smoothTextChange(element, newText) {
  element.style.transform = "scale(0.95)"; // Shrink effect
  element.style.transition = "transform 0.2s ease-in-out"; // Smooth transition

  await new Promise((resolve) => setTimeout(resolve, 150)); // Wait for transition

  element.textContent = newText; // Change text
  element.style.transform = "scale(1)"; // Scale back
}

// fetching data
async function readDataDb() {
  await get(dbRef)
    .then((snapshot) => {
      if (snapshot.exists()) {
        console.log(snapshot.val());
        dbIncomingData = snapshot.val();
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
readDataDb();

async function reloadDataDb() {
  await get(dbRef)
    .then((snapshot) => {
      if (snapshot.exists()) {
        console.log(snapshot.val());
        containerWrapper.innerHTML = "";
        dbIncomingData = snapshot.val();
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

function createWrapper() {
  for (let key in dbIncomingData) {
    const wrapper = document.createElement("div");
    wrapper.className =
      "my-3 mb-6 flex flex-col px-3 text-base font-semibold text-white ";
    const deleteContainerIcon = document.createElement("i");
    const title = document.createElement("p");
    const subWrapper = document.createElement("div");
    const addElementIcon = document.createElement("i");
    const parentContainerName = key;
    const cardContainer = document.createElement("div");
    const iconsWrapper = document.createElement("div");
    iconsWrapper.className = "iconsWrapper hidden flex gap-2 flex  w-full";
    addElementIcon.className = "fa-solid fa-plus  addElementIcon ";
    deleteContainerIcon.className =
      "fa-solid fa-trash  deleteContainerIcon ml-auto mr-2 text-xl";
    subWrapper.className =
      "title mb-3 text-2xl font-bold flex items-center gap-2 w-full";
    title.textContent = dbIncomingData[key].name;
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
      isDeleteContainerFlag = true;
      currentEditingData = {
        parentContainerKey: key,
      };
      deleteCard();
    });
    if (isEditing) {
      iconsWrapper.classList.remove("hidden");
    }
    createCard(dbIncomingData[key], cardContainer, parentContainerName);
  }
}

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
      deleteButton.addEventListener("click", () => {
        deleteCard();
      });
    }
  }
}

// CRUD operation functions
editToggleButton.addEventListener("click", () => {
  const editIcons = document.querySelectorAll(".iconsWrapper");
  editIcons.forEach((icon) => {
    icon.classList.toggle("hidden");
  });
  isEditing = !isEditing;
  console.log("ineditingmode");
  if (editToggleButton.textContent.trim() === "Edit") {
    smoothTextChange(editToggleButton, "Exit mode");
  } else if (editToggleButton.textContent.trim() === "Exit mode") {
    smoothTextChange(editToggleButton, "Edit");
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

function addCard(key) {
  const saveButton = document.querySelector("#addNewItemForm .saveButton");
  const CancelButton = document.querySelector("#addNewItemForm .CancelButton");
  const newItemName = document.querySelector("#newItemName");
  const newItemLink = document.querySelector("#newItemLink");
  const errorMsg = document.querySelector("#addNewItemForm .errorMsg");
  console.log(dbIncomingData[key]);
  fadeInEffect(addPopup);

  saveButton.addEventListener("click", () => {
    if (newItemLink.value.trim() !== "" && newItemName.value.trim() !== "") {
      const newName = newItemName.value;
      const newLink = newItemLink.value;
      const newRef = ref(
        database,
        `resources/${sem}/${subject}/${key}/${newName}`,
      );
      for (let subkey in dbIncomingData[key]) {
        console.log(subkey);
        if (subkey == newName) {
          errorMsg.textContent = "Content exists";
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
          fadeOutEffect(addPopup);
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
    fadeOutEffect(addPopup);
  });
}

addContainerButton.addEventListener("click", () => {
  const saveButton = document.querySelector("#addContainerForm .saveButton");
  const newContainerName = document.querySelector("#newContainerName");
  const CancelButton = document.querySelector(
    "#addContainerForm .CancelButton",
  );

  const errorMsg = document.querySelector("#addContainerForm .errorMsg");
  // addContainerPopup.classList.remove("hidden");
  fadeInEffect(addContainerPopup);

  saveButton.addEventListener("click", () => {
    if (newContainerName.value.trim() !== "") {
      errorMsg.classList.add("hidden");
      const ContainerName = newContainerName.value;
      for (let key in dbIncomingData) {
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
        `resources/${sem}/${subject}/${ContainerName}`,
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
function deleteCard() {
  fadeInEffect(warningPopup);
  const saveButton = document.querySelector("#warningPopup .saveButton");
  const CancelButton = document.querySelector("#warningPopup .CancelButton");

  saveButton.addEventListener("click", () => {
    if (!isDeleteContainerFlag) {
      let deleteRef = ref(
        database,
        `resources/${sem}/${subject}/${currentEditingData.parentContainerKey}/${currentEditingData.key}`,
      );

      remove(deleteRef)
        .then(() => {
          console.log(
            `resources/${sem}/${subject}/${currentEditingData.parentContainerKey}/${currentEditingData.key}`,
          );

          console.log("Card updated successfully!");
          fadeOutEffect(warningPopup);
          location.reload();
        })
        .catch((error) => {
          window.location.href = "error.html";
        });
    } else {
      let deleteRef = ref(
        database,
        `resources/${sem}/${subject}/${currentEditingData.parentContainerKey}`,
      );

      remove(deleteRef)
        .then(() => {
          console.log(
            `resources/${sem}/${subject}/${currentEditingData.parentContainerKey}`,
          );

          console.log("Card updated successfully!");
          fadeOutEffect(warningPopup);
          location.reload();
        })
        .catch((error) => {
          window.location.href = "error.html";
        });
    }
  });
  CancelButton.addEventListener("click", () => {
    fadeOutEffect(warningPopup);
  });
}
function editCard(currentItemName, currentItemLink) {
  const errorMsg = document.querySelector("#editForm .errorMsg");
  const editedName = document.querySelector("#editedName");
  const editedLink = document.querySelector("#editedLink");
  const CancelButton = document.querySelector("#editForm .CancelButton");
  const saveButton = document.querySelector("#editForm .saveButton");

  editedLink.value = currentItemLink;
  editedName.value = currentItemName;
  console.log(currentEditingData.parentContainerKey);
  fadeInEffect(editPopup);
  console.log("Editing Mode Active:", isEditing);
  saveButton.addEventListener("click", () => {
    // if (!currentEditingData.key) return;
    if (editedLink.value.trim() !== "" && editedName.value.trim() !== "") {
      fadeOutEffect(editPopup);

      const updatedData = {
        link: editedLink.value,
        name: editedName.value,
      };

      let updateRef = ref(
        database,
        `resources/${sem}/${subject}/${currentEditingData.parentContainerKey}/${currentEditingData.key}`,
      );

      update(updateRef, updatedData)
        .then(() => {
          console.log(
            `resources/${sem}/${subject}/${currentEditingData.parentContainerKey}/${currentEditingData.key}`,
          );

          console.log("Card updated successfully!");
          fadeOutEffect(editPopup);
          location.reload();
        })
        .catch((error) => {
          window.location.href = "error.html";
        });
    } else {
      errorMsg.classList.remove("hidden");
    }
  });
  CancelButton.addEventListener("click", (event) => {
    errorMsg.classList.add("hidden");

    fadeOutEffect(editPopup);
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
