/* ============================================================
   GSAP REGISTRATION
============================================================ */
gsap.registerPlugin(ScrollTrigger);

/* ============================================================
   LOADER
============================================================ */
const loader     = document.getElementById('loader');
const loaderFill = loader.querySelector('.loader-fill');

// Animate loader bar then reveal page
gsap.to(loaderFill, {
  width: '100%',
  duration: 1.2,
  ease: 'power2.inOut',
  onComplete: () => {
    gsap.to(loader, {
      yPercent: -100,
      duration: 0.8,
      ease: 'power3.inOut',
      delay: 0.2,
      onComplete: () => {
        loader.style.display = 'none';
        initHeroAnimation();
      }
    });
  }
});

/* ============================================================
   CUSTOM CURSOR
============================================================ */
const dot  = document.getElementById('cursorDot');
const ring = document.getElementById('cursorRing');

let mouseX = 0, mouseY = 0;
let ringX  = 0, ringY  = 0;

document.addEventListener('mousemove', (e) => {
  mouseX = e.clientX;
  mouseY = e.clientY;
  gsap.to(dot, { x: mouseX, y: mouseY, duration: 0.05, ease: 'none' });
});

// Lerp ring after dot for smooth lag
function animateRing() {
  ringX += (mouseX - ringX) * 0.14;
  ringY += (mouseY - ringY) * 0.14;
  gsap.set(ring, { x: ringX, y: ringY });
  requestAnimationFrame(animateRing);
}
animateRing();

// Hover state for interactive elements
const hoverEls = document.querySelectorAll('a, button, .gallery-item, .project-card, .interest-card');
hoverEls.forEach(el => {
  el.addEventListener('mouseenter', () => ring.classList.add('hovered'));
  el.addEventListener('mouseleave', () => ring.classList.remove('hovered'));
});
document.addEventListener('mousedown', () => ring.classList.add('clicking'));
document.addEventListener('mouseup',   () => ring.classList.remove('clicking'));

/* ============================================================
   NAVIGATION
============================================================ */
const nav = document.getElementById('nav');

ScrollTrigger.create({
  start: 'top -80',
  onToggle: self => nav.classList.toggle('scrolled', self.isActive)
});

// Mobile menu
const navToggle  = document.getElementById('navToggle');
const mobileMenu = document.getElementById('mobileMenu');

navToggle.addEventListener('click', () => {
  const isOpen = mobileMenu.classList.toggle('open');
  navToggle.classList.toggle('open', isOpen);
  document.body.style.overflow = isOpen ? 'hidden' : '';
});

document.querySelectorAll('.mobile-link').forEach(link => {
  link.addEventListener('click', () => {
    mobileMenu.classList.remove('open');
    navToggle.classList.remove('open');
    document.body.style.overflow = '';
  });
});

/* ============================================================
   HERO — CANVAS PARTICLE SYSTEM
============================================================ */
const canvas  = document.getElementById('heroCanvas');
const ctx     = canvas.getContext('2d');
let particles = [];
const PARTICLE_COUNT = 90;
const CONNECT_DIST   = 160;
const MOUSE_REPEL    = 130;

const mouse = { x: -9999, y: -9999 };
window.addEventListener('mousemove', e => { mouse.x = e.clientX; mouse.y = e.clientY; });

function resizeCanvas() {
  canvas.width  = window.innerWidth;
  canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

class Particle {
  constructor() { this.reset(); }

  reset() {
    this.x  = Math.random() * canvas.width;
    this.y  = Math.random() * canvas.height;
    this.vx = (Math.random() - 0.5) * 0.45;
    this.vy = (Math.random() - 0.5) * 0.45;
    this.r  = Math.random() * 1.8 + 0.6;
    this.a  = Math.random() * 0.4 + 0.1;
  }

  update() {
    const dx   = this.x - mouse.x;
    const dy   = this.y - mouse.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist < MOUSE_REPEL) {
      const force = (MOUSE_REPEL - dist) / MOUSE_REPEL;
      this.vx += (dx / dist) * force * 0.6;
      this.vy += (dy / dist) * force * 0.6;
    }

    this.vx *= 0.98;
    this.vy *= 0.98;
    this.x  += this.vx;
    this.y  += this.vy;

    if (this.x < 0) this.x = canvas.width;
    if (this.x > canvas.width)  this.x = 0;
    if (this.y < 0) this.y = canvas.height;
    if (this.y > canvas.height) this.y = 0;
  }

  draw() {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(124,111,247,${this.a})`;
    ctx.fill();
  }
}

for (let i = 0; i < PARTICLE_COUNT; i++) particles.push(new Particle());

function drawConnections() {
  for (let i = 0; i < particles.length; i++) {
    for (let j = i + 1; j < particles.length; j++) {
      const dx   = particles[i].x - particles[j].x;
      const dy   = particles[i].y - particles[j].y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < CONNECT_DIST) {
        const alpha = (1 - dist / CONNECT_DIST) * 0.18;
        ctx.beginPath();
        ctx.moveTo(particles[i].x, particles[i].y);
        ctx.lineTo(particles[j].x, particles[j].y);
        ctx.strokeStyle = `rgba(124,111,247,${alpha})`;
        ctx.lineWidth   = 0.7;
        ctx.stroke();
      }
    }
  }
}

function animateCanvas() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  particles.forEach(p => { p.update(); p.draw(); });
  drawConnections();
  requestAnimationFrame(animateCanvas);
}
animateCanvas();

/* ============================================================
   HERO — ENTRANCE ANIMATION
============================================================ */
function initHeroAnimation() {
  const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

  tl.to('.hero-greeting', { opacity: 1, y: 0, duration: 0.8 })
    .to('.hero-name-line', { opacity: 1, y: 0, duration: 1, stagger: 0.12 }, '-=0.4')
    .to('.hero-role',      { opacity: 1, y: 0, duration: 0.7 }, '-=0.5')
    .to('.hero-cta',       { opacity: 1, y: 0, duration: 0.7 }, '-=0.4')
    .to('.scroll-hint',    { opacity: 1, duration: 0.6 }, '+=0.3');

  startTyping();
}

/* ============================================================
   HERO — TYPING ANIMATION
============================================================ */
const roles  = [
  'build data pipelines.',
  'study Data Science @ UNC.',
  'love machine learning.',
  'write clean code.',
  'solve hard problems.',
  'explore new tech.',
];
let roleIndex   = 0;
let charIndex   = 0;
let isDeleting  = false;
const typedEl   = document.getElementById('roleCycle');

function startTyping() {
  typedEl.textContent = '';
  typeStep();
}

function typeStep() {
  const current = roles[roleIndex];

  if (!isDeleting) {
    typedEl.textContent = current.substring(0, charIndex + 1);
    charIndex++;
    if (charIndex === current.length) {
      isDeleting = true;
      setTimeout(typeStep, 1800);
      return;
    }
  } else {
    typedEl.textContent = current.substring(0, charIndex - 1);
    charIndex--;
    if (charIndex === 0) {
      isDeleting = false;
      roleIndex  = (roleIndex + 1) % roles.length;
    }
  }

  const speed = isDeleting ? 55 : 85;
  setTimeout(typeStep, speed);
}

/* ============================================================
   SPLIT TEXT UTILITY
============================================================ */
function splitTitle(el) {
  const html = el.innerHTML;
  // Split on <br> first, keep newlines
  const lines = html.split(/<br\s*\/?>/i);
  el.innerHTML = lines.map(line => {
    const chars = line.split('').map(ch =>
      ch === ' '
        ? '<span class="char" style="display:inline-block;width:0.3em">&nbsp;</span>'
        : `<span class="char" style="display:inline-block;overflow:hidden"><span class="char-inner" style="display:inline-block">${ch}</span></span>`
    ).join('');
    return `<span style="display:block">${chars}</span>`;
  }).join('');

  return el.querySelectorAll('.char-inner');
}

/* ============================================================
   SCROLL ANIMATIONS
============================================================ */
document.addEventListener('DOMContentLoaded', () => {});

// Run after a tiny delay to ensure DOM is ready post-loader
setTimeout(() => {
  initScrollAnimations();
}, 200);

function initScrollAnimations() {

  /* ---- Section Titles (split char reveal) ---- */
  document.querySelectorAll('.split-title').forEach(el => {
    const chars = splitTitle(el);
    gsap.from(chars, {
      scrollTrigger: { trigger: el, start: 'top 85%' },
      y: '110%',
      duration: 0.7,
      stagger: 0.018,
      ease: 'power3.out'
    });
  });

  /* ---- Generic fade-up elements ---- */
  document.querySelectorAll('.fade-up').forEach(el => {
    gsap.to(el, {
      scrollTrigger: { trigger: el, start: 'top 88%' },
      opacity: 1,
      y: 0,
      duration: 0.8,
      ease: 'power3.out'
    });
  });

  /* ---- About stats counter ---- */
  document.querySelectorAll('.stat-num').forEach(el => {
    const target = parseInt(el.dataset.target, 10);
    ScrollTrigger.create({
      trigger: el,
      start: 'top 85%',
      once: true,
      onEnter: () => {
        gsap.to({ val: 0 }, {
          val: target,
          duration: 1.8,
          ease: 'power2.out',
          onUpdate: function() {
            el.textContent = Math.round(this.targets()[0].val);
          }
        });
      }
    });
  });

  /* ---- Hero parallax ---- */
  gsap.to('.hero-content', {
    scrollTrigger: {
      trigger: '.hero',
      start: 'top top',
      end: 'bottom top',
      scrub: true
    },
    y: 120,
    opacity: 0,
    ease: 'none'
  });

  /* ---- Project cards stagger ---- */
  gsap.fromTo('.project-card',
    { opacity: 0, y: 50 },
    {
      scrollTrigger: {
        trigger: '.projects-grid',
        start: 'top 80%'
      },
      opacity: 1,
      y: 0,
      duration: 0.75,
      stagger: 0.12,
      ease: 'power3.out'
    }
  );

  /* ---- Skill bars ---- */
  document.querySelectorAll('.skill-fill').forEach(el => {
    const w = el.dataset.w;
    ScrollTrigger.create({
      trigger: el,
      start: 'top 90%',
      once: true,
      onEnter: () => {
        gsap.to(el, { width: `${w}%`, duration: 1.2, ease: 'power2.out' });
      }
    });
  });

  /* ---- Timeline items ---- */
  gsap.utils.toArray('.tl-item').forEach((el, i) => {
    gsap.from(el, {
      scrollTrigger: { trigger: el, start: 'top 88%' },
      opacity: 0,
      x: -30,
      duration: 0.7,
      delay: i * 0.08,
      ease: 'power3.out'
    });
  });

  /* ---- Gallery items ---- */
  gsap.utils.toArray('.gallery-item').forEach((el, i) => {
    gsap.from(el, {
      scrollTrigger: { trigger: el, start: 'top 90%' },
      opacity: 0,
      scale: 0.94,
      duration: 0.7,
      delay: (i % 3) * 0.1,
      ease: 'power3.out'
    });
  });

  /* ---- Section label slide in ---- */
  document.querySelectorAll('.section-label').forEach(el => {
    gsap.from(el, {
      scrollTrigger: { trigger: el, start: 'top 90%' },
      opacity: 0,
      x: -20,
      duration: 0.6,
      ease: 'power3.out'
    });
  });

  /* ---- Interest cards stagger ---- */
  gsap.utils.toArray('.interest-card').forEach((el, i) => {
    gsap.from(el, {
      scrollTrigger: { trigger: el, start: 'top 88%' },
      opacity: 0,
      y: 40,
      duration: 0.65,
      delay: (i % 3) * 0.1,
      ease: 'power3.out'
    });
  });

}

/* ============================================================
   MAGNETIC BUTTONS
============================================================ */
document.querySelectorAll('.magnetic').forEach(el => {
  el.addEventListener('mousemove', function(e) {
    const rect   = this.getBoundingClientRect();
    const cx     = rect.left + rect.width  / 2;
    const cy     = rect.top  + rect.height / 2;
    const dx     = (e.clientX - cx) * 0.35;
    const dy     = (e.clientY - cy) * 0.35;
    gsap.to(this, { x: dx, y: dy, duration: 0.35, ease: 'power2.out' });
  });

  el.addEventListener('mouseleave', function() {
    gsap.to(this, { x: 0, y: 0, duration: 0.5, ease: 'elastic.out(1, 0.5)' });
  });
});

/* ============================================================
   PROJECT CARD — COLOR GLOW ON HOVER
============================================================ */
document.querySelectorAll('.project-card').forEach(card => {
  const color = card.dataset.color || '#7c6ff7';

  card.addEventListener('mouseenter', () => {
    gsap.to(card, {
      boxShadow: `0 20px 60px ${color}33`,
      duration: 0.4
    });
  });
  card.addEventListener('mouseleave', () => {
    gsap.to(card, {
      boxShadow: 'none',
      duration: 0.4
    });
  });
});

/* ============================================================
   GALLERY LIGHTBOX
============================================================ */
const lightbox  = document.getElementById('lightbox');
const lbImg     = document.getElementById('lbImg');
const lbCaption = document.getElementById('lbCaption');
const lbClose   = document.getElementById('lbClose');

document.querySelectorAll('.gallery-item').forEach(item => {
  item.addEventListener('click', () => {
    const img = item.querySelector('img');
    const src = img && img.style.display !== 'none' ? img.src : '';
    const caption = item.dataset.caption || '';

    if (src) {
      lbImg.src = src;
    } else {
      // Show the gradient div as background image via canvas snapshot
      lbImg.src = '';
      lbImg.style.background = item.querySelector('.gi-inner').style.background;
      lbImg.style.width  = '600px';
      lbImg.style.height = '400px';
    }
    lbCaption.textContent = caption;
    lightbox.classList.add('open');
    document.body.style.overflow = 'hidden';
  });
});

function closeLightbox() {
  lightbox.classList.remove('open');
  document.body.style.overflow = '';
  setTimeout(() => { lbImg.src = ''; lbImg.style.background = ''; }, 400);
}

lbClose.addEventListener('click', closeLightbox);
lightbox.addEventListener('click', e => { if (e.target === lightbox) closeLightbox(); });
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeLightbox(); });

/* ============================================================
   CONTACT FORM
============================================================ */
const contactForm = document.getElementById('contactForm');

contactForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const btnText = contactForm.querySelector('.btn-text');
  const btnSent = contactForm.querySelector('.btn-sent');
  const btn     = contactForm.querySelector('button[type="submit"]');

  // Simple client-side validation visual
  let valid = true;
  contactForm.querySelectorAll('[required]').forEach(field => {
    if (!field.value.trim()) {
      valid = false;
      gsap.to(field, {
        x: [-8, 8, -6, 6, 0],
        duration: 0.4,
        ease: 'power2.inOut'
      });
    }
  });
  if (!valid) return;

  // Animate submission
  gsap.to(btn, { scale: 0.96, duration: 0.15, yoyo: true, repeat: 1 });

  // Send to Formspree
  try {
    const response = await fetch(contactForm.action, {
      method: 'POST',
      body: new FormData(contactForm),
      headers: {
        'Accept': 'application/json'
      }
    });

    if (response.ok) {
      btnText.style.display = 'none';
      btnSent.style.display = '';
      gsap.from(btnSent, { opacity: 0, y: 8, duration: 0.4 });

      setTimeout(() => {
        contactForm.reset();
        btnText.style.display = '';
        btnSent.style.display = 'none';
      }, 3000);
    }
  } catch (error) {
    console.error('Form submission error:', error);
  }
});

/* ============================================================
   SMOOTH ACTIVE NAV LINK
============================================================ */
const sections  = document.querySelectorAll('section[id]');
const navLinks  = document.querySelectorAll('.nav-link');

ScrollTrigger.create({
  trigger: document.body,
  start: 'top top',
  end: 'bottom bottom',
  onUpdate: () => {
    const scrollY = window.scrollY + window.innerHeight / 3;
    sections.forEach(sec => {
      if (scrollY >= sec.offsetTop && scrollY < sec.offsetTop + sec.offsetHeight) {
        navLinks.forEach(link => {
          link.style.color = '';
          if (link.getAttribute('href') === `#${sec.id}`) {
            link.style.color = 'var(--text)';
          }
        });
      }
    });
  }
});

/* ============================================================
   SECTION LABEL / SCROLL LABEL MARQUEE (hero bottom)
============================================================ */
// Gently fade out hero canvas as user scrolls past
gsap.to(canvas, {
  scrollTrigger: {
    trigger: '.hero',
    start: 'top top',
    end: '80% top',
    scrub: true
  },
  opacity: 0,
  ease: 'none'
});
