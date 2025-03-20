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
  await new Promise((resolve) => setTimeout(resolve, 200));
  element.classList.add("hidden");
}

async function smoothTextChange(element, newText) {
  element.style.transform = "scale(0.95)";
  element.style.transition = "transform 0.2s ease-in-out";

  await new Promise((resolve) => setTimeout(resolve, 150));

  element.textContent = newText;
  element.style.transform = "scale(1)";
}

export { fadeInEffect, fadeOutEffect, smoothTextChange };
