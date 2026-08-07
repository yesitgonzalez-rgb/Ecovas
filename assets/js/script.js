document.getElementById('year').textContent = new Date().getFullYear();

const navToggle = document.getElementById('navToggle');
const nav = document.getElementById('nav');
navToggle.addEventListener('click', () => {
  const isOpen = nav.classList.toggle('is-open');
  navToggle.setAttribute('aria-expanded', isOpen);
});
nav.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    nav.classList.remove('is-open');
    navToggle.setAttribute('aria-expanded', 'false');
  });
});

// Mega menu "Productos": mismo patron toggle/click-afuera/Escape que ya
// usa el widget del bot (ver botWidget mas abajo), reutilizado tal cual.
const megaTrigger = document.getElementById('megaTrigger');
const megaBtn = document.getElementById('megaBtn');
const megaMenu = document.getElementById('megaMenu');

function toggleMega(open) {
  const isOpen = open !== undefined ? open : megaMenu.hidden;
  megaTrigger.classList.toggle('is-open', isOpen);
  megaBtn.setAttribute('aria-expanded', String(isOpen));
  megaMenu.hidden = !isOpen;
}

megaBtn.addEventListener('click', () => toggleMega());

document.addEventListener('click', e => {
  if (!megaMenu.hidden && !megaTrigger.contains(e.target)) {
    toggleMega(false);
  }
});

document.addEventListener('keydown', e => {
  if (e.key === 'Escape') toggleMega(false);
});

megaMenu.querySelectorAll('.mega-menu__item').forEach(item => {
  item.addEventListener('click', () => toggleMega(false));
});

// Boton de sonido del video "Nuestro Heroe". A diferencia del hero original
// (arriba del todo), esta seccion vive mas abajo en la pagina: no tiene
// sentido desmutear con el primer gesto en cualquier parte del sitio, asi
// que el sonido solo se activa con un clic explicito en el boton.
const heroeVideo = document.getElementById('heroeVideo');
const heroeSound = document.getElementById('heroeSound');
if (heroeVideo && heroeSound) {
  function heroeHasAudioTrack(v) {
    if (v.audioTracks) return v.audioTracks.length > 0;
    if (typeof v.mozHasAudio === 'boolean') return v.mozHasAudio;
    if (typeof v.webkitAudioDecodedByteCount === 'number') return v.webkitAudioDecodedByteCount > 0;
    return true;
  }

  function renderHeroeSoundUI() {
    const on = !heroeVideo.muted;
    heroeSound.classList.toggle('is-on', on);
    heroeSound.setAttribute('aria-pressed', String(on));
    heroeSound.setAttribute('aria-label', on ? 'Silenciar el video' : 'Activar sonido del video');
    heroeSound.querySelector('.hero__sound-label').textContent = on ? 'Silenciar' : 'Activar sonido';
  }

  heroeSound.addEventListener('click', () => {
    const turningOn = heroeVideo.muted;
    heroeVideo.muted = !turningOn;
    if (turningOn) heroeVideo.volume = 1;
    renderHeroeSoundUI();
    heroeVideo.play().catch(() => { heroeVideo.muted = true; renderHeroeSoundUI(); });
  });

  heroeVideo.addEventListener('playing', () => {
    setTimeout(() => { heroeSound.hidden = !heroeHasAudioTrack(heroeVideo); }, 500);
  }, { once: true });

  // El video vive varias secciones mas abajo: sin "autoplay" ni preload en
  // el HTML para no competir por el hilo principal con la carga inicial.
  // Solo empieza a cargar y reproducirse cuando la seccion esta por entrar
  // en pantalla.
  const heroeObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        heroeVideo.preload = 'auto';
        heroeVideo.play().catch(() => {});
        heroeObserver.unobserve(heroeVideo);
      }
    });
  }, { rootMargin: '200px' });
  heroeObserver.observe(heroeVideo);
}

// Motor de slider reutilizable: misma logica que ya usaba el slider del
// hero, ahora parametrizada por ids para poder montar mas de una instancia
// (ej. el slider "Antes y Despues") sin duplicar codigo.
function initSlider(viewportId, dotsId, prevId, nextId) {
  const track = document.getElementById(viewportId);
  const dotsWrap = document.getElementById(dotsId);
  const prevBtn = document.getElementById(prevId);
  const nextBtn = document.getElementById(nextId);
  if (!track || !dotsWrap || !prevBtn || !nextBtn) return;

  const slides = Array.from(track.querySelectorAll('.slide'));
  let current = 0;
  let autoplayTimer;

  slides.forEach((_, i) => {
    const dot = document.createElement('button');
    dot.setAttribute('aria-label', `Ir a la diapositiva ${i + 1}`);
    dot.addEventListener('click', () => goToSlide(i));
    dotsWrap.appendChild(dot);
  });
  const dots = Array.from(dotsWrap.children);

  function goToSlide(index) {
    slides[current].classList.remove('is-active');
    dots[current].classList.remove('is-active');
    current = (index + slides.length) % slides.length;
    slides[current].classList.add('is-active');
    dots[current].classList.add('is-active');
    resetAutoplay();
  }

  function nextSlide() { goToSlide(current + 1); }
  function prevSlide() { goToSlide(current - 1); }

  function resetAutoplay() {
    clearInterval(autoplayTimer);
    autoplayTimer = setInterval(nextSlide, 5000);
  }

  nextBtn.addEventListener('click', nextSlide);
  prevBtn.addEventListener('click', prevSlide);

  goToSlide(0);
  resetAutoplay();

  let touchStartX = 0;
  track.parentElement.addEventListener('touchstart', e => {
    touchStartX = e.changedTouches[0].screenX;
  }, { passive: true });
  track.parentElement.addEventListener('touchend', e => {
    const delta = e.changedTouches[0].screenX - touchStartX;
    if (Math.abs(delta) > 50) delta < 0 ? nextSlide() : prevSlide();
  }, { passive: true });
}

initSlider('sliderViewport', 'sliderDots', 'prevSlide', 'nextSlide');
initSlider('adSliderViewport', 'adSliderDots', 'adPrevSlide', 'adNextSlide');
// Reutilizable para Empresas/Industria: initSlider('empresasSliderViewport', ...).
initSlider('hogarSliderViewport', 'hogarSliderDots', 'hogarPrevSlide', 'hogarNextSlide');

const header = document.getElementById('header');
window.addEventListener('scroll', () => {
  header.classList.toggle('is-scrolled', window.scrollY > 20);
}, { passive: true });

const revealTargets = document.querySelectorAll('.section, .feel-card, .product-card, .cat-card, .slide__content');
revealTargets.forEach(el => el.classList.add('reveal'));

const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.15 });

revealTargets.forEach(el => observer.observe(el));

// Scroll-spy: marca .is-active en el link de nav (incluidas las
// categorias del mega menu) de la seccion visible. Observer independiente
// del de .reveal, no lo modifica.
const navLinksByTarget = {};
document.querySelectorAll('[data-nav-link]').forEach(link => {
  const id = link.dataset.navLink;
  if (id && id !== 'top') navLinksByTarget[id] = link;
});
const spyObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    const link = navLinksByTarget[entry.target.id];
    if (!link) return;
    Object.values(navLinksByTarget).forEach(l => l.classList.remove('is-active'));
    link.classList.add('is-active');
  });
}, { rootMargin: '-40% 0px -55% 0px' });
Object.keys(navLinksByTarget).forEach(id => {
  const section = document.getElementById(id);
  if (section) spyObserver.observe(section);
});

const botWidget = document.getElementById('botWidget');
const botLauncher = document.getElementById('botLauncher');
const botClose = document.getElementById('botClose');

function toggleBot(open) {
  const isOpen = open !== undefined ? open : !botWidget.classList.contains('is-open');
  botWidget.classList.toggle('is-open', isOpen);
  botLauncher.setAttribute('aria-expanded', isOpen);
}

botLauncher.addEventListener('click', () => toggleBot());
botClose.addEventListener('click', () => toggleBot(false));

document.addEventListener('click', e => {
  if (botWidget.classList.contains('is-open') && !botWidget.contains(e.target)) {
    toggleBot(false);
  }
});

document.addEventListener('keydown', e => {
  if (e.key === 'Escape') toggleBot(false);
});

/* Conversacion del Bot */
const botTopics = {
  multiusos: {
    label: 'ECOVAS Multiusos',
    reply: '¡Excelente elección! ECOVAS Multiusos tiene 186 usos en distintas superficies, es 100% biodegradable y no necesitas guantes ni tapabocas. ¿Seguimos por WhatsApp para ver presentaciones y precios?',
    waText: 'Hola, quiero saber más sobre ECOVAS Multiusos'
  },
  hogar: {
    label: 'Producto Hogar',
    reply: '¡Excelente elección! ECOVAS para tu hogar limpia baños, cocina y pisos de forma segura para toda la familia, sin químicos agresivos. ¿Seguimos por WhatsApp?',
    waText: 'Hola, quiero saber más sobre el Producto Hogar'
  },
  oficina: {
    label: 'Producto Oficina',
    reply: '¡Excelente elección! Nuestra presentación de 20 litros rinde 186 usos, ideal para reducir costos de aseo en tu empresa o negocio. ¿Seguimos por WhatsApp?',
    waText: 'Hola, quiero saber más sobre el Producto Oficina'
  },
  estetico: {
    label: 'Producto Estético',
    reply: 'Estamos preparando esta línea con el mismo compromiso ecológico de ECOVAS. Escríbenos por WhatsApp y serás de los primeros en enterarte cuando esté disponible.',
    waText: 'Hola, quiero saber más sobre el Producto Estético'
  }
};

const botMessages = document.getElementById('botMessages');
const botCta = document.getElementById('botCta');

function addBotMessage(text, who) {
  const msg = document.createElement('p');
  msg.className = `bot-msg bot-msg--${who}`;
  msg.textContent = text;
  botMessages.appendChild(msg);
  botMessages.scrollTop = botMessages.scrollHeight;
}

document.querySelectorAll('.bot-option[data-topic]').forEach(btn => {
  btn.addEventListener('click', () => {
    const topic = botTopics[btn.dataset.topic];
    document.querySelectorAll('.bot-option').forEach(b => b.classList.remove('is-selected'));
    btn.classList.add('is-selected');

    addBotMessage(topic.label, 'user');
    addBotMessage(topic.reply, 'bot');

    botCta.href = `https://wa.me/573103336061?text=${encodeURIComponent(topic.waText)}`;
    botCta.textContent = `Continuar por WhatsApp`;
  });
});

const contactForm = document.getElementById('contactForm');
if (contactForm) {
  contactForm.addEventListener('submit', e => {
    e.preventDefault();
    const name = document.getElementById('cfName').value.trim();
    const phone = document.getElementById('cfPhone').value.trim();
    const product = document.getElementById('cfProduct').value;
    const message = document.getElementById('cfMessage').value.trim();

    let text = `Hola, mi nombre es ${name}.`;
    if (phone) text += ` Mi teléfono es ${phone}.`;
    text += ` Estoy interesado en: ${product}. ${message}`;

    window.open(`https://wa.me/573103336061?text=${encodeURIComponent(text)}`, '_blank', 'noopener');
  });
}

/* Carrito de pedido -> WhatsApp */
const cart = [];
const cartToggle = document.getElementById('cartToggle');
const cartBadge = document.getElementById('cartBadge');
const cartModal = document.getElementById('cartModal');
const cartBackdrop = document.getElementById('cartBackdrop');
const cartClose = document.getElementById('cartClose');
const cartItemsWrap = document.getElementById('cartItems');
const cartWhatsappBtn = document.getElementById('cartWhatsappBtn');

function openCart() {
  cartModal.classList.add('is-open');
  cartModal.setAttribute('aria-hidden', 'false');
}
function closeCart() {
  cartModal.classList.remove('is-open');
  cartModal.setAttribute('aria-hidden', 'true');
}

function updateCartBadge() {
  const totalQty = cart.reduce((sum, item) => sum + item.qty, 0);
  cartBadge.textContent = totalQty;
  cartBadge.classList.toggle('is-visible', totalQty > 0);
}

function updateCartWhatsappLink() {
  if (cart.length === 0) {
    cartWhatsappBtn.href = 'https://wa.me/573103336061?text=' + encodeURIComponent('Hola, quiero hacer un pedido de ECOVAS Multiusos.');
    return;
  }
  let text = 'Hola, quiero hacer el siguiente pedido de ECOVAS Multiusos:\n';
  cart.forEach(item => { text += `- ${item.name} x${item.qty}\n`; });
  text += 'Por favor confírmenme disponibilidad y precio.';
  cartWhatsappBtn.href = 'https://wa.me/573103336061?text=' + encodeURIComponent(text);
}

function renderCart() {
  if (cart.length === 0) {
    cartItemsWrap.innerHTML = '<p class="cart-empty">Tu carrito está vacío. Agrega productos de ECOVAS Multiusos.</p>';
  } else {
    cartItemsWrap.innerHTML = cart.map((item, i) => `
      <div class="cart-item">
        <div class="cart-item__info">
          <strong>${item.name}</strong>
          <span>Cantidad: ${item.qty}</span>
        </div>
        <button type="button" class="cart-item__remove" data-index="${i}" aria-label="Quitar del carrito">×</button>
      </div>
    `).join('');
    cartItemsWrap.querySelectorAll('.cart-item__remove').forEach(btn => {
      btn.addEventListener('click', () => {
        cart.splice(Number(btn.dataset.index), 1);
        renderCart();
        updateCartBadge();
        updateCartWhatsappLink();
      });
    });
  }
  updateCartWhatsappLink();
}

document.querySelectorAll('[data-product]').forEach(card => {
  const addBtn = card.querySelector('.add-to-cart');
  if (!addBtn) return;

  const stepperValue = card.querySelector('.qty-stepper__value');
  let qty = 1;

  card.querySelectorAll('.qty-stepper__btn').forEach(btn => {
    btn.addEventListener('click', () => {
      qty = btn.dataset.action === 'increase' ? qty + 1 : Math.max(1, qty - 1);
      if (stepperValue) stepperValue.textContent = qty;
    });
  });

  addBtn.addEventListener('click', () => {
    const name = card.dataset.product;
    const existing = cart.find(item => item.name === name);
    if (existing) existing.qty += qty;
    else cart.push({ name, qty });

    qty = 1;
    if (stepperValue) stepperValue.textContent = qty;

    updateCartBadge();
    renderCart();
    openCart();
  });
});

cartToggle.addEventListener('click', openCart);
cartClose.addEventListener('click', closeCart);
cartBackdrop.addEventListener('click', closeCart);
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') closeCart();
});

renderCart();
updateCartBadge();
