const menuToggle = document.querySelector(".menu-toggle");
const mainNav = document.querySelector(".main-nav");

if (menuToggle && mainNav) {
  menuToggle.addEventListener("click", () => {
    const isOpen = mainNav.classList.toggle("open");
    menuToggle.setAttribute("aria-expanded", String(isOpen));
  });

  mainNav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      mainNav.classList.remove("open");
      menuToggle.setAttribute("aria-expanded", "false");
    });
  });
}

const year = document.querySelector("#year");
if (year) year.textContent = new Date().getFullYear();

// Генератор начнёт показывать случайные цитаты после добавления утверждённой подборки.


// Historical map selector: switches the active period and its placeholder.
document.querySelectorAll("[data-map-period]").forEach((button) => {
  button.addEventListener("click", () => {
    const period = button.dataset.mapPeriod;
    document.querySelectorAll("[data-map-period]").forEach((item) => {
      const active = item === button;
      item.classList.toggle("active", active);
      item.setAttribute("aria-pressed", String(active));
    });
    const display = document.querySelector("#map-display");
    if (display) {
      display.dataset.currentMap = period;
      const artifact = period === "artifact";
      const title = artifact ? "Артефакт" : "Порабощение";
      const src = artifact
        ? "/assets/images/maps/%D0%A2%D1%80%D0%B0%D0%BD%D0%BA%D0%B2%D0%B8%D0%BB%20(1).png"
        : "/assets/images/maps/%D0%A2%D1%80%D0%B0%D0%BD%D0%BA%D0%B2%D0%B8%D0%BB.png";
      display.innerHTML = '<figure class="map-image-frame"><img class="period-map-image" src="' + src + '" alt="Карта Транквила периода «' + title + '»"><figcaption>Транквиль — период «' + title + '»</figcaption></figure>';
    }
  });
});

// Dictionary filters work with entries carrying data-guide-entry, data-type and data-spoiler.
const guideSearch = document.querySelector("#guide-search");
const guideSpoilers = document.querySelector("#guide-spoilers");
const guideType = document.querySelector("#guide-type");
const guideResults = document.querySelector("#guide-results");

function filterGuideEntries() {
  if (!guideResults) return;
  const entries = [...guideResults.querySelectorAll("[data-guide-entry]")];
  const query = (guideSearch?.value || "").trim().toLocaleLowerCase("ru");
  const maxSpoiler = Number(guideSpoilers?.value || 0);
  const type = guideType?.value || "all";
  let shown = 0;
  entries.forEach((entry) => {
    const searchable = (entry.dataset.search || entry.textContent).toLocaleLowerCase("ru");
    const spoiler = Number(entry.dataset.spoiler || 0);
    const matches = (!query || searchable.includes(query)) &&
      spoiler <= maxSpoiler &&
      (type === "all" || entry.dataset.type === type);
    entry.hidden = !matches;
    if (matches) shown++;
  });
  const empty = guideResults.querySelector(".guide-empty");
  if (empty) empty.hidden = entries.length > 0 && shown > 0;
  const noMatches = guideResults.querySelector(".guide-no-matches");
  if (entries.length > 0 && shown === 0 && !noMatches) {
    const message = document.createElement("p");
    message.className = "guide-no-matches";
    message.textContent = "По заданным условиям ничего не найдено.";
    guideResults.append(message);
  } else if (noMatches) {
    noMatches.hidden = shown > 0;
  }
}
[guideSearch, guideSpoilers, guideType].forEach((control) => {
  control?.addEventListener("input", filterGuideEntries);
  control?.addEventListener("change", filterGuideEntries);
});
filterGuideEntries();
