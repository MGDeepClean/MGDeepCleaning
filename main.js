// ===== PAGE LOADER LOGIC =====
window.addEventListener('load', () => {
    const loader = document.getElementById('preloader');
    if (loader) {
        setTimeout(() => {
            loader.classList.add('fade-out');
            // Remove from DOM after fade animation to free up resources
            setTimeout(() => {
                loader.remove();
            }, 800);
        }, 1500); // 1.5 second splash time as requested
    }
});

// ===== CUSTOM NOTIFICATION SYSTEM (TOAST) =====
function injectToastContainer() {
    if (document.getElementById('toast-container')) return;
    const container = document.createElement('div');
    container.id = 'toast-container';
    document.body.appendChild(container);
}

function showToast(message, type = 'success') {
    injectToastContainer();
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    const icon = type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle';
    
    toast.innerHTML = `
        <div class="toast-icon"><i class="fas ${icon}"></i></div>
        <div class="toast-content">${message}</div>
        <button class="toast-close"><i class="fas fa-times"></i></button>
    `;
    
    container.appendChild(toast);
    
    // Close button functionality
    toast.querySelector('.toast-close').addEventListener('click', () => {
        toast.classList.add('hiding');
        setTimeout(() => toast.remove(), 500);
    });
    
    // Auto-dismiss after 3 seconds
    setTimeout(() => {
        if (toast.parentNode) {
            toast.classList.add('hiding');
            setTimeout(() => toast.remove(), 500);
        }
    }, 3000);
}

// ===== SUCCESS MODAL & CONFETTI =====
function showSuccessModal() {
    const overlay = document.getElementById('success-overlay');
    if (!overlay) return;
    overlay.classList.add('show');
    spawnConfetti();
}

function closeSuccessModal() {
    const overlay = document.getElementById('success-overlay');
    if (overlay) overlay.classList.remove('show');
}

function spawnConfetti() {
    const colors = ['#F07C1A', '#2AACDC', '#27ae60', '#fff', '#ffd700'];
    for (let i = 0; i < 60; i++) {
        const p = document.createElement('div');
        p.className = 'confetti-particle';
        const color = colors[Math.floor(Math.random() * colors.length)];
        const startX = 50, startY = 50;
        const angle = Math.random() * Math.PI * 2;
        const velocity = 2 + Math.random() * 8;
        const vx = Math.cos(angle) * velocity;
        const vy = Math.sin(angle) * velocity;
        
        p.style.background = color;
        p.style.left = startX + '%';
        p.style.top = startY + '%';
        document.body.appendChild(p);

        let posX = startX, posY = startY, vvy = vy, vvx = vx;
        const animate = () => {
            posX += vvx * 0.1; posY += vvy * 0.1; vvy += 0.25; // gravity
            p.style.left = posX + '%'; p.style.top = posY + '%';
            if (posY < 110) requestAnimationFrame(animate);
            else p.remove();
        };
        requestAnimationFrame(animate);
    }
}

// ===== THEME TOGGLE (Local Storage) =====
const themeToggle = document.getElementById('theme-toggle');
const themeIcon = document.getElementById('theme-icon');
const savedTheme = localStorage.getItem('mg-theme');

if (savedTheme === 'light') {
    document.body.classList.add('light-mode');
    if (themeIcon) themeIcon.classList.replace('fa-sun', 'fa-moon');
}

if (themeToggle) {
    themeToggle.addEventListener('click', () => {
        document.body.classList.toggle('light-mode');
        if (document.body.classList.contains('light-mode')) {
            if (themeIcon) themeIcon.classList.replace('fa-sun', 'fa-moon');
            localStorage.setItem('mg-theme', 'light');
        } else {
            if (themeIcon) themeIcon.classList.replace('fa-moon', 'fa-sun');
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

if (cursor && ring) {
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
}

// ===== SPRAY PARTICLE EFFECT =====
const sprayCanvas = document.getElementById('spray-canvas');
if (sprayCanvas) {
    const sCtx = sprayCanvas.getContext('2d');
    sprayCanvas.width = window.innerWidth;
    sprayCanvas.height = window.innerHeight;
    const sprayParticles = [];
    let isInHero = false;

    const heroEl = document.getElementById('hero');
    if (heroEl) {
        heroEl.addEventListener('mouseenter', () => isInHero = true);
        heroEl.addEventListener('mouseleave', () => isInHero = false);
    }

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
}

// ===== SQUEEGEE WIPE REVEAL =====
function doWipeReveal() {
    const overlay = document.getElementById('wipe-overlay');
    if (!overlay) return;
    
    if (prefersReducedMotion) {
        overlay.style.display = 'none';
        if (document.getElementById('squeegee-bar')) document.getElementById('squeegee-bar').style.display = 'none';
        if (document.getElementById('squeegee-handle')) document.getElementById('squeegee-handle').style.display = 'none';
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
        if (panel) panel.style.transform = `scaleX(${1 - eased})`;
        if (bar) bar.style.left = pct + 'vw';
        if (handle) handle.style.left = `calc(${pct}vw - 20px)`;
        if (progress < 1) { requestAnimationFrame(step); }
        else {
            overlay.style.display = 'none';
            if (bar) bar.style.display = 'none'; 
            if (handle) handle.style.display = 'none';
        }
    }
    requestAnimationFrame(step);
}
window.addEventListener('load', () => {
    if (document.getElementById('wipe-overlay')) setTimeout(doWipeReveal, 300);
});

// ===== SCROLL FOAM BAR =====
const foamBar = document.getElementById('scroll-foam');
if (foamBar) {
    window.addEventListener('scroll', () => {
        const scrollTop = window.scrollY || document.documentElement.scrollTop;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        const pct = (scrollTop / docHeight) * 100;
        foamBar.style.width = pct + '%';
    }, { passive: true });
}

// ===== NAVBAR GLASS TRANSITION =====
const navbar = document.getElementById('navbar');
if (navbar) {
    window.addEventListener('scroll', () => {
        if (window.scrollY > 80) navbar.classList.add('scrolled');
        else navbar.classList.remove('scrolled');
    }, { passive: true });
}

// ===== TYPEWRITER EFFECT =====
const phrase = "We bring the sparkle back to your environment.";
const twEl = document.getElementById('typewriter-text');
let twIndex = 0;
function typeNext() {
    if (!twEl) return;
    if (twIndex <= phrase.length) {
        twEl.textContent = phrase.slice(0, twIndex);
        twIndex++;
        setTimeout(typeNext, twIndex < phrase.length ? 50 : 2000);
    } else {
        twIndex = 0; setTimeout(typeNext, 500);
    }
}
if (twEl) setTimeout(typeNext, 1600);

// ===== SOAP BUBBLE CANVAS =====
(function () {
    const canvas = document.getElementById('bubble-canvas');
    if (!canvas) return;
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
    if (!wrap) return;
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

// ===== INTERSECTION OBSERVER ANIMATIONS =====
const ioGeneral = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const el = entry.target;
            const delay = parseInt(el.dataset.delay) || 0;
            setTimeout(() => {
                el.classList.add('visible');
                if (!prefersReducedMotion && el.classList.contains('service-card')) {
                    setTimeout(() => el.classList.add('shining'), 100);
                    setTimeout(() => el.classList.remove('shining'), 700);
                }
            }, delay);
            ioGeneral.unobserve(el);
        }
    });
}, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

// Observe service cards, sections, and fade-up elements
document.querySelectorAll('.service-card, .section, .fade-up, .step-item, .pillar-card').forEach(el => ioGeneral.observe(el));

// 3D card tilt
document.querySelectorAll('.service-card').forEach(card => {
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

// Counter animation
const statEls = document.querySelectorAll('.stat-number[data-target]');
if (statEls.length > 0) {
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
}

// ===== HAMBURGER / MOBILE MENU =====
const hamburger = document.getElementById('hamburger');
const mobileMenu = document.getElementById('mobile-menu');
const mobileClose = document.getElementById('mobile-close');
if (hamburger && mobileMenu && mobileClose) {
    hamburger.addEventListener('click', () => mobileMenu.classList.toggle('open'));
    mobileClose.addEventListener('click', () => mobileMenu.classList.remove('open'));
    mobileMenu.querySelectorAll('a').forEach(a => a.addEventListener('click', () => mobileMenu.classList.remove('open')));
}

// ===== QUOTE FORM SUBMIT =====
async function handleFormSubmit(e) {
    e.preventDefault();

    const name = document.getElementById('quote-name')?.value;
    const phone = document.getElementById('quote-phone')?.value;
    if (!name || !phone) {
        showToast("Please provide at least your Name and Phone Number.", "error");
        return;
    }

    const btn = e.target.querySelector('.form-submit');
    if (!btn) return;

    btn.classList.add('loading');
    btn.disabled = true;

    const data = {
        name, phone,
        service: document.getElementById('quote-service')?.value,
        address: document.getElementById('quote-address')?.value,
        date: document.getElementById('quote-date')?.value,
        message: document.getElementById('quote-message')?.value
    };

    try {
        const response = await fetch(`${window.API_BASE}/api/quote`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        if (!response.ok) throw new Error("Failed");

        showSuccessModal();
        
        if (typeof e.target.reset === 'function') {
            e.target.reset();
        }

    } catch (err) {
        console.error(err);
        btn.innerHTML = '<i class="fas fa-exclamation-triangle"></i> Error Sending';
        btn.style.background = '#e74c3c';
    }

    setTimeout(() => { 
        btn.classList.remove('loading');
        btn.style.background = '';
        btn.disabled = false;
    }, 2000);
}
const quoteForm = document.getElementById('quote-form');
if (quoteForm) quoteForm.addEventListener('submit', handleFormSubmit);


// ===== SERVICE MODAL LOGIC =====
const serviceModal = document.getElementById('service-modal');
const modalClose = document.getElementById('modal-close');

if (serviceModal && modalClose) {
    document.querySelectorAll('.modal-trigger').forEach(trigger => {
        trigger.addEventListener('click', () => {
            const icon = trigger.querySelector('.service-icon')?.innerHTML;
            const tag = trigger.querySelector('.service-tag')?.textContent;
            const title = trigger.querySelector('.service-name')?.textContent;
            const desc = trigger.querySelector('.service-desc')?.textContent;

            document.getElementById('modal-icon').innerHTML = icon || '🧹';
            document.getElementById('modal-tag').textContent = tag || '';
            document.getElementById('modal-title').textContent = title || 'Cleaning Service';
            document.getElementById('modal-desc').textContent = desc || '';

            serviceModal.classList.add('show');
            document.body.style.overflow = 'hidden';
        });
    });

    modalClose.addEventListener('click', () => {
        serviceModal.classList.remove('show');
        document.body.style.overflow = '';
    });

    serviceModal.addEventListener('click', (e) => {
        if (e.target === serviceModal) {
            serviceModal.classList.remove('show');
            document.body.style.overflow = '';
        }
    });
}

// ===== DATE VALIDATION FOR QUOTE FORM =====
const quoteDateInput = document.getElementById('quote-date');
if (quoteDateInput) {
    const today = new Date().toISOString().split('T')[0];
    quoteDateInput.setAttribute('min', today);
}

// ===== HOMEPAGE DYNAMIC REVIEWS (DEDUPLICATED) =====
async function fetchHomepageReviews() {
    const testiTrack = document.getElementById('home-testimonial-track');
    const galleryTrack = document.getElementById('home-gallery-track');

    if (!testiTrack && !galleryTrack) return;

    // Show skeletons
    if (testiTrack) {
        testiTrack.innerHTML = Array(3).fill(`<div class="testi-card skeleton-card"><div class="skeleton skeleton-text"></div><div class="skeleton skeleton-text"></div><div class="skeleton skeleton-text short"></div></div>`).join('');
    }
    if (galleryTrack) {
        galleryTrack.innerHTML = Array(6).fill(`<div class="gallery-item skeleton-gallery-item skeleton"></div>`).join('');
    }

    try {
        const response = await fetch(`${window.API_BASE}/api/reviews`);
        const reviews = await response.json();

        if (reviews.length === 0) return;

        if (testiTrack) {
            const textReviews = reviews.filter(r => r.type === 'text').slice(0, 12);
            const html = textReviews.map(r => `
                <div class="testi-card">
                    <div class="testi-stars">${'★'.repeat(r.rating || 5)}${'☆'.repeat(5 - (r.rating || 5))}</div>
                    <div class="testi-text">"${r.text}"</div>
                    <div class="testi-author">
                        <div class="testi-avatar" style="background:linear-gradient(135deg,#F07C1A,#ff9a3c);">${r.customerName.charAt(0)}</div>
                        <div>
                            <div class="testi-name">${r.customerName}</div>
                            <div class="testi-loc">📍 ${r.category || 'Tirupati'}</div>
                        </div>
                    </div>
                </div>
            `).join('');
            
            testiTrack.innerHTML = html;
        }

        if (galleryTrack) {
            const imageReviews = reviews.filter(r => r.type === 'image').slice(0, 20);
            const html = imageReviews.map(r => `
                <div class="gallery-item">
                    <img src="${r.url}" alt="${r.customerName}" loading="lazy">
                </div>
            `).join('');
            galleryTrack.innerHTML = html;
        }

    } catch (e) {
        console.error("Homepage reviews fetch failed:", e);
    }
}


// ===== REVIEWS PAGE LOGIC =====
let allReviews = [];
let filteredReviews = [];
let currentPage = 1;
const itemsPerPage = 12;
let currentFilter = 'image';
let currentFormRating = 0;

function setRating(stars) {
    currentFormRating = stars;
    const input = document.getElementById('customer-rating');
    if (input) input.value = stars;
    const starElements = document.getElementById('modal-stars')?.children;
    if (starElements) {
        for(let i=0; i<5; i++) {
            starElements[i].className = i < stars ? 'fas fa-star text-orange transition' : 'fas fa-star text-gray-600 transition hover:text-orange';
        }
    }
}

function openReviewModal() {
    document.getElementById('review-modal')?.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
}

function hideSuccessModal() {
    const overlay = document.getElementById('success-overlay');
    if (overlay) overlay.classList.remove('show');
}

function showSuccessModal() {
    const overlay = document.getElementById('success-overlay');
    const lottie = document.getElementById('success-lottie');
    if (overlay) {
        overlay.classList.add('show');
        if (lottie) {
            lottie.seek(0);
            lottie.play();
        }
    }
}

async function submitCustomerReview(e) {
    e.preventDefault();
    if(!currentFormRating) {
        showToast("Please select a star rating!", "error");
        return;
    }
    const btn = e.target.querySelector('button[type="submit"]');
    btn.classList.add('loading');
    btn.disabled = true;

    try {
        const response = await fetch(`${window.API_BASE}/api/reviews/submit`, {
            method: 'POST',
            body: new FormData(e.target)
        });
        if (response.ok) {
            showToast("Thank you! Your review has been submitted and is pending admin approval.", "success");
            e.target.reset();
            setRating(0);
            closeReviewModal();
        } else { throw new Error('Failed'); }
    } catch (error) {
        showToast("Error submitting review. Please try again.", "error");
    } finally {
        btn.classList.remove('loading');
        btn.disabled = false;
    }
}

async function fetchReviews() {
    const grid = document.getElementById('reviews-grid');
    if (!grid) return;
    const loader = document.getElementById('reviews-loader');

    // Show grid skeletons
    grid.innerHTML = Array(8).fill(`<div class="skeleton-card"><div class="skeleton skeleton-text"></div><div class="skeleton skeleton-text"></div><div class="skeleton skeleton-text short"></div><div class="skeleton skeleton-gallery-item mt-4"></div></div>`).join('');

    try {
        const response = await fetch(`${window.API_BASE}/api/reviews`);
        allReviews = await response.json();
        if (allReviews.length === 0) {
            if(loader) loader.innerHTML = '<p class="text-gray-400">No reviews yet.</p>';
            return;
        }
        
        // Initial filter to 'image'
        updateFilter('image');
        
        if(loader) loader.style.display = 'none';
        grid.classList.remove('opacity-0');
        document.getElementById('pagination-controls')?.classList.remove('opacity-0');
    } catch (error) {
        if(loader) loader.innerHTML = '<p class="text-red-500">Failed to load reviews.</p>';
    }
}

function updateFilter(type) {
    currentFilter = type;
    
    // Update active UI
    document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
    document.getElementById('filter-' + type)?.classList.add('active');

    // Filter the reviews
    if (type === 'all') {
        filteredReviews = allReviews;
    } else if (type === 'youtube') {
        filteredReviews = allReviews.filter(r => r.type === 'youtube');
    } else if (type === 'image') {
        filteredReviews = allReviews.filter(r => r.type === 'image');
    } else if (type === 'text') {
        filteredReviews = allReviews.filter(r => r.type === 'text');
    }

    renderPage(1);
    updatePaginationControls();
}

function renderPage(page) {
    currentPage = page;
    const grid = document.getElementById('reviews-grid');
    if (!grid) return;
    const startIndex = (page - 1) * itemsPerPage;
    const pageReviews = filteredReviews.slice(startIndex, startIndex + itemsPerPage);

    grid.innerHTML = pageReviews.map((r, i) => {
        const globalIndex = startIndex + i;
        if (r.type === 'text') {
            const isLong = r.text.length > 150;
            return `
            <div class="review-text-card">
                <div class="review-stars">${getStars(r.rating || 5)}</div>
                <div class="review-content clamped">"${r.text}"</div>
                ${isLong ? `<span class="show-more-link" onclick="openReviewDetail(${globalIndex})">Show More</span>` : ''}
                <div class="review-author">
                    <div class="review-author-thumb">${r.customerName.charAt(0)}</div>
                    <div class="review-author-info">
                        <span class="review-author-name">${r.customerName}</span>
                        <span class="review-service-tag">${r.category}</span>
                    </div>
                </div>
            </div>`;
        } else if (r.type === 'youtube') {
            return `
            <div class="review-video-card">
                <iframe src="https://www.youtube.com/embed/${r.videoId}?rel=0" title="YouTube" allowfullscreen></iframe>
                <div class="absolute bottom-4 left-4 z-10 bg-black/60 px-3 py-1 rounded-full text-xs text-white">
                    Video Review
                </div>
            </div>`;
        } else {
            return `
            <div class="review-image-card bg-charcoal-light border border-white/5 rounded-2xl overflow-hidden shadow-2xl hover:border-orange/30 transition-all duration-300 group" onclick="openReviewDetail(${globalIndex})">
                <div class="relative h-full cursor-pointer">
                    <img src="${r.url}" class="w-full h-full object-cover group-hover:scale-105 transition-transform">
                    <div class="absolute inset-0 bg-gradient-to-t from-black/80 opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-6">
                        <div class="flex flex-col text-white">
                            <span class="font-bold">${r.customerName}</span>
                            <span class="bg-orange px-3 py-1 rounded-full text-xs font-bold w-max">${r.category}</span>
                        </div>
                    </div>
                </div>
            </div>`;
        }
    }).join('');
    
    updatePaginationControls();
}

function openReviewDetail(index) {
    const r = filteredReviews[index];
    if (!r) return;
    
    const modal = document.getElementById('review-detail-modal');
    const body = document.getElementById('review-detail-body');
    const authorWrap = document.getElementById('review-detail-author-wrap');
    
    if (!modal || !body || !authorWrap) return;

    if (r.type === 'image') {
        body.innerHTML = `<img src="${r.url}" class="w-full rounded-xl mb-6 shadow-xl"><p class="text-white">"${r.text}"</p>`;
    } else {
        body.innerHTML = `<p class="text-white text-xl">"${r.text}"</p>`;
    }

    authorWrap.innerHTML = `
        <div class="review-author mt-8 pt-6 border-t border-white/10">
            <div class="review-author-thumb" style="width:40px; height:40px; font-size:1rem;">${r.customerName.charAt(0)}</div>
            <div class="review-author-info">
                <div class="review-stars mb-1">${getStars(r.rating || 5)}</div>
                <span class="review-author-name text-white font-bold">${r.customerName}</span>
                <span class="review-service-tag">${r.category}</span>
            </div>
        </div>
    `;

    modal.classList.add('show');
    document.body.style.overflow = 'hidden';
}

function closeReviewDetail() {
    const modal = document.getElementById('review-detail-modal');
    if (modal) modal.classList.remove('show');
    document.body.style.overflow = '';
}

function updatePaginationControls() {
    const prevBtn = document.getElementById('prev-page');
    const nextBtn = document.getElementById('next-page');
    const pageNumbers = document.getElementById('page-numbers');
    if (!prevBtn || !nextBtn || !pageNumbers) return;

    const totalPages = Math.ceil(filteredReviews.length / itemsPerPage);
    
    prevBtn.disabled = currentPage === 1;
    nextBtn.disabled = currentPage === totalPages || totalPages === 0;

    pageNumbers.innerHTML = '';
    for (let i = 1; i <= totalPages; i++) {
        const btn = document.createElement('button');
        btn.innerText = i;
        btn.className = `pagination-number ${i === currentPage ? 'active' : ''}`;
        btn.onclick = () => renderPage(i);
        pageNumbers.appendChild(btn);
    }
}

function getStars(rating) {
    let s = ''; for(let i=0; i<5; i++) s += i < rating ? '<i class="fas fa-star"></i>' : '<i class="far fa-star"></i>';
    return s;
}

// ===== INITIALIZATION =====
window.addEventListener('load', () => {
    // Check which page we are on
    if (document.getElementById('home-testimonial-track')) fetchHomepageReviews();
    if (document.getElementById('reviews-grid')) fetchReviews();
});

// Global pagination listeners
if (document.getElementById('prev-page')) {
    document.getElementById('prev-page').onclick = () => { if (currentPage > 1) renderPage(currentPage - 1); };
    document.getElementById('next-page').onclick = () => { if (currentPage < Math.ceil(allReviews.length/itemsPerPage)) renderPage(currentPage + 1); };
}

// ===== REGISTER SERVICE WORKER (PWA) WITH AUTO-UPDATE =====
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        // Register the Service Worker
        navigator.serviceWorker.register('/sw.js?v=1.1')
            .then(reg => {
                console.log('🚀 MG Deep Clean: Service Worker Registered');
                
                // If there's an update, skip waiting and refresh
                reg.onupdatefound = () => {
                    const installingWorker = reg.installing;
                    installingWorker.onstatechange = () => {
                        if (installingWorker.state === 'installed' && navigator.serviceWorker.controller) {
                            console.log('🔄 New version found! Force refreshing...');
                            window.location.reload();
                        }
                    };
                };
            })
            .catch(err => console.log('❌ Service Worker Register Error:', err));
    });
}
