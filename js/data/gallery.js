/**
 * ГАЛЕРЕЯ РАБОТ
 * ─────────────────────────────────────────────────────────
 * Чтобы добавить фото:
 *   1. Положите файл в папку images/gallery/
 *   2. Добавьте объект в массив ниже
 *
 * Поля:
 *   src    — путь к фото (или внешний URL)
 *   alt    — описание для alt-текста (важно для SEO)
 *   tags   — массив тегов для фильтрации. Варианты:
 *            "Маникюр", "Педикюр", "Брови"
 *   ratio  — "tall" (высокое) | "wide" (квадрат)
 *            Чередуйте для красивой сетки
 * ─────────────────────────────────────────────────────────
 */

const GALLERY_DATA = [
  {
    src: "images/gallery/manicure-1.webp",
    alt: "Зелёный маникюр с глиттером",
    tags: ["Маникюр"],
    ratio: "tall",
  },
  {
    src: "images/gallery/manicure-2.webp",
    alt: "Нюдовый маникюр со звёздочками",
    tags: ["Маникюр"],
    ratio: "wide",
  },
  {
    src: "images/gallery/manicure-3.webp",
    alt: "Бежевый маникюр с крапинками",
    tags: ["Маникюр"],
    ratio: "tall",
  },
  {
    src: "images/gallery/manicure-4.webp",
    alt: "Белый маникюр с листьями",
    tags: ["Маникюр"],
    ratio: "wide",
  },
  {
    src: "images/gallery/manicure-5.webp",
    alt: "Красный маникюр",
    tags: ["Маникюр"],
    ratio: "tall",
  },
  {
    src: "images/gallery/manicure-6.webp",
    alt: "Французский маникюр",
    tags: ["Маникюр"],
    ratio: "wide",
  },
  {
    src: "images/gallery/manicure-7.jpg",
    alt: "Маникюр",
    tags: ["Маникюр"],
    ratio: "tall",
  },
  {
    src: "images/gallery/manicure-8.jpg",
    alt: "Маникюр",
    tags: ["Маникюр"],
    ratio: "wide",
  },
  {
    src: "images/gallery/manicure-9.jpg",
    alt: "Маникюр",
    tags: ["Маникюр"],
    ratio: "tall",
  },
  {
    src: "images/gallery/manicure-10.jpg",
    alt: "Маникюр",
    tags: ["Маникюр"],
    ratio: "wide",
  },
  {
    src: "images/gallery/pedicure-1.webp",
    alt: "Красный педикюр",
    tags: ["Педикюр"],
    ratio: "tall",
  },
  {
    src: "images/gallery/pedicure-2.webp",
    alt: "Коралловый педикюр",
    tags: ["Педикюр"],
    ratio: "wide",
  },
  {
    src: "images/gallery/pedicure-3.webp",
    alt: "Чёрный педикюр",
    tags: ["Педикюр"],
    ratio: "tall",
  },
  {
    src: "images/gallery/smart-1.jpeg",
    alt: "Смарт-педикюр без покрытия",
    tags: ["Смарт-педикюр"],
    ratio: "tall",
  },
  {
    src: "images/gallery/smart-2.jpeg",
    alt: "Смарт-педикюр с покрытием гель-лак",
    tags: ["Смарт-педикюр"],
    ratio: "wide",
  },
  {
    src: "images/gallery/smart-3.jpeg",
    alt: "Смарт-педикюр с покрытием Luxio",
    tags: ["Смарт-педикюр"],
    ratio: "tall",
  },
  {
    src: "images/gallery/brow-1.jpeg",
    alt: "Ламинирование бровей",
    tags: ["Брови"],
    ratio: "wide",
  },
  {
    src: "images/gallery/brow-2.webp",
    alt: "Архитектура бровей",
    tags: ["Брови"],
    ratio: "tall",
  },
  {
    src: "images/gallery/brow-3.jpeg",
    alt: "Оформление бровей",
    tags: ["Брови"],
    ratio: "wide",
  },
];
