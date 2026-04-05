// ===== THEME TOGGLE (Local Storage) =====
const themeToggle = document.getElementById('theme-toggle');
const themeIcon = document.getElementById('theme-icon');
const savedTheme = localStorage.getItem('mg-theme');
// Initial load check
if (savedTheme === 'light') {
    document.body.classList.add('light-mode');
    if (themeIcon) themeIcon.classList.replace('fa-sun', 'fa-moon');
}
if (themeToggle) {
    themeToggle.addEventListener('click', () => {
        document.body.classList.toggle('light-mode');
        if (document.body.classList.contains('light-mode')) {
            themeIcon.classList.replace('fa-sun', 'fa-moon');
            localStorage.setItem('mg-theme', 'light');
        } else {
            themeIcon.classList.replace('fa-moon', 'fa-sun');
            localStorage.setItem('mg-theme', 'dark');
        }
    });
}

// ===== PREFERS REDUCED MOTION =====
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// ===== CUSTOM CURSOR =====
const cursor = document.getElementById('custom-cursor');
const ring = document.getElementById('cursor-ring');
let mouseX = 0, mouseY = 0, ringX = 0, ringY = 0;

document.addEventListener('mousemove', e => {
    mouseX = e.clientX; mouseY = e.clientY;
    cursor.style.left = mouseX + 'px'; cursor.style.top = mouseY + 'px';
});

function animateRing() {
    ringX += (mouseX - ringX) * 0.15;
    ringY += (mouseY - ringY) * 0.15;
    ring.style.left = ringX + 'px'; ring.style.top = ringY + 'px';
    requestAnimationFrame(animateRing);
}
animateRing();

document.querySelectorAll('a,button,.service-card,.ba-handle,.ba-slider-line').forEach(el => {
    el.addEventListener('mouseenter', () => { cursor.classList.add('big'); });
    el.addEventListener('mouseleave', () => { cursor.classList.remove('big'); });
});

// ===== SPRAY PARTICLE EFFECT =====
const sprayCanvas = document.getElementById('spray-canvas');
const sCtx = sprayCanvas.getContext('2d');
sprayCanvas.width = window.innerWidth;
sprayCanvas.height = window.innerHeight;
const sprayParticles = [];
let isInHero = false;

const heroEl = document.getElementById('hero');
heroEl.addEventListener('mouseenter', () => isInHero = true);
heroEl.addEventListener('mouseleave', () => isInHero = false);

document.addEventListener('mousemove', e => {
    if (!isInHero || prefersReducedMotion) return;
    for (let i = 0; i < 3; i++) {
        sprayParticles.push({
            x: e.clientX, y: e.clientY,
            vx: (Math.random() - 0.5) * 3,
            vy: (Math.random() - 1.5) * 2,
            alpha: 0.6 + Math.random() * 0.4,
            size: Math.random() * 4 + 1,
            life: 1
        });
    }
});

function drawSpray() {
    sCtx.clearRect(0, 0, sprayCanvas.width, sprayCanvas.height);
    for (let i = sprayParticles.length - 1; i >= 0; i--) {
        const p = sprayParticles[i];
        p.x += p.vx; p.y += p.vy; p.vy += 0.05;
        p.life -= 0.04; p.alpha = p.life * 0.6;
        if (p.life <= 0) { sprayParticles.splice(i, 1); continue; }
        sCtx.beginPath();
        sCtx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        sCtx.fillStyle = `rgba(42,172,220,${p.alpha})`;
        sCtx.fill();
    }
    requestAnimationFrame(drawSpray);
}
drawSpray();

// ===== SQUEEGEE WIPE REVEAL =====
function doWipeReveal() {
    if (prefersReducedMotion) {
        document.getElementById('wipe-overlay').style.display = 'none';
        document.getElementById('squeegee-bar').style.display = 'none';
        document.getElementById('squeegee-handle').style.display = 'none';
        return;
    }
    const panel = document.getElementById('wipe-panel');
    const bar = document.getElementById('squeegee-bar');
    const handle = document.getElementById('squeegee-handle');
    const duration = 1200;
    const start = performance.now();

    function step(now) {
        const elapsed = now - start;
        const progress = Math.min(elapsed / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        const pct = eased * 100;
        panel.style.transform = `scaleX(${1 - eased})`;
        panel.style.transformOrigin = 'left center';
        bar.style.left = pct + 'vw';
        handle.style.left = `calc(${pct}vw - 20px)`;
        if (progress < 1) { requestAnimationFrame(step); }
        else {
            document.getElementById('wipe-overlay').style.display = 'none';
            bar.style.display = 'none'; handle.style.display = 'none';
        }
    }
    requestAnimationFrame(step);
}
window.addEventListener('load', () => setTimeout(doWipeReveal, 300));

// ===== SCROLL FOAM BAR =====
const foamBar = document.getElementById('scroll-foam');
window.addEventListener('scroll', () => {
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const pct = (scrollTop / docHeight) * 100;
    foamBar.style.width = pct + '%';
}, { passive: true });

// ===== NAVBAR GLASS TRANSITION =====
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
    if (window.scrollY > 80) navbar.classList.add('scrolled');
    else navbar.classList.remove('scrolled');
}, { passive: true });

// ===== TYPEWRITER EFFECT =====
const phrase = "We bring the sparkle back to your environment.";
const twEl = document.getElementById('typewriter-text');
let twIndex = 0;
function typeNext() {
    if (twIndex <= phrase.length) {
        twEl.textContent = phrase.slice(0, twIndex);
        twIndex++;
        setTimeout(typeNext, twIndex < phrase.length ? 50 : 2000);
    } else {
        twIndex = 0; setTimeout(typeNext, 500);
    }
}
setTimeout(typeNext, 1600);

// ===== SOAP BUBBLE CANVAS =====
(function () {
    const canvas = document.getElementById('bubble-canvas');
    const ctx = canvas.getContext('2d');
    function resize() { canvas.width = canvas.offsetWidth; canvas.height = canvas.offsetHeight; }
    resize();
    window.addEventListener('resize', resize, { passive: true });

    const bubbles = [];
    const N = prefersReducedMotion ? 0 : 20;
    for (let i = 0; i < N; i++) {
        bubbles.push(newBubble(canvas));
    }
    function newBubble(c, fromBottom = false) {
        const r = 8 + Math.random() * 28;
        return {
            x: r + Math.random() * (c.width - r * 2),
            y: fromBottom ? c.height + r : (Math.random() * c.height),
            r, vx: (Math.random() - 0.5) * 0.3, vy: -0.3 - Math.random() * 0.5,
            wobble: Math.random() * Math.PI * 2, wobbleSpeed: 0.02 + Math.random() * 0.02,
            alpha: 0.15 + Math.random() * 0.25,
            popping: false, popScale: 1, hue: Math.random() > 0.5 ? 200 : 30
        };
    }
    function drawBubble(b) {
        ctx.save();
        ctx.translate(b.x, b.y);
        ctx.scale(b.popScale, b.popScale);
        const g = ctx.createRadialGradient(-b.r * 0.3, -b.r * 0.3, b.r * 0.1, 0, 0, b.r);
        g.addColorStop(0, `hsla(${b.hue},80%,90%,${b.alpha * 0.8})`);
        g.addColorStop(0.5, `hsla(${b.hue},60%,70%,${b.alpha * 0.3})`);
        g.addColorStop(1, `hsla(${b.hue},60%,60%,${b.alpha * 0.5})`);
        ctx.beginPath(); ctx.arc(0, 0, b.r, 0, Math.PI * 2);
        ctx.fillStyle = g; ctx.fill();
        ctx.strokeStyle = `hsla(${b.hue},80%,90%,${b.alpha * 0.6})`;
        ctx.lineWidth = 1; ctx.stroke();
        ctx.restore();
    }
    function animateBubbles() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        for (let i = bubbles.length - 1; i >= 0; i--) {
            const b = bubbles[i];
            if (b.popping) {
                b.popScale += 0.08; b.alpha -= 0.06;
                if (b.alpha <= 0) { bubbles.splice(i, 1); bubbles.push(newBubble(canvas, true)); continue; }
            } else {
                b.wobble += b.wobbleSpeed;
                b.x += b.vx + Math.sin(b.wobble) * 0.4;
                b.y += b.vy;
                if (b.y < -b.r) { b.popping = true; }
            }
            drawBubble(b);
        }
        requestAnimationFrame(animateBubbles);
    }
    animateBubbles();
})();

// ===== BEFORE/AFTER SLIDER =====
(function () {
    const wrap = document.getElementById('ba-wrap');
    const after = document.getElementById('ba-after');
    const slider = document.getElementById('ba-slider');
    let dragging = false, pct = 50;

    function setPos(x) {
        const rect = wrap.getBoundingClientRect();
        pct = Math.max(5, Math.min(95, ((x - rect.left) / rect.width) * 100));
        slider.style.left = pct + '%';
        after.style.clipPath = `inset(0 ${100 - pct}% 0 0)`;
    }
    slider.addEventListener('mousedown', e => { dragging = true; e.preventDefault(); });
    slider.addEventListener('touchstart', e => { dragging = true; }, { passive: true });
    document.addEventListener('mousemove', e => { if (dragging) setPos(e.clientX); });
    document.addEventListener('touchmove', e => { if (dragging) setPos(e.touches[0].clientX); }, { passive: true });
    document.addEventListener('mouseup', () => dragging = false);
    document.addEventListener('touchend', () => dragging = false);
    wrap.addEventListener('click', e => setPos(e.clientX));
})();

// ===== WATER RIPPLE ON BUTTONS =====
function addRipple(btn) {
    btn.addEventListener('click', function (e) {
        const rect = this.getBoundingClientRect();
        const x = e.clientX - rect.left, y = e.clientY - rect.top;
        const r = document.createElement('span');
        r.className = 'ripple';
        const size = Math.max(rect.width, rect.height) * 2;
        r.style.cssText = `width:${size}px;height:${size}px;left:${x - size / 2}px;top:${y - size / 2}px;`;
        this.appendChild(r);
        setTimeout(() => r.remove(), 700);
    });
}
document.querySelectorAll('.btn-primary,.btn-secondary,.form-submit').forEach(addRipple);

// ===== INTERSECTION OBSERVER =====
const ioOpts = { threshold: 0.15, rootMargin: '0px 0px -50px 0px' };

// Service cards
const serviceCards = document.querySelectorAll('.service-card');
const cardObs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const el = entry.target;
            const delay = parseInt(el.dataset.delay) || 0;
            setTimeout(() => {
                el.classList.add('visible');
                // Shine sweep
                if (!prefersReducedMotion) {
                    setTimeout(() => el.classList.add('shining'), 100);
                    setTimeout(() => el.classList.remove('shining'), 700);
                }
            }, delay);
            cardObs.unobserve(el);
        }
    });
}, ioOpts);
serviceCards.forEach(c => cardObs.observe(c));

// 3D card tilt
serviceCards.forEach(card => {
    card.addEventListener('mousemove', function (e) {
        if (prefersReducedMotion) return;
        const rect = this.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width - 0.5;
        const y = (e.clientY - rect.top) / rect.height - 0.5;
        this.style.setProperty('--rx', (-y * 12) + 'deg');
        this.style.setProperty('--ry', (x * 12) + 'deg');
    });
    card.addEventListener('mouseleave', function () {
        this.style.setProperty('--rx', '0deg');
        this.style.setProperty('--ry', '0deg');
    });
});

// Steps
['step1', 'step2', 'step3', 'conn1', 'conn2'].forEach(id => {
    const el = document.getElementById(id);
    if (!el) return;
    const obs = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) { entry.target.classList.add('visible'); obs.unobserve(entry.target); }
        });
    }, { threshold: 0.3 });
    obs.observe(el);
});

// Pillar cards
const pillars = document.querySelectorAll('.pillar-card');
const pillarObs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
        if (entry.isIntersecting) { entry.target.classList.add('visible'); pillarObs.unobserve(entry.target); }
    });
}, ioOpts);
pillars.forEach(p => pillarObs.observe(p));

// Fade-up
const fadeEls = document.querySelectorAll('.fade-up');
const fadeObs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
        if (entry.isIntersecting) { entry.target.classList.add('visible'); fadeObs.unobserve(entry.target); }
    });
}, { threshold: 0.1 });
fadeEls.forEach(el => fadeObs.observe(el));

// ===== COUNTER ANIMATION =====
const statEls = document.querySelectorAll('.stat-number[data-target]');
const statObs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        const target = parseInt(el.dataset.target);
        const suffix = el.dataset.suffix || '';
        const duration = 1500; const start = performance.now();
        function tick(now) {
            const elapsed = now - start;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            el.textContent = Math.round(eased * target) + suffix;
            if (progress < 1) requestAnimationFrame(tick);
        }
        requestAnimationFrame(tick);
        statObs.unobserve(el);
    });
}, { threshold: 0.5 });
statEls.forEach(el => statObs.observe(el));

// ===== DUST PARTICLES =====
(function () {
    const canvas = document.getElementById('dust-canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth; canvas.height = window.innerHeight;
    window.addEventListener('resize', () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; }, { passive: true });

    if (prefersReducedMotion) return;
    const dusts = [];
    for (let i = 0; i < 60; i++) {
        dusts.push({
            x: Math.random() * window.innerWidth,
            y: Math.random() * window.innerHeight,
            r: Math.random() * 3 + 0.5,
            vx: (Math.random() - 0.5) * 0.5,
            vy: (Math.random() - 0.5) * 0.5,
            alpha: 0.1 + Math.random() * 0.3,
            swept: false, sweepTarget: null
        });
    }
    let sweep = false;
    window.addEventListener('scroll', () => { if (window.scrollY > 400) sweep = true; else sweep = false; }, { passive: true });

    function animateDust() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        dusts.forEach(d => {
            if (sweep && !d.swept) {
                if (!d.sweepTarget) d.sweepTarget = { x: canvas.width + 50, y: canvas.height + 50 };
                d.x += (d.sweepTarget.x - d.x) * 0.015;
                d.y += (d.sweepTarget.y - d.y) * 0.015;
                d.alpha *= 0.995;
                if (d.alpha < 0.01) { d.swept = true; }
            } else if (!sweep) {
                d.x += d.vx; d.y += d.vy;
                if (d.x < 0) d.x = canvas.width; if (d.x > canvas.width) d.x = 0;
                if (d.y < 0) d.y = canvas.height; if (d.y > canvas.height) d.y = 0;
                if (d.swept) { d.swept = false; d.alpha = 0.1 + Math.random() * 0.3; d.sweepTarget = null; }
                d.alpha = Math.min(d.alpha + (0.1 + Math.random() * 0.3 - d.alpha) * 0.1, 0.35);
            }
            ctx.beginPath(); ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(200,200,200,${d.alpha})`; ctx.fill();
        });
        requestAnimationFrame(animateDust);
    }
    animateDust();
})();

// ===== HAMBURGER / MOBILE MENU =====
const hamburger = document.getElementById('hamburger');
const mobileMenu = document.getElementById('mobile-menu');
const mobileClose = document.getElementById('mobile-close');
hamburger.addEventListener('click', () => mobileMenu.classList.toggle('open'));
mobileClose.addEventListener('click', () => mobileMenu.classList.remove('open'));
mobileMenu.querySelectorAll('a').forEach(a => a.addEventListener('click', () => mobileMenu.classList.remove('open')));

// ===== FORM SUBMIT =====
function handleFormSubmit(e) {
    e.preventDefault();
    const btn = document.querySelector('.form-submit');
    const original = btn.innerHTML;
    btn.innerHTML = '<i class="fas fa-check"></i> Thank you! We\'ll call you soon.';
    btn.style.background = 'linear-gradient(135deg,#27ae60,#2ecc71)';
    setTimeout(() => { btn.innerHTML = original; btn.style.background = ''; }, 4000);
}

// ===== RESIZE HANDLERS =====
window.addEventListener('resize', () => {
    sprayCanvas.width = window.innerWidth; sprayCanvas.height = window.innerHeight;
}, { passive: true });

console.log('%cMG Deep Cleaning Services 🧹', 'color:#F07C1A;font-family:Oswald;font-size:24px;font-weight:bold;');
console.log('%cTirupati, A.P. | +91 7337289189', 'color:#2AACDC;font-size:14px;');

// ===== SERVICE MODAL LOGIC =====
const serviceModal = document.getElementById('service-modal');
const modalClose = document.getElementById('modal-close');
const modalBookBtn = document.getElementById('modal-book');

if (serviceModal) {
    const triggers = document.querySelectorAll('.modal-trigger');

    triggers.forEach(card => {
        card.addEventListener('click', () => {
            // Only trigger modal on mobile screens (<768px) and if it's visible or all screens if intended
            // We'll trigger on all screens to guarantee consistency with the new UI change
            const icon = card.querySelector('.service-icon').textContent;
            const iconColor = card.querySelector('.service-icon').style.color || 'var(--orange)';
            const tag = card.querySelector('.service-tag').textContent;
            const name = card.querySelector('.service-name').textContent;
            const desc = card.querySelector('.service-desc').textContent;

            document.getElementById('modal-icon').innerText = icon;
            document.getElementById('modal-icon').style.color = iconColor;
            document.getElementById('modal-tag').innerText = tag;
            document.getElementById('modal-title').innerText = name;
            document.getElementById('modal-desc').innerText = desc;

            serviceModal.classList.add('active');
            document.body.style.overflow = 'hidden'; // Prevent background scrolling
        });
    });

    function closeModal() {
        serviceModal.classList.remove('active');
        document.body.style.overflow = '';
    }

    modalClose.addEventListener('click', closeModal);
    modalBookBtn.addEventListener('click', closeModal);

    serviceModal.addEventListener('click', e => {
        if (e.target === serviceModal) {
            closeModal();
        }
    });

    // Close on escape key
    document.addEventListener('keydown', e => {
        if (e.key === 'Escape' && serviceModal.classList.contains('active')) {
            closeModal();
        }
    });
}
