import { api } from './api.js';
import { $ } from './utils.js';
import * as fx from './effects.js';
import * as blog from './blog.js';
import { initNewsletter, initContactForm } from './forms.js';

// hiệu ứng không cần dữ liệu thì bật luôn
fx.initCursor();
fx.initHeroSpotlight();
fx.initBubbles();
fx.initTyping();
fx.initScrollProgress();
fx.initHeader();
fx.initScrollSpy();
fx.initMobileMenu();
fx.initParallax();
fx.initTilt();
fx.initMagnetic();
fx.initRipple();
fx.initTimelineDraw();
fx.initFaq();
fx.initLightbox();
fx.observeReveal();

initNewsletter();
initContactForm();
blog.initFilters();
blog.initModal();
$('#year').textContent = new Date().getFullYear();

async function loadData() {
  // giữ preloader ít nhất ~1s, không thì nó nháy một cái rồi mất trông hơi giật
  const minDelay = new Promise((r) => setTimeout(r, 900));
  try {
    const [stats, { posts }] = await Promise.all([api('stats'), api('posts')]);
    blog.renderShowcase(posts);
    blog.renderTimeline(posts);
    blog.renderGallery(posts);
    await minDelay;
    fx.hidePreloader();
    fx.initCounters(stats); // đếm số sau khi preloader tắt thì mới thấy được
  } catch (err) {
    await minDelay;
    fx.hidePreloader();
    fx.showToast(`Không kết nối được máy chủ: ${err.message}`, 'error');
  }
}

loadData();
blog.loadPosts();
