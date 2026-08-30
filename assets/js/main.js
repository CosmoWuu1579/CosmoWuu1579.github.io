// ============================================================
// Cosmo Wu — site-wide JS
// Constellation background, robot companion, scroll progress,
// card spotlight, reveal animations, theme toggle.
// ============================================================

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// ------------------------------------------------------------
// Constellation — drifting particles linked into a living network,
// with twinkle, cursor-linking, parallax and shooting stars.
// ------------------------------------------------------------
(function () {
    if (prefersReducedMotion) return;

    const canvas = document.createElement('canvas');
    canvas.className = 'starfield';
    canvas.setAttribute('aria-hidden', 'true');
    document.body.prepend(canvas);

    const ctx = canvas.getContext('2d');
    const LINK_DIST = 130;
    const MOUSE_DIST = 190;

    let particles = [];
    let shooting = [];
    let w = 0, h = 0;
    let mx = -9999, my = -9999;          // cursor position (canvas coords)
    let px = 0, py = 0;                  // eased parallax (-0.5 … 0.5)
    let tx = 0, ty = 0;
    let running = true;
    let t = 0;
    let lastShoot = 0;

    function isDark() {
        return document.documentElement.getAttribute('data-theme') === 'dark';
    }

    // [r,g,b] palettes — phosphor teal + ice blue, with rare magenta stars
    function palette() {
        return isDark()
            ? { dots: [[95, 242, 211], [143, 184, 255], [255, 92, 158], [230, 240, 250]], line: '143,184,255', mouse: '95,242,211', dotBoost: 1 }
            : { dots: [[10, 138, 114], [59, 98, 196], [178, 40, 105], [60, 80, 120]], line: '59,98,196', mouse: '10,138,114', dotBoost: 0.9 };
    }

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
        const count = Math.max(70, Math.min(150, Math.floor((w * h) / 11000)));
        particles = Array.from({ length: count }, () => ({
            x: Math.random() * w,
            y: Math.random() * h,
            vx: (Math.random() - 0.5) * 0.28,
            vy: (Math.random() - 0.5) * 0.28,
            r: Math.random() * 1.5 + 0.8,
            depth: Math.random() * 0.7 + 0.3,
            phase: Math.random() * Math.PI * 2,
            speed: Math.random() * 0.9 + 0.4,
            // weighted: mostly teal/ice/white, magenta stars are rare
            c: (r => r < 0.38 ? 0 : r < 0.72 ? 1 : r < 0.82 ? 2 : 3)(Math.random())
        }));
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

    function frame(now) {
        if (!running) return;
        t += 0.016;
        const pal = palette();
        ctx.clearRect(0, 0, w, h);

        px += (tx - px) * 0.04;
        py += (ty - py) * 0.04;

        // move + draw particles
        for (const p of particles) {
            p.x += p.vx;
            p.y += p.vy;
            if (p.x < -20) p.x = w + 20; else if (p.x > w + 20) p.x = -20;
            if (p.y < -20) p.y = h + 20; else if (p.y > h + 20) p.y = -20;

            const tw = 0.55 + 0.45 * Math.sin(t * p.speed + p.phase);
            const [r, g, b] = pal.dots[p.c];
            const dx = p.x + px * 26 * p.depth;
            const dy = p.y + py * 26 * p.depth;
            ctx.beginPath();
            ctx.arc(dx, dy, p.r, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(${r},${g},${b},${(0.35 + 0.55 * tw) * p.depth * pal.dotBoost})`;
            ctx.fill();
        }

        // link nearby particles into constellations
        for (let i = 0; i < particles.length; i++) {
            const a = particles[i];
            for (let j = i + 1; j < particles.length; j++) {
                const b = particles[j];
                const dx = a.x - b.x, dy = a.y - b.y;
                const d2 = dx * dx + dy * dy;
                if (d2 < LINK_DIST * LINK_DIST) {
                    const alpha = (1 - Math.sqrt(d2) / LINK_DIST) * 0.22;
                    ctx.strokeStyle = `rgba(${pal.line},${alpha})`;
                    ctx.lineWidth = 1;
                    ctx.beginPath();
                    ctx.moveTo(a.x, a.y);
                    ctx.lineTo(b.x, b.y);
                    ctx.stroke();
                }
            }
            // link to cursor — the network reaches toward you
            const dxm = a.x - mx, dym = a.y - my;
            const dm2 = dxm * dxm + dym * dym;
            if (dm2 < MOUSE_DIST * MOUSE_DIST) {
                const alpha = (1 - Math.sqrt(dm2) / MOUSE_DIST) * 0.5;
                ctx.strokeStyle = `rgba(${pal.mouse},${alpha})`;
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.moveTo(a.x, a.y);
                ctx.lineTo(mx, my);
                ctx.stroke();
            }
        }

        // shooting stars (dark theme only — they read as meteors)
        if (isDark()) {
            if (now - lastShoot > 5000 && Math.random() < 0.012) {
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
        }

        requestAnimationFrame(frame);
    }

    window.addEventListener('resize', resize);
    window.addEventListener('pointermove', (e) => {
        mx = e.clientX;
        my = e.clientY;
        tx = e.clientX / w - 0.5;
        ty = e.clientY / h - 0.5;
    }, { passive: true });
    window.addEventListener('pointerleave', () => { mx = -9999; my = -9999; });

    document.addEventListener('visibilitychange', () => {
        const wasRunning = running;
        running = !document.hidden;
        if (running && !wasRunning) requestAnimationFrame(frame);
    });

    resize();
    requestAnimationFrame(frame);
})();

// ------------------------------------------------------------
// Robot companion — floats in the corner, eyes track your cursor
// ------------------------------------------------------------
(function () {
    if (prefersReducedMotion) return;

    const bot = document.createElement('div');
    bot.className = 'robo-buddy';
    bot.setAttribute('aria-hidden', 'true');
    bot.innerHTML = `
        <div class="robo-antenna"><span class="robo-antenna-tip"></span></div>
        <div class="robo-head">
            <span class="robo-eye"></span>
            <span class="robo-eye"></span>
            <span class="robo-mouth"></span>
        </div>
        <div class="robo-body"><span class="robo-chest"></span></div>
        <div class="robo-thruster"></div>
    `;
    document.body.appendChild(bot);

    // eyes follow the cursor
    window.addEventListener('pointermove', (e) => {
        const rect = bot.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height * 0.3;
        const ang = Math.atan2(e.clientY - cy, e.clientX - cx);
        bot.style.setProperty('--eye-x', (Math.cos(ang) * 2.4).toFixed(1) + 'px');
        bot.style.setProperty('--eye-y', (Math.sin(ang) * 2.4).toFixed(1) + 'px');
    }, { passive: true });
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
})();
