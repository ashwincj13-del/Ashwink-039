/* ==========================================================
   IPL 2026 Ticket Booking - app.js
   Activity 5: toast + smooth scrolling
   Activity 7: live Booking Summary
   Activity 8: team filter, grid/list toggle, hamburger menu
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
  if (!summaryMatch) return;   // this page has no summary card

  const matchOption = matchSelect.options[matchSelect.selectedIndex];
  const standValue = standSelect.value;
  const standLabel = standSelect.options[standSelect.selectedIndex].text;
  const quantity = parseInt(ticketsInput.value, 10);

  const hasMatch = matchSelect.value !== "";
  const hasStand = standValue !== "";
  const validQty = !isNaN(quantity) && quantity >= 1 && quantity <= 10;

  summaryMatch.textContent = hasMatch ? matchOption.dataset.teams : "Not selected";
  summaryStand.textContent = hasStand ? standLabel : "Not selected";

  let price = 0;
  if (hasMatch && hasStand) {
    price = parseInt(matchOption.dataset[standValue], 10);
  }
  summaryPrice.textContent = formatPrice(price);

  const qty = validQty ? quantity : 0;
  summaryQty.textContent = qty;
  summaryTotal.textContent = formatPrice(price * qty);

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

/* ---------- 5. Change event listeners for the summary ---------- */
function setupSummaryListeners() {
  if (!matchSelect || !standSelect || !ticketsInput) return;

  matchSelect.addEventListener("change", function () { updateSummary(true); });
  standSelect.addEventListener("change", function () { updateSummary(true); });
  ticketsInput.addEventListener("change", function () { updateSummary(true); });
}

/* ---------- 6. Book buttons on the match cards ---------- */
function setupBookButtons() {
  const bookButtons = document.querySelectorAll(".book-btn");

  bookButtons.forEach(function (button) {
    button.addEventListener("click", function () {
      const teams = button.closest(".match-card").querySelector("h3").textContent;

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
    updateSummary(false);
  });
}

/* ---------- 8. Filter match cards by team ---------- */
function setupMatchFilter() {
  const filter = document.getElementById("team-filter");
  const cards = document.querySelectorAll(".match-card");
  const noMatches = document.getElementById("no-matches");
  if (!filter) return;

  filter.addEventListener("change", function () {
    let visible = 0;

    cards.forEach(function (card) {
      const teams = card.dataset.teams.split(" ");       // e.g. ["CSK", "MI"]
      const show = filter.value === "all" || teams.includes(filter.value);

      card.classList.toggle("hidden", !show);
      if (show) visible++;
    });

    noMatches.classList.toggle("hidden", visible !== 0);

    if (filter.value === "all") {
      showToast("Showing all " + visible + " matches.", "info", 1500);
    } else {
      showToast("Showing " + visible + " match(es) for " + filter.value + ".", "info", 1500);
    }
  });
}

/* ---------- 9. Toggle between grid view and list view ---------- */
function setupViewToggle() {
  const matchList = document.getElementById("match-list");
  const viewButtons = document.querySelectorAll(".view-btn");
  if (!matchList) return;

  viewButtons.forEach(function (button) {
    button.addEventListener("click", function () {
      // add or remove the "list-view" class on the card container
      matchList.classList.toggle("list-view", button.dataset.view === "list");

      viewButtons.forEach(function (b) {
        b.classList.toggle("active", b === button);
      });
    });
  });
}

/* ---------- 10. Hamburger menu (toggle a class on the nav links) ---------- */
function setupHamburgerMenu() {
  const toggle = document.getElementById("menu-toggle");
  const links = document.getElementById("nav-links");
  if (!toggle || !links) return;

  function setMenu(open) {
    links.classList.toggle("open", open);
    toggle.setAttribute("aria-expanded", open);
    toggle.innerHTML = open ? "&#10005;" : "&#9776;";   // X when open, bars when closed
  }

  toggle.addEventListener("click", function () {
    setMenu(!links.classList.contains("open"));
  });

  // close the menu after choosing a link
  links.querySelectorAll("a").forEach(function (link) {
    link.addEventListener("click", function () {
      setMenu(false);
    });
  });
}

/* ---------- 11. Start everything when the page loads ---------- */
document.addEventListener("DOMContentLoaded", function () {
  enableSmoothScrolling();
  setupSummaryListeners();
  setupBookButtons();
  setupBookingForm();
  setupMatchFilter();
  setupViewToggle();
  setupHamburgerMenu();
  updateSummary(false);
});
