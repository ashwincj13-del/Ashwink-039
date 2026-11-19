/* ==========================================================
   IPL 2026 Ticket Booking - app.js
   Activity 5: JavaScript basics and user interaction
   ========================================================== */

/* 1. Reusable toast notification function
   message  - text to show
   type     - "success" (default), "error" or "info"
   duration - how long it stays on screen in milliseconds */
function showToast(message, type = "success", duration = 3000) {
  // create the container once, then reuse it
  let container = document.getElementById("toast-container");
  if (!container) {
    container = document.createElement("div");
    container.id = "toast-container";
    document.body.appendChild(container);
  }

  // build the toast
  const toast = document.createElement("div");
  toast.className = "toast " + type;
  toast.textContent = message;
  container.appendChild(toast);

  // fade in
  setTimeout(function () {
    toast.classList.add("show");
  }, 10);

  // fade out and remove
  setTimeout(function () {
    toast.classList.remove("show");
    setTimeout(function () {
      toast.remove();
    }, 400);
  }, duration);
}

/* 2. Smooth scrolling for every in-page link (#matches, #book-ticket ...) */
function enableSmoothScrolling() {
  const links = document.querySelectorAll('a[href^="#"]');

  links.forEach(function (link) {
    link.addEventListener("click", function (event) {
      const targetId = link.getAttribute("href");
      const target = document.querySelector(targetId);

      if (target) {
        event.preventDefault();
        target.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    });
  });
}

/* 3. Book buttons in the match schedule:
      select the match in the form, scroll to it and show a toast */
function setupBookButtons() {
  const bookButtons = document.querySelectorAll(".book-btn");
  const matchSelect = document.getElementById("match");

  bookButtons.forEach(function (button) {
    button.addEventListener("click", function () {
      const row = button.closest("tr");
      const teams = row.children[1].textContent;   // e.g. "CSK vs MI"

      // pre-select this match in the booking form
      if (matchSelect) {
        matchSelect.value = button.dataset.match;
      }

      showToast("Match selected: " + teams + ". Please complete your booking below.");
    });
  });
}

/* 4. Confirmation toast when the booking form is submitted */
function setupBookingForm() {
  const form = document.querySelector("#book-ticket form");
  if (!form) return;

  form.addEventListener("submit", function (event) {
    event.preventDefault();               // stay on the page
    showToast("Booking confirmed! Check your email for the e-ticket.");
    form.reset();
  });
}

/* 5. Start everything once the page has loaded */
document.addEventListener("DOMContentLoaded", function () {
  enableSmoothScrolling();
  setupBookButtons();
  setupBookingForm();
});
