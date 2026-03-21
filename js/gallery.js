/**
 * gallery.js — рендеринг галереи, фильтрация и лайтбокс
 * Не редактируйте для изменения фото — используйте js/data/gallery.js
 */

const GALLERY_TAGS = ["Все", "Маникюр", "Педикюр", "Смарт-педикюр", "Брови"];

function initGallery() {
  const section = document.getElementById("gallery");
  if (!section || typeof GALLERY_DATA === "undefined") return;

  const filtersContainer = section.querySelector(".gallery__filters");
  const grid = section.querySelector(".gallery__grid");

  // Рендерим фильтры
  GALLERY_TAGS.forEach((tag) => {
    const btn = document.createElement("button");
    btn.className = "gallery__filter" + (tag === "Все" ? " is-active" : "");
    btn.textContent = tag;
    btn.addEventListener("click", () => filterGallery(tag, btn));
    filtersContainer.appendChild(btn);
  });

  // Рендерим фото
  GALLERY_DATA.forEach((item, index) => {
    const el = document.createElement("div");
    el.className = `gallery__item gallery__item--${item.ratio}`;
    el.dataset.tags = item.tags.join(",");

    el.innerHTML = `
      <img
        src="${item.src}"
        alt="${item.alt}"
        loading="lazy"
      />
      <div class="gallery__item-overlay">
        <span class="gallery__item-icon">+</span>
      </div>
    `;

    el.addEventListener("click", () => openLightbox(index));
    grid.appendChild(el);
  });

  // Применяем начальный фильтр "Все"
  const allBtn = filtersContainer.querySelector(".gallery__filter");
  filterGallery("Все", allBtn);

  // Создаём лайтбокс
  createLightbox();
}

function filterGallery(tag, activeBtn) {
  // Обновляем активную кнопку
  document.querySelectorAll(".gallery__filter").forEach((btn) => {
    btn.classList.toggle("is-active", btn === activeBtn);
  });

  // Фильтруем карточки
  document.querySelectorAll(".gallery__item").forEach((item) => {
    const tags = item.dataset.tags.split(",");
    const visible = (tag === "Все" && !tags.includes("Смарт-педикюр")) || tags.includes(tag);
    item.classList.toggle("is-hidden", !visible);
  });
}

// ─── Лайтбокс ────────────────────────────────────────────

let currentIndex = 0;

function createLightbox() {
  const lb = document.createElement("div");
  lb.className = "lightbox";
  lb.id = "lightbox";
  lb.innerHTML = `
    <div class="lightbox__backdrop"></div>
    <div class="lightbox__body">
      <button class="lightbox__close" aria-label="Закрыть">✕</button>
      <button class="lightbox__prev" aria-label="Предыдущее">‹</button>
      <div class="lightbox__img-wrap">
        <img class="lightbox__img" src="" alt="" />
      </div>
      <button class="lightbox__next" aria-label="Следующее">›</button>
      <div class="lightbox__caption"></div>
    </div>
  `;
  document.body.appendChild(lb);

  lb.querySelector(".lightbox__backdrop").addEventListener("click", closeLightbox);
  lb.querySelector(".lightbox__close").addEventListener("click", closeLightbox);
  lb.querySelector(".lightbox__prev").addEventListener("click", () => navigateLightbox(-1));
  lb.querySelector(".lightbox__next").addEventListener("click", () => navigateLightbox(1));

  document.addEventListener("keydown", (e) => {
    if (!lb.classList.contains("is-open")) return;
    if (e.key === "Escape") closeLightbox();
    if (e.key === "ArrowLeft") navigateLightbox(-1);
    if (e.key === "ArrowRight") navigateLightbox(1);
  });
}

function openLightbox(index) {
  currentIndex = index;
  updateLightbox();
  document.getElementById("lightbox").classList.add("is-open");
  document.body.classList.add("no-scroll");
}

function closeLightbox() {
  document.getElementById("lightbox").classList.remove("is-open");
  document.body.classList.remove("no-scroll");
}

function navigateLightbox(dir) {
  const visibleItems = GALLERY_DATA.filter((_, i) => {
    const el = document.querySelectorAll(".gallery__item")[i];
    return el && !el.classList.contains("is-hidden");
  });

  const visibleIndexes = GALLERY_DATA.reduce((acc, _, i) => {
    const el = document.querySelectorAll(".gallery__item")[i];
    if (el && !el.classList.contains("is-hidden")) acc.push(i);
    return acc;
  }, []);

  const pos = visibleIndexes.indexOf(currentIndex);
  const newPos = (pos + dir + visibleIndexes.length) % visibleIndexes.length;
  currentIndex = visibleIndexes[newPos];
  updateLightbox();
}

function updateLightbox() {
  const item = GALLERY_DATA[currentIndex];
  const lb = document.getElementById("lightbox");
  lb.querySelector(".lightbox__img").src = item.src;
  lb.querySelector(".lightbox__img").alt = item.alt;
  lb.querySelector(".lightbox__caption").textContent = item.alt;
}
