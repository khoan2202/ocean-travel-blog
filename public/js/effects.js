// Toàn bộ hiệu ứng động. Mỗi hiệu ứng là một hàm riêng.
// Cách làm chung: JS chỉ đo (vị trí chuột, % cuộn...) rồi gán vào biến CSS
// hoặc đổi class, phần chuyển động để CSS lo.
import { $, $$, canHover, reduceMotion, formatNumber } from './utils.js';

// ---- preloader ----
export function hidePreloader() {
  $('#preloader')?.classList.add('is-done');
  document.body.classList.remove('is-loading');
}

// ---- con trỏ tuỳ chỉnh ----
// chấm bám sát chuột, vòng tròn đuổi theo chậm hơn (mỗi khung hình đi thêm 15% quãng còn lại)
export function initCursor() {
  if (!canHover()) return;
  const dot = $('.cursor-dot');
  const ring = $('.cursor-ring');
  let mouseX = innerWidth / 2, mouseY = innerHeight / 2;
  let ringX = mouseX, ringY = mouseY;

  window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX; mouseY = e.clientY;
    dot.style.transform = `translate(${mouseX}px, ${mouseY}px) translate(-50%, -50%)`;
  });

  (function loop() {
    ringX += (mouseX - ringX) * 0.15;
    ringY += (mouseY - ringY) * 0.15;
    ring.style.transform = `translate(${ringX}px, ${ringY}px) translate(-50%, -50%)`;
    requestAnimationFrame(loop);
  })();

  // rê lên thứ bấm được thì phóng to vòng tròn
  document.addEventListener('mouseover', (e) => {
    ring.classList.toggle('is-hover', !!e.target.closest('a, button, .card, .gallery__item, input, textarea'));
  });
}

// ---- lưới ở hero sáng lên theo chuột ----
// chỉ cập nhật --mx/--my, phần vẽ do mask-image trong CSS
export function initHeroSpotlight() {
  const hero = $('.hero');
  const grid = $('#heroGrid');
  if (!hero || !grid) return;
  hero.addEventListener('pointermove', (e) => {
    const rect = hero.getBoundingClientRect();
    grid.style.setProperty('--mx', `${e.clientX - rect.left}px`);
    grid.style.setProperty('--my', `${e.clientY - rect.top}px`);
  });
}

// ---- bong bóng nổi lên (canvas) ----
export function initBubbles() {
  const canvas = $('#bubbles');
  if (!canvas || reduceMotion()) return;
  const ctx = canvas.getContext('2d');
  let w, h, bubbles = [];

  function resize() {
    w = canvas.width = canvas.offsetWidth;
    h = canvas.height = canvas.offsetHeight;
    // số bong bóng theo diện tích màn hình
    bubbles = Array.from({ length: Math.round((w * h) / 22000) }, () => createBubble(true));
  }
  function createBubble(randomY = false) {
    return {
      x: Math.random() * w,
      y: randomY ? Math.random() * h : h + 20,
      r: Math.random() * 3 + 1,
      speed: Math.random() * 0.6 + 0.2,
      drift: Math.random() * Math.PI * 2,
      alpha: Math.random() * 0.5 + 0.2,
    };
  }
  function draw() {
    ctx.clearRect(0, 0, w, h);
    for (const b of bubbles) {
      b.y -= b.speed;
      b.drift += 0.02;
      b.x += Math.sin(b.drift) * 0.3; // lắc ngang nhẹ
      if (b.y < -10) Object.assign(b, createBubble());
      ctx.beginPath();
      ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(168, 245, 223, ${b.alpha})`;
      ctx.fill();
    }
    requestAnimationFrame(draw);
  }
  resize();
  window.addEventListener('resize', resize);
  draw();
}

// ---- gõ chữ: lần lượt gõ rồi xoá tên các điểm đến ----
export function initTyping(words = ['Hạ Long', 'Sa Pa', 'Hội An', 'Kyoto', 'Santorini', 'Bali']) {
  const el = $('#typed');
  if (!el) return;
  let wordIndex = 0, charIndex = words[0].length, deleting = true;

  function tick() {
    const word = words[wordIndex];
    charIndex += deleting ? -1 : 1;
    el.textContent = word.slice(0, charIndex);

    let delay = deleting ? 60 : 120;
    if (!deleting && charIndex === word.length) { delay = 1800; deleting = true; } // gõ xong thì dừng một lúc
    else if (deleting && charIndex === 0) {
      deleting = false;
      wordIndex = (wordIndex + 1) % words.length;
      delay = 300;
    }
    setTimeout(tick, delay);
  }
  setTimeout(tick, 2200);
}

// ---- hiện dần khi cuộn tới ----
// dùng IntersectionObserver thay vì nghe scroll cho nhẹ
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('is-visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.15, rootMargin: '0px 0px -60px 0px' });

// gọi lại sau mỗi lần JS chèn thêm HTML có data-reveal
export function observeReveal(root = document) {
  $$('[data-reveal]:not(.is-visible)', root).forEach((el) => revealObserver.observe(el));
}

// ---- bộ đếm số ----
function animateCount(el, target, duration = 2000) {
  const suffix = el.dataset.suffix || '';
  const start = performance.now();
  function frame(now) {
    const progress = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 4); // easeOutQuart
    el.textContent = formatNumber(Math.round(target * eased)) + (progress === 1 ? suffix : '');
    if (progress < 1) requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
}

// gán số từ API vào các thẻ [data-stat], chỉ bắt đầu đếm khi cuộn tới
export function initCounters(stats) {
  const counterObserver = new IntersectionObserver((entries, obs) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      animateCount(entry.target, Number(entry.target.dataset.count));
      obs.unobserve(entry.target);
    });
  }, { threshold: 0.6 });

  $$('[data-stat]').forEach((el) => {
    el.dataset.count = stats[el.dataset.stat] ?? 0;
    counterObserver.observe(el);
  });
}

// gom các việc theo scroll vào một requestAnimationFrame, tối đa một lần mỗi khung hình
const scrollTasks = [];
let ticking = false;
export function onScroll(task) {
  scrollTasks.push(task);
  task(window.scrollY);
}
window.addEventListener('scroll', () => {
  if (ticking) return;
  ticking = true;
  requestAnimationFrame(() => {
    scrollTasks.forEach((task) => task(window.scrollY));
    ticking = false;
  });
}, { passive: true });

// ---- thanh tiến độ cuộn + nút lên đầu trang ----
export function initScrollProgress() {
  const bar = $('#scrollBar');
  const percentEl = $('#scrollPercent');
  const toTop = $('#toTop');
  const ring = $('#toTopRing');
  const CIRCUMFERENCE = 2 * Math.PI * 21; // vòng tròn bán kính 21

  onScroll((y) => {
    const max = document.documentElement.scrollHeight - innerHeight;
    const progress = max > 0 ? y / max : 0;
    bar.style.transform = `scaleY(${progress})`;
    percentEl.textContent = `${Math.round(progress * 100)}%`;
    ring.style.strokeDashoffset = CIRCUMFERENCE * (1 - progress);
    toTop.classList.toggle('is-visible', y > 600);
  });
  toTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
}

// ---- header: nền mờ khi cuộn, ẩn khi cuộn xuống, hiện lại khi cuộn lên ----
export function initHeader() {
  const header = $('#header');
  let lastY = 0;
  onScroll((y) => {
    header.classList.toggle('is-scrolled', y > 40);
    const goingDown = y > lastY && y > 400;
    if (!document.body.classList.contains('no-scroll')) header.classList.toggle('is-hidden', goingDown);
    lastY = y;
  });
}

// ---- scrollspy: tô sáng mục đang xem ở chấm bên phải và menu ----
export function initScrollSpy() {
  const links = $$('#sideDots a, .nav__link');
  const spy = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const id = entry.target.id;
      links.forEach((a) => a.classList.toggle('is-active', a.getAttribute('href') === `#${id}`));
    });
  }, { rootMargin: '-45% 0px -50% 0px' }); // chỉ tính khi section nằm ở dải giữa màn hình
  $$('[data-section]').forEach((s) => spy.observe(s));
}

// ---- menu toàn màn hình trên mobile ----
export function initMobileMenu() {
  const burger = $('#burger');
  const menu = $('#mobileMenu');
  const toggle = (open) => {
    burger.classList.toggle('is-open', open);
    menu.classList.toggle('is-open', open);
    burger.setAttribute('aria-expanded', open);
    menu.setAttribute('aria-hidden', !open);
    document.body.classList.toggle('no-scroll', open);
  };
  burger.addEventListener('click', () => toggle(!menu.classList.contains('is-open')));
  $$('a', menu).forEach((a) => a.addEventListener('click', () => toggle(false)));
  document.addEventListener('keydown', (e) => e.key === 'Escape' && toggle(false));
}

// ---- parallax: lớp nền trôi chậm hơn nội dung ----
export function initParallax() {
  if (reduceMotion()) return;
  onScroll((y) => {
    $$('[data-speed]').forEach((el) => {
      el.style.transform = `translateY(${y * Number(el.dataset.speed)}px)`;
    });
    // ảnh showcase dịch theo vị trí so với giữa màn hình
    $$('.showcase__media').forEach((media) => {
      const rect = media.getBoundingClientRect();
      if (rect.bottom < 0 || rect.top > innerHeight) return;
      const offset = (rect.top + rect.height / 2 - innerHeight / 2) * -0.12;
      media.querySelector('img').style.setProperty('--parallax', `${offset - 40}px`);
    });
  });
}

// ---- thẻ nghiêng 3D theo chuột + vệt sáng ----
// vị trí chuột trong thẻ (0..1) đổi thành góc xoay tối đa ±maxDeg
export function applyTilt(el, maxDeg = 8) {
  if (!canHover()) return;
  el.addEventListener('pointermove', (e) => {
    const rect = el.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width;
    const py = (e.clientY - rect.top) / rect.height;
    el.style.setProperty('--ry', `${(px - 0.5) * maxDeg * 2}deg`);
    el.style.setProperty('--rx', `${(0.5 - py) * maxDeg * 2}deg`);
    el.style.setProperty('--gx', `${px * 100}%`);
    el.style.setProperty('--gy', `${py * 100}%`);
  });
  el.addEventListener('pointerleave', () => {
    el.style.setProperty('--rx', '0deg');
    el.style.setProperty('--ry', '0deg');
  });
}
export function initTilt() { $$('[data-tilt]').forEach((el) => applyTilt(el, 6)); }

// ---- nút bị "hút" nhẹ về phía con trỏ ----
export function initMagnetic() {
  if (!canHover()) return;
  $$('[data-magnetic]').forEach((btn) => {
    btn.addEventListener('pointermove', (e) => {
      const rect = btn.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      btn.style.transform = `translate(${x * 0.25}px, ${y * 0.35}px)`;
    });
    btn.addEventListener('pointerleave', () => { btn.style.transform = ''; });
  });
}

// ---- gợn sóng tại chỗ bấm ----
export function initRipple() {
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-ripple]');
    if (!btn) return;
    const rect = btn.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const span = document.createElement('span');
    span.className = 'ripple';
    span.style.cssText = `width:${size}px;height:${size}px;left:${e.clientX - rect.left - size / 2}px;top:${e.clientY - rect.top - size / 2}px`;
    btn.appendChild(span);
    span.addEventListener('animationend', () => span.remove());
  });
}

// ---- đường trục timeline dài ra theo tiến độ cuộn ----
export function initTimelineDraw() {
  const wrap = $('#timelineWrap');
  const fill = $('#timelineFill');
  if (!wrap) return;
  onScroll(() => {
    const rect = wrap.getBoundingClientRect();
    const start = innerHeight * 0.7; // đỉnh timeline lên tới 70% màn hình thì bắt đầu vẽ
    const progress = Math.min(Math.max((start - rect.top) / rect.height, 0), 1);
    fill.style.transform = `scaleY(${progress})`;
  });
}

// ---- FAQ: mở/đóng từng câu và nút mở tất cả ----
export function initFaq() {
  const items = $$('.faq__item');
  const toggleAllBtn = $('#toggleAll');
  const setOpen = (item, open) => {
    item.classList.toggle('is-open', open);
    item.querySelector('.faq__q').setAttribute('aria-expanded', open);
  };
  items.forEach((item) => {
    item.querySelector('.faq__q').addEventListener('click', () => setOpen(item, !item.classList.contains('is-open')));
  });
  toggleAllBtn?.addEventListener('click', () => {
    const openAll = !items.every((i) => i.classList.contains('is-open'));
    items.forEach((i) => setOpen(i, openAll));
    toggleAllBtn.textContent = openAll ? 'Đóng tất cả' : 'Mở tất cả';
  });
}

// ---- lightbox: xem ảnh lớn, đổi ảnh bằng nút hoặc phím mũi tên ----
let lightboxItems = [];
let lightboxIndex = 0;
export function openLightbox(items, index) {
  lightboxItems = items;
  lightboxIndex = index;
  renderLightbox();
  $('#lightbox').classList.add('is-open');
  document.body.classList.add('no-scroll');
}
function renderLightbox() {
  const item = lightboxItems[lightboxIndex];
  $('#lightboxImg').src = item.src;
  $('#lightboxImg').alt = item.caption;
  $('#lightboxCap').textContent = item.caption;
}
export function initLightbox() {
  const box = $('#lightbox');
  const close = () => { box.classList.remove('is-open'); document.body.classList.remove('no-scroll'); };
  const go = (step) => {
    lightboxIndex = (lightboxIndex + step + lightboxItems.length) % lightboxItems.length;
    renderLightbox();
  };
  $('.lightbox__close', box).addEventListener('click', close);
  $('.lightbox__nav--prev', box).addEventListener('click', () => go(-1));
  $('.lightbox__nav--next', box).addEventListener('click', () => go(1));
  box.addEventListener('click', (e) => e.target === box && close());
  document.addEventListener('keydown', (e) => {
    if (!box.classList.contains('is-open')) return;
    if (e.key === 'Escape') close();
    if (e.key === 'ArrowLeft') go(-1);
    if (e.key === 'ArrowRight') go(1);
  });
}

// ---- toast ----
export function showToast(message, type = 'success') {
  const toast = document.createElement('div');
  toast.className = `toast toast--${type}`;
  toast.innerHTML = `<span>${type === 'success' ? '🌊' : '⚠️'}</span><span></span>`;
  toast.lastChild.textContent = message; // textContent để không bị chèn HTML
  $('#toastStack').appendChild(toast);
  setTimeout(() => {
    toast.classList.add('is-leaving');
    toast.addEventListener('animationend', () => toast.remove());
  }, 3500);
}
