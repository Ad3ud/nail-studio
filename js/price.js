/**
 * price.js — рендеринг прайс-листа из данных price.js (data)
 * Не редактируйте этот файл для изменения цен — используйте js/data/price.js
 */

function initPricing() {
  const section = document.getElementById("pricing");
  if (!section || typeof PRICE_DATA === "undefined") return;

  const tabsContainer = section.querySelector(".pricing__tabs");
  const contentContainer = section.querySelector(".pricing__content");

  // Рендерим вкладки
  PRICE_DATA.forEach((category, index) => {
    const tab = document.createElement("button");
    tab.className = "pricing__tab" + (index === 0 ? " is-active" : "");
    tab.textContent = category.category;
    tab.dataset.slug = category.slug;
    tab.addEventListener("click", () => switchTab(category.slug));
    tabsContainer.appendChild(tab);
  });

  // Рендерим содержимое всех вкладок
  PRICE_DATA.forEach((category, index) => {
    const panel = document.createElement("div");
    panel.className = "pricing__panel" + (index === 0 ? " is-active" : "");
    panel.dataset.slug = category.slug;

    category.items.forEach((item) => {
      const row = document.createElement("div");
      row.className = "pricing__row";

      const badgeHTML = item.badge
        ? `<span class="pricing__badge pricing__badge--${item.badge === "Хит" ? "hit" : "new"}">${item.badge}</span>`
        : "";

      row.innerHTML = `
        <div class="pricing__row-info">
          <div class="pricing__row-name">
            ${item.name}
            ${badgeHTML}
          </div>
          ${item.desc ? `<div class="pricing__row-desc">${item.desc}</div>` : ""}
        </div>
        <div class="pricing__row-price">${item.price}</div>
      `;

      panel.appendChild(row);
    });

    contentContainer.appendChild(panel);
  });
}

function switchTab(slug) {
  // Переключаем активную вкладку
  document.querySelectorAll(".pricing__tab").forEach((tab) => {
    tab.classList.toggle("is-active", tab.dataset.slug === slug);
  });

  // Переключаем активную панель
  document.querySelectorAll(".pricing__panel").forEach((panel) => {
    panel.classList.toggle("is-active", panel.dataset.slug === slug);
  });
}
