// Trong DB danh mục lưu tiếng Anh, đây là tên hiển thị
export const CATEGORY_LABELS = {
  beach: '🏝 Biển đảo',
  mountain: '⛰ Núi rừng',
  city: '🏮 Phố thị',
  food: '🍜 Ẩm thực',
};

// Escape trước khi nhét chuỗi từ người dùng vào innerHTML (chống XSS)
export function escapeHtml(str = '') {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// "2025-03-14" -> "14 thg 3, 2025"
export function formatDate(value) {
  if (!value) return '';
  return new Date(value).toLocaleDateString('vi-VN', { day: 'numeric', month: 'short', year: 'numeric' });
}

// 12500 -> "12.500"
export const formatNumber = (n) => Number(n || 0).toLocaleString('vi-VN');

// Chỉ chạy sau khi ngừng gọi `wait` ms, dùng cho ô tìm kiếm
export function debounce(fn, wait = 300) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), wait);
  };
}

export const $ = (selector, root = document) => root.querySelector(selector);
export const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

// thiết bị có chuột thật (không phải cảm ứng)
export const canHover = () => window.matchMedia('(hover: hover) and (pointer: fine)').matches;

export const reduceMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
