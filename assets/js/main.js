// Smooth-scroll for in-page anchors
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

// Animate elements on scroll
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('animate-in');
        }
    });
}, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

document.querySelectorAll('.card, .skill-category, .award, .post-card').forEach(el => {
    observer.observe(el);
});

// Highlight active nav link based on current path
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

// Intercept clicks to the current page — scroll to top instead of doing a no-op nav.
// Without this, clicking the logo/About on the page you're already on can leave a stale
// "/index.html" in the URL bar (browser doesn't always re-canonicalize on same-page nav).
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

// Theme toggle — initial paint is set by an inline script in <head> to prevent FOUC
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
