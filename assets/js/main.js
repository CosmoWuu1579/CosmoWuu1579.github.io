// ============================================================
// Cosmo Wu — site-wide JS
// Starfield, scroll progress, card spotlight, reveal animations,
// theme toggle, nav helpers.
// ============================================================

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// ------------------------------------------------------------
// Starfield — twinkling stars with mouse parallax + shooting stars
// ------------------------------------------------------------
(function () {
    if (prefersReducedMotion) return;

    const canvas = document.createElement('canvas');
    canvas.className = 'starfield';
    canvas.setAttribute('aria-hidden', 'true');
    document.body.prepend(canvas);

    const ctx = canvas.getContext('2d');
    let stars = [];
    let shooting = [];
    let w = 0, h = 0;
    let mouseX = 0, mouseY = 0;      // -0.5 … 0.5, eased
    let targetX = 0, targetY = 0;
    let running = true;

    function resize() {
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        w = window.innerWidth;
        h = window.innerHeight;
        canvas.width = w * dpr;
        canvas.height = h * dpr;
        canvas.style.width = w + 'px';
        canvas.style.height = h + 'px';
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        seed();
    }

    function seed() {
        const count = Math.min(220, Math.floor((w * h) / 6500));
        stars = Array.from({ length: count }, () => ({
            x: Math.random() * w,
            y: Math.random() * h,
            r: Math.random() * 1.3 + 0.3,
            depth: Math.random() * 0.9 + 0.1,          // parallax layer
            phase: Math.random() * Math.PI * 2,        // twinkle offset
            speed: Math.random() * 0.9 + 0.4,          // twinkle speed
            hue: Math.random() < 0.12 ? 'accent' : (Math.random() < 0.3 ? 'cyan' : 'white')
        }));
    }

    function starColor(hue, alpha) {
        if (hue === 'cyan')   return `rgba(140, 235, 250, ${alpha})`;
        if (hue === 'accent') return `rgba(196, 165, 250, ${alpha})`;
        return `rgba(230, 236, 250, ${alpha})`;
    }

    function spawnShootingStar() {
        shooting.push({
            x: Math.random() * w * 0.8 + w * 0.1,
            y: Math.random() * h * 0.35,
            vx: -(Math.random() * 6 + 7),
            vy: Math.random() * 3 + 2.5,
            life: 1
        });
    }

    let t = 0;
    let lastShoot = 0;

    function frame(now) {
        if (!running) return;
        t += 0.016;
        ctx.clearRect(0, 0, w, h);

        mouseX += (targetX - mouseX) * 0.04;
        mouseY += (targetY - mouseY) * 0.04;

        for (const s of stars) {
            const tw = 0.55 + 0.45 * Math.sin(t * s.speed + s.phase);
            const px = s.x + mouseX * 30 * s.depth;
            const py = s.y + mouseY * 30 * s.depth;
            ctx.beginPath();
            ctx.arc(px, py, s.r, 0, Math.PI * 2);
            ctx.fillStyle = starColor(s.hue, (0.25 + 0.6 * tw) * s.depth);
            ctx.fill();
        }

        // Occasional shooting star (dark theme reads best, but harmless in light)
        if (now - lastShoot > 6000 && Math.random() < 0.01) {
            spawnShootingStar();
            lastShoot = now;
        }

        for (let i = shooting.length - 1; i >= 0; i--) {
            const m = shooting[i];
            m.x += m.vx;
            m.y += m.vy;
            m.life -= 0.018;
            if (m.life <= 0 || m.x < -80 || m.y > h + 80) {
                shooting.splice(i, 1);
                continue;
            }
            const grad = ctx.createLinearGradient(m.x, m.y, m.x - m.vx * 9, m.y - m.vy * 9);
            grad.addColorStop(0, `rgba(190, 240, 255, ${0.85 * m.life})`);
            grad.addColorStop(1, 'rgba(190, 240, 255, 0)');
            ctx.strokeStyle = grad;
            ctx.lineWidth = 1.6;
            ctx.beginPath();
            ctx.moveTo(m.x, m.y);
            ctx.lineTo(m.x - m.vx * 9, m.y - m.vy * 9);
            ctx.stroke();
        }

        requestAnimationFrame(frame);
    }

    window.addEventListener('resize', resize);
    window.addEventListener('pointermove', (e) => {
        targetX = e.clientX / w - 0.5;
        targetY = e.clientY / h - 0.5;
    }, { passive: true });

    document.addEventListener('visibilitychange', () => {
        const wasRunning = running;
        running = !document.hidden;
        if (running && !wasRunning) requestAnimationFrame(frame);
    });

    resize();
    requestAnimationFrame(frame);
})();

// ------------------------------------------------------------
// Scroll progress bar
// ------------------------------------------------------------
(function () {
    const bar = document.createElement('div');
    bar.className = 'scroll-progress';
    bar.setAttribute('aria-hidden', 'true');
    document.body.prepend(bar);

    let ticking = false;
    function update() {
        const max = document.documentElement.scrollHeight - window.innerHeight;
        const p = max > 0 ? window.scrollY / max : 0;
        bar.style.transform = `scaleX(${Math.min(1, Math.max(0, p))})`;
        ticking = false;
    }
    window.addEventListener('scroll', () => {
        if (!ticking) { ticking = true; requestAnimationFrame(update); }
    }, { passive: true });
    update();
})();

// ------------------------------------------------------------
// Card spotlight — cursor-following glow on cards
// ------------------------------------------------------------
(function () {
    if (prefersReducedMotion) return;
    const selector = '.card, .post-card, .skill-category, .award';
    document.addEventListener('pointermove', (e) => {
        const el = e.target.closest && e.target.closest(selector);
        if (!el) return;
        const rect = el.getBoundingClientRect();
        el.style.setProperty('--mx', ((e.clientX - rect.left) / rect.width * 100) + '%');
        el.style.setProperty('--my', ((e.clientY - rect.top) / rect.height * 100) + '%');
    }, { passive: true });
})();

// ------------------------------------------------------------
// Rotating word in the hero (element with [data-rotate])
// ------------------------------------------------------------
(function () {
    const el = document.querySelector('[data-rotate]');
    if (!el) return;
    let words;
    try { words = JSON.parse(el.getAttribute('data-rotate')); } catch (_) { return; }
    if (!Array.isArray(words) || words.length === 0) return;

    if (prefersReducedMotion) { el.textContent = words[0]; return; }

    let wordIdx = 0, charIdx = 0, deleting = false;

    function tick() {
        const word = words[wordIdx];
        charIdx += deleting ? -1 : 1;
        el.textContent = word.slice(0, charIdx);

        let delay = deleting ? 40 : 75;
        if (!deleting && charIdx === word.length) {
            delay = 2200;                      // pause on the full word
            deleting = true;
        } else if (deleting && charIdx === 0) {
            deleting = false;
            wordIdx = (wordIdx + 1) % words.length;
            delay = 350;
        }
        setTimeout(tick, delay);
    }
    tick();
})();

// ------------------------------------------------------------
// Smooth-scroll for in-page anchors
// ------------------------------------------------------------
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        const href = this.getAttribute('href');
        if (href === '#' || href.length < 2) return;
        const target = document.querySelector(href);
        if (target) {
            e.preventDefault();
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    });
});

// ------------------------------------------------------------
// Animate elements on scroll (staggered within each parent)
// ------------------------------------------------------------
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('animate-in');
            observer.unobserve(entry.target);
        }
    });
}, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

function observeReveals(root) {
    const els = (root || document).querySelectorAll('.card, .skill-category, .award, .post-card, .update-item');
    els.forEach(el => {
        if (el.classList.contains('animate-in')) return;
        const siblings = el.parentElement ? Array.from(el.parentElement.children) : [el];
        el.style.setProperty('--stagger', Math.min(siblings.indexOf(el), 8));
        observer.observe(el);
    });
}
observeReveals(document);
// Expose for pages that render content from JSON after load
window.observeReveals = observeReveals;

// ------------------------------------------------------------
// Highlight active nav link based on current path
// ------------------------------------------------------------
(function () {
    const rawPath = window.location.pathname;
    const path = rawPath.endsWith('/') ? rawPath : rawPath + '/';
    document.querySelectorAll('.nav-links a').forEach(link => {
        const href = link.getAttribute('href');
        if (!href) return;
        const target = href.endsWith('/') ? href : href + '/';
        if (target === '/') {
            if (path === '/') link.classList.add('active');
        } else if (path === target || path.startsWith(target)) {
            link.classList.add('active');
        }
    });
})();

// ------------------------------------------------------------
// Intercept clicks to the current page — scroll to top instead of a no-op nav.
// Without this, clicking the logo/About on the page you're already on can leave a stale
// "/index.html" in the URL bar (browser doesn't always re-canonicalize on same-page nav).
// ------------------------------------------------------------
(function () {
    const normalize = (p) => p.endsWith('/') ? p : p + '/';

    document.querySelectorAll('.nav a').forEach(link => {
        const href = link.getAttribute('href');
        if (!href) return;
        if (href.startsWith('http') || href.startsWith('mailto') || href.startsWith('#')) return;

        link.addEventListener('click', (e) => {
            const here = normalize(window.location.pathname.replace(/index\.html$/, ''));
            const target = normalize(href);
            if (here === target) {
                e.preventDefault();
                window.scrollTo({ top: 0, behavior: 'smooth' });
                history.replaceState(null, '', target);
            }
        });
    });
})();

// ------------------------------------------------------------
// Theme toggle — initial paint is set by an inline script in <head> to prevent FOUC
// ------------------------------------------------------------
(function () {
    const toggle = document.getElementById('theme-toggle');
    if (!toggle) return;

    toggle.addEventListener('click', () => {
        const current = document.documentElement.getAttribute('data-theme') || 'light';
        const next = current === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', next);
        try { localStorage.setItem('theme', next); } catch (_) {}
    });

    // If the user hasn't picked a theme, follow system changes live
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    mq.addEventListener('change', (e) => {
        try {
            if (localStorage.getItem('theme')) return;
        } catch (_) {}
        document.documentElement.setAttribute('data-theme', e.matches ? 'dark' : 'light');
    });
})();
