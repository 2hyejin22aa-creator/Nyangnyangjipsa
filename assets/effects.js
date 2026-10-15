(function () {
    'use strict';

    // 화면 효과: 스크롤 등장, 숫자 카운트업, 마우스 커서, 진행 바, 플로팅 버튼, 상단 그림자.
    // '동작 줄이기'가 켜져 있으면 움직임을 모두 끄고 내용은 처음부터 보입니다.
    // 터치 기기에서는 마우스 효과(커서·자석 버튼)를 만들지 않습니다.
    var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var fine = window.matchMedia && window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    var root = document.documentElement;

    function el(tag, className, text) {
        var node = document.createElement(tag);
        if (className) node.className = className;
        if (text) node.textContent = text;
        return node;
    }

    /* ---------- 스크롤: 상단 그림자, 진행 바, 플로팅 버튼 ---------- */
    var header = document.querySelector('.site-header');
    var fab = document.querySelector('.fab');
    var bar = document.querySelector('.scroll-bar');
    if (!bar) {
        bar = el('div', 'scroll-bar');
        bar.setAttribute('aria-hidden', 'true');
        document.body.appendChild(bar);
    }

    var ticking = false;
    function onScroll() {
        ticking = false;
        var y = window.pageYOffset || root.scrollTop;
        var max = Math.max(1, root.scrollHeight - window.innerHeight);
        if (header) header.classList.toggle('scrolled', y > 8);
        if (fab) fab.classList.toggle('show', y > 420);
        bar.style.transform = 'scaleX(' + Math.min(1, y / max) + ')';
    }
    window.addEventListener('scroll', function () {
        if (!ticking) { ticking = true; window.requestAnimationFrame(onScroll); }
    }, { passive: true });
    window.addEventListener('resize', onScroll);
    onScroll();

    if (reduce) return;

    /* ---------- 스크롤 등장 ---------- */
    var REVEAL = [
        '.hero-home h1', '.hero-home .lede', '.hero-home .cta', '.hero-home .assure',
        '.hero-page h1', '.hero-page .lede', '.hero-page .cta',
        '.section-head', '.stat-card', '.works-grid li', '.compare-pair figure', '.pain-lines li', '.tile',
        '.step-grid li', '.card', '.cta-band h2', '.cta-band p', '.cta-band .cta',
        '.pkg-feature', '.plan-box', '.months li', '.path-flow li', '.steps li', '.spec-list li', '.plan-list li',
        '.contact-note', '.media-slot', '.learn li', '.referral'
    ].join(',');

    var STEP = 80, MAX_DELAY = 400;
    var io = 'IntersectionObserver' in window ? new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
            if (!entry.isIntersecting) return;
            var node = entry.target;
            node.classList.add('in');
            io.unobserve(node);
            countUp(node);
        });
    }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' }) : null;

    function register(node) {
        if (!io || node.__fx) return;
        node.__fx = true;
        var siblings = node.parentNode ? Array.prototype.filter.call(node.parentNode.children, function (c) { return c.matches && c.matches(REVEAL); }) : [];
        var index = Math.max(0, siblings.indexOf(node));
        node.style.setProperty('--d', Math.min(MAX_DELAY, index * STEP) + 'ms');
        node.classList.add('reveal');
        io.observe(node);
    }

    function scan(scope) {
        if (scope.nodeType !== 1) return;
        if (scope.matches && scope.matches(REVEAL)) register(scope);
        Array.prototype.forEach.call(scope.querySelectorAll(REVEAL), register);
    }

    /* ---------- 숫자 카운트업 (통계 카드) ---------- */
    function countUp(node) {
        var targets = node.matches && node.matches('.stat-value') ? [node] : node.querySelectorAll ? node.querySelectorAll('.stat-value') : [];
        Array.prototype.forEach.call(targets, function (target) {
            if (target.__counted) return;
            target.__counted = true;
            var text = target.textContent;
            var match = text.match(/^([\d,]+)(.*)$/);
            if (!match) return;
            var end = parseInt(match[1].replace(/,/g, ''), 10), suffix = match[2];
            var start = null, duration = 1100;
            function frame(now) {
                if (start === null) start = now;
                var t = Math.min(1, (now - start) / duration);
                var eased = 1 - Math.pow(1 - t, 3);
                target.textContent = Math.round(end * eased).toLocaleString('ko-KR') + suffix;
                if (t < 1) window.requestAnimationFrame(frame); else target.textContent = text;
            }
            target.textContent = '0' + suffix;
            window.requestAnimationFrame(frame);
        });
    }

    function startReveal() {
        scan(document.body);
        // 다른 스크립트가 나중에 만드는 카드·이미지도 같은 효과를 받게 함
        if ('MutationObserver' in window) {
            new MutationObserver(function (mutations) {
                mutations.forEach(function (m) { Array.prototype.forEach.call(m.addedNodes, scan); });
            }).observe(document.getElementById('main') || document.body, { childList: true, subtree: true });
        }
    }
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', startReveal);
    else startReveal();

    /* ---------- 마우스 커서 + 자석 버튼 (마우스 기기에서만) ---------- */
    if (!fine) return;

    var ring = el('div', 'cursor-ring');
    var dot = el('div', 'cursor-dot');
    ring.setAttribute('aria-hidden', 'true');
    dot.setAttribute('aria-hidden', 'true');
    document.body.appendChild(ring);
    document.body.appendChild(dot);
    root.classList.add('has-cursor');

    var mx = -100, my = -100, rx = -100, ry = -100, shown = false;
    function loop() {
        rx += (mx - rx) * 0.18;
        ry += (my - ry) * 0.18;
        ring.style.transform = 'translate(' + rx + 'px,' + ry + 'px)';
        dot.style.transform = 'translate(' + mx + 'px,' + my + 'px)';
        window.requestAnimationFrame(loop);
    }
    window.requestAnimationFrame(loop);

    document.addEventListener('mousemove', function (event) {
        mx = event.clientX; my = event.clientY;
        if (!shown) { shown = true; rx = mx; ry = my; root.classList.add('cursor-on'); }
        var target = event.target;
        var zoom = target.closest && target.closest('.zoom');
        var link = target.closest && target.closest('a, button, summary');
        ring.classList.toggle('is-zoom', !!zoom);
        ring.classList.toggle('is-link', !zoom && !!link);
        dot.classList.toggle('is-hidden', !!zoom);
    }, { passive: true });
    document.addEventListener('mouseleave', function () { shown = false; root.classList.remove('cursor-on'); });
    document.addEventListener('mousedown', function () { ring.classList.add('is-down'); });
    document.addEventListener('mouseup', function () { ring.classList.remove('is-down'); });

    // 주요 버튼이 마우스 쪽으로 살짝 끌려옴
    document.addEventListener('mousemove', function (event) {
        var btn = event.target.closest && event.target.closest('.btn-primary, .btn-light');
        Array.prototype.forEach.call(document.querySelectorAll('.btn.pulled'), function (other) {
            if (other !== btn) { other.style.transform = ''; other.classList.remove('pulled'); }
        });
        if (!btn) return;
        var rect = btn.getBoundingClientRect();
        var dx = (event.clientX - (rect.left + rect.width / 2)) / rect.width;
        var dy = (event.clientY - (rect.top + rect.height / 2)) / rect.height;
        btn.classList.add('pulled');
        btn.style.transform = 'translate(' + (dx * 10).toFixed(1) + 'px,' + (dy * 8).toFixed(1) + 'px)';
    }, { passive: true });
})();
