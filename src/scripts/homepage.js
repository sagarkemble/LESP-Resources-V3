import { fadeInEffect } from "./animation.js";
window.addEventListener("load", function () {
  fadeInEffect(document.body);
});
const swiper1 = new Swiper("#swiper-1", {
  // Optional parameters
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
