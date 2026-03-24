/**
 * main.js — основная логика сайта
 * Хедер, мобильное меню, FAQ, анимации при скролле, рендеринг контента
 */

document.addEventListener("DOMContentLoaded", () => {
  renderContent();
  initHeader();
  initMobileMenu();
  initFAQ();
  initScrollAnimations();
  initPricing();
  initGallery();
  initSmoothScroll();
});

// ─── Рендеринг контента из content.js ────────────────────

function renderContent() {
  if (typeof CONTENT === "undefined") return;

  // Название студии
  document.querySelectorAll("[data-content='studio.name']").forEach((el) => {
    el.textContent = CONTENT.studio.name;
  });

  // Слоган
  const tagline = document.querySelector("[data-content='studio.tagline']");
  if (tagline) tagline.innerHTML = CONTENT.studio.tagline.replace("\n", "<br>");

  // Описание в hero
  const heroDesc = document.querySelector("[data-content='studio.description']");
  if (heroDesc) heroDesc.textContent = CONTENT.studio.description;

  // Об студии
  renderAbout();

  // Услуги
  renderServices();

  // Мастера
  renderMasters();

  // Преимущества
  renderAdvantages();

  // FAQ
  renderFAQ();

  // Контакты
  renderContacts();

  // Статы
  renderStats();
}

function renderAbout() {
  const { about } = CONTENT.studio;
  const titleEl = document.querySelector("[data-content='about.title']");
  if (titleEl) titleEl.textContent = about.title;

  const textEl = document.querySelector("[data-content='about.text']");
  if (textEl) {
    textEl.innerHTML = about.paragraphs
      .map((p) => `<p>${p}</p>`)
      .join("");
  }
}

function renderStats() {
  const container = document.querySelector(".about__stats");
  if (!container) return;
  CONTENT.studio.about.stats.forEach((stat) => {
    const el = document.createElement("div");
    el.className = "about__stat";
    if (stat.image) {
      el.innerHTML = `<img src="${stat.image}" alt="${stat.label}" class="about__stat-image"><div class="about__stat-label">${stat.label}</div>`;
    } else {
      el.innerHTML = `<div class="about__stat-value">${stat.value}</div><div class="about__stat-label">${stat.label}</div>`;
    }
    container.appendChild(el);
  });
}

function renderServices() {
  const grid = document.querySelector(".services__grid");
  if (!grid) return;
  CONTENT.services.forEach((service) => {
    const card = document.createElement("div");
    card.className = "service-card animate-on-scroll";
    card.innerHTML = `
      <div class="service-card__icon">${service.icon}</div>
      <h3 class="service-card__title">${service.title}</h3>
      <p class="service-card__desc">${service.desc}</p>
    `;
    grid.appendChild(card);
  });
}

function renderMasters() {
  const grid = document.querySelector(".masters__grid");
  if (!grid) return;
  CONTENT.masters.forEach((master) => {
    const card = document.createElement("div");
    card.className = "master-card animate-on-scroll";
    const tagsHTML = master.tags.map((t) => `<span class="master-card__tag">${t}</span>`).join("");
    const portfolioHTML = master.portfolio && master.portfolio.length
      ? `<div class="master-card__portfolio">
          ${master.portfolio.map((src, i) => `<img src="${src}" alt="Работа ${master.name}" class="master-card__portfolio-thumb" loading="lazy" data-master="${master.name}" data-index="${i}" />`).join("")}
        </div>`
      : "";
    card.innerHTML = `
      <div class="master-card__photo-wrap">
        <img src="${master.photo}" alt="${master.name}" class="master-card__photo" loading="lazy" />
      </div>
      <div class="master-card__info">
        <h3 class="master-card__name">${master.name}</h3>
        <p class="master-card__role">${master.role}</p>
        <p class="master-card__bio">${master.bio}</p>
        <div class="master-card__tags">${tagsHTML}</div>
        ${portfolioHTML}
      </div>
    `;

    if (master.portfolio && master.portfolio.length) {
      card.querySelectorAll(".master-card__portfolio-thumb").forEach((img) => {
        img.addEventListener("click", () => openMasterLightbox(master.portfolio, parseInt(img.dataset.index)));
      });
    }

    grid.appendChild(card);
  });
}

function openMasterLightbox(photos, startIndex) {
  let current = startIndex;
  const lb = document.createElement("div");
  lb.className = "lightbox is-open";
  lb.innerHTML = `
    <div class="lightbox__backdrop"></div>
    <div class="lightbox__body">
      <button class="lightbox__close" aria-label="Закрыть">✕</button>
      <button class="lightbox__prev" aria-label="Предыдущее">‹</button>
      <div class="lightbox__img-wrap">
        <img class="lightbox__img" src="${photos[current]}" alt="" />
      </div>
      <button class="lightbox__next" aria-label="Следующее">›</button>
    </div>
  `;
  document.body.appendChild(lb);
  document.body.classList.add("no-scroll");

  const img = lb.querySelector(".lightbox__img");
  const update = () => { img.src = photos[current]; };
  const close = () => { lb.remove(); document.body.classList.remove("no-scroll"); };

  lb.querySelector(".lightbox__backdrop").addEventListener("click", close);
  lb.querySelector(".lightbox__close").addEventListener("click", close);
  lb.querySelector(".lightbox__prev").addEventListener("click", () => { current = (current - 1 + photos.length) % photos.length; update(); });
  lb.querySelector(".lightbox__next").addEventListener("click", () => { current = (current + 1) % photos.length; update(); });

  const onKey = (e) => {
    if (e.key === "Escape") { close(); document.removeEventListener("keydown", onKey); }
    if (e.key === "ArrowLeft") { current = (current - 1 + photos.length) % photos.length; update(); }
    if (e.key === "ArrowRight") { current = (current + 1) % photos.length; update(); }
  };
  document.addEventListener("keydown", onKey);
}

function renderAdvantages() {
  const grid = document.querySelector(".advantages__grid");
  if (!grid) return;
  CONTENT.advantages.forEach((adv) => {
    const card = document.createElement("div");
    card.className = "advantage-card animate-on-scroll";
    card.innerHTML = `
      <div class="advantage-card__icon">${adv.icon}</div>
      <h3 class="advantage-card__title">${adv.title}</h3>
      <p class="advantage-card__desc">${adv.desc}</p>
    `;
    grid.appendChild(card);
  });
}

function renderFAQ() {
  const list = document.querySelector(".faq__list");
  if (!list) return;
  CONTENT.faq.forEach((item) => {
    const el = document.createElement("div");
    el.className = "faq__item";
    el.innerHTML = `
      <button class="faq__question">
        <span>${item.q}</span>
        <span class="faq__icon">+</span>
      </button>
      <div class="faq__answer">
        <p>${item.a}</p>
      </div>
    `;
    list.appendChild(el);
  });
  // Переинициализируем FAQ после рендеринга
  initFAQ();
}

function renderContacts() {
  const { contacts } = CONTENT;

  const addressEl = document.querySelector("[data-content='contacts.address']");
  if (addressEl) addressEl.textContent = contacts.address;

  const phoneEl = document.querySelector("[data-content='contacts.phone']");
  if (phoneEl) {
    phoneEl.textContent = contacts.phone;
    phoneEl.href = `tel:${contacts.phone.replace(/\D/g, "")}`;
  }

  const waEl = document.querySelector("[data-content='contacts.whatsapp']");
  if (waEl) waEl.href = `https://wa.me/${contacts.whatsapp}`;

  const igEl = document.querySelector("[data-content='contacts.instagram']");
  if (igEl) igEl.textContent = contacts.instagram;

  // Часы работы
  const hoursTable = document.querySelector(".hours__table");
  if (hoursTable) {
    contacts.hours.forEach((row) => {
      const tr = document.createElement("tr");
      tr.innerHTML = `<td>${row.days}</td><td>${row.time}</td>`;
      hoursTable.appendChild(tr);
    });
  }

  const noteEl = document.querySelector("[data-content='contacts.note']");
  if (noteEl) noteEl.textContent = contacts.note;
}

// ─── Header ───────────────────────────────────────────────

function initHeader() {
  const header = document.querySelector(".header");
  if (!header) return;

  window.addEventListener("scroll", () => {
    header.classList.toggle("header--scrolled", window.scrollY > 60);
  }, { passive: true });
}

// ─── Мобильное меню ───────────────────────────────────────

function initMobileMenu() {
  const burger = document.querySelector(".nav__burger");
  const menu = document.querySelector(".mobile-menu");
  const close = document.querySelector(".mobile-menu__close");
  const links = document.querySelectorAll(".mobile-menu__link");

  if (!burger || !menu) return;

  burger.addEventListener("click", () => {
    menu.classList.add("is-open");
    document.body.classList.add("no-scroll");
  });

  const closeMenu = () => {
    menu.classList.remove("is-open");
    document.body.classList.remove("no-scroll");
  };

  close?.addEventListener("click", closeMenu);
  links.forEach((link) => link.addEventListener("click", closeMenu));
}

// ─── FAQ аккордеон ────────────────────────────────────────

function initFAQ() {
  document.querySelectorAll(".faq__item").forEach((item) => {
    const btn = item.querySelector(".faq__question");
    if (!btn || btn.dataset.initialized) return;
    btn.dataset.initialized = "true";

    btn.addEventListener("click", () => {
      const isOpen = item.classList.contains("is-open");

      // Закрываем все
      document.querySelectorAll(".faq__item.is-open").forEach((open) => {
        open.classList.remove("is-open");
        open.querySelector(".faq__icon").textContent = "+";
      });

      // Открываем текущий (если был закрыт)
      if (!isOpen) {
        item.classList.add("is-open");
        btn.querySelector(".faq__icon").textContent = "−";
      }
    });
  });
}

// ─── Анимации при скролле ────────────────────────────────

function initScrollAnimations() {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
        }
      });
    },
    { threshold: 0.1, rootMargin: "0px 0px -40px 0px" }
  );

  // Наблюдаем за секциями и карточками
  document.querySelectorAll(".section-header, .animate-on-scroll").forEach((el) => {
    observer.observe(el);
  });
}

// ─── Плавный скролл ───────────────────────────────────────

function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener("click", (e) => {
      const target = document.querySelector(link.getAttribute("href"));
      if (!target) return;
      e.preventDefault();
      const offset = 80; // высота хедера
      const top = target.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: "smooth" });
    });
  });
}
