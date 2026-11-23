/* ==========================================================
   IPL 2026 Ticket Booking - app.js
   Activity 5: toast + smooth scrolling
   Activity 7: live Booking Summary using selectors
   ========================================================== */

/* ---------- 1. Reusable toast notification ---------- */
function showToast(message, type = "success", duration = 3000) {
  let container = document.getElementById("toast-container");
  if (!container) {
    container = document.createElement("div");
    container.id = "toast-container";
    document.body.appendChild(container);
  }

  const toast = document.createElement("div");
  toast.className = "toast " + type;
  toast.textContent = message;
  container.appendChild(toast);

  setTimeout(function () {
    toast.classList.add("show");
  }, 10);

  setTimeout(function () {
    toast.classList.remove("show");
    setTimeout(function () {
      toast.remove();
    }, 400);
  }, duration);
}

/* ---------- 2. Smooth scrolling for in-page links ---------- */
function enableSmoothScrolling() {
  const links = document.querySelectorAll('a[href^="#"]');

  links.forEach(function (link) {
    link.addEventListener("click", function (event) {
      const target = document.querySelector(link.getAttribute("href"));

      if (target) {
        event.preventDefault();
        target.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    });
  });
}

/* ---------- 3. Select the form controls (DOM selectors) ---------- */
const matchSelect = document.getElementById("match");
const standSelect = document.getElementById("stand");
const ticketsInput = document.getElementById("tickets");

const summaryMatch = document.getElementById("summary-match");
const summaryStand = document.getElementById("summary-stand");
const summaryPrice = document.getElementById("summary-price");
const summaryQty = document.getElementById("summary-qty");
const summaryTotal = document.getElementById("summary-total");

/* format a number the Indian way, e.g. 7500 -> 7,500 */
function formatPrice(amount) {
  return amount.toLocaleString("en-IN");
}

/* ---------- 4. Update the Booking Summary card ---------- */
function updateSummary(showMessage) {
  // read the selected match (its data-* attributes hold the prices)
  const matchOption = matchSelect.options[matchSelect.selectedIndex];
  const standValue = standSelect.value;                    // general / premium / vip
  const standLabel = standSelect.options[standSelect.selectedIndex].text;
  const quantity = parseInt(ticketsInput.value, 10);

  const hasMatch = matchSelect.value !== "";
  const hasStand = standValue !== "";
  const validQty = !isNaN(quantity) && quantity >= 1 && quantity <= 10;

  // match name
  summaryMatch.textContent = hasMatch ? matchOption.dataset.teams : "Not selected";

  // stand name
  summaryStand.textContent = hasStand ? standLabel : "Not selected";

  // price per ticket (depends on both match and stand)
  let price = 0;
  if (hasMatch && hasStand) {
    price = parseInt(matchOption.dataset[standValue], 10);
  }
  summaryPrice.textContent = formatPrice(price);

  // quantity and total
  const qty = validQty ? quantity : 0;
  summaryQty.textContent = qty;
  summaryTotal.textContent = formatPrice(price * qty);

  // toast confirmation
  if (showMessage) {
    if (hasMatch && hasStand && validQty) {
      showToast(
        "Summary updated: " + matchOption.dataset.teams + ", " + standLabel +
        " x " + qty + " = \u20B9" + formatPrice(price * qty),
        "success", 2500
      );
    } else if (!validQty) {
      showToast("Please enter between 1 and 10 tickets.", "error", 2500);
    } else {
      showToast("Booking summary updated.", "info", 1500);
    }
  }
}

/* ---------- 5. Change event listeners ---------- */
function setupSummaryListeners() {
  if (!matchSelect || !standSelect || !ticketsInput) return;

  matchSelect.addEventListener("change", function () { updateSummary(true); });
  standSelect.addEventListener("change", function () { updateSummary(true); });
  ticketsInput.addEventListener("change", function () { updateSummary(true); });
}

/* ---------- 6. Book buttons in the match schedule ---------- */
function setupBookButtons() {
  const bookButtons = document.querySelectorAll(".book-btn");

  bookButtons.forEach(function (button) {
    button.addEventListener("click", function () {
      const teams = button.closest("tr").children[1].textContent;

      // pre-select the match, then refresh the summary (toast is shown below)
      matchSelect.value = button.dataset.match;
      updateSummary(false);

      showToast("Match selected: " + teams + ". Please complete your booking below.");
    });
  });
}

/* ---------- 7. Booking form submit ---------- */
function setupBookingForm() {
  const form = document.querySelector("#book-ticket form");
  if (!form) return;

  form.addEventListener("submit", function (event) {
    event.preventDefault();
    showToast("Booking confirmed! Check your email for the e-ticket.");
    form.reset();
    updateSummary(false);   // clear the summary card too
  });
}

/* ---------- 8. Start everything when the page loads ---------- */
document.addEventListener("DOMContentLoaded", function () {
  enableSmoothScrolling();
  setupSummaryListeners();
  setupBookButtons();
  setupBookingForm();
  updateSummary(false);     // show starting values
});
