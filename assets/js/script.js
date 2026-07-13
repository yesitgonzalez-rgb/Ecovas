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

const heroVideo = document.getElementById('heroVideo');
heroVideo.addEventListener('error', () => { heroVideo.style.display = 'none'; }, true);

const track = document.getElementById('sliderTrack');
const slides = Array.from(track.querySelectorAll('.slide'));
const dotsWrap = document.getElementById('sliderDots');
const prevBtn = document.getElementById('prevSlide');
const nextBtn = document.getElementById('nextSlide');
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

const header = document.getElementById('header');
window.addEventListener('scroll', () => {
  header.classList.toggle('is-scrolled', window.scrollY > 20);
}, { passive: true });

const revealTargets = document.querySelectorAll('.section, .feel-card, .product-card, .slide__content');
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
