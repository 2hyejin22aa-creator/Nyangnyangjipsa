(function () {
    'use strict';

    // 구역별 등장 모션. 선택자 목록은 assets/site.css의 모션 블록과 같아야 합니다.
    // '모션 줄이기'가 켜져 있거나 IntersectionObserver가 없으면 아무것도 하지 않습니다(내용은 처음부터 보임).
    var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce || !('IntersectionObserver' in window)) return;

    var SELECTOR = '.section-head, .service-list li, .steps5 li, .steps li, .months li, .learn-title, .learn li, .learn-note, .plan-list li, .roles tbody tr, .hero-art figcaption, .journey li, .path-flow li, .spec-list li, .pkg-feature, .plan-box, .referral, .band-ink details, .cta-band h2, .cta-band p, .cta-band .cta, .contact h2, .contact .cta, .contact-note, .cycle-fig, .media-slot, .works-grid li, .price-table, .footer-inner';
    var STEP = 70;      // 같은 목록 안에서 항목마다 늦추는 시간(ms)
    var MAX_DELAY = 420;

    var seen = new WeakSet();
    var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
            if (!entry.isIntersecting) return;
            entry.target.classList.add('in');
            io.unobserve(entry.target);
        });
    }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });

    function loopDelays(root) {
        // 월 순환: 칸 → 화살표 → 칸 … 순서로 나타나게 지연값을 정함
        var svg = root.querySelector ? root.querySelector('.loop') : null;
        if (!svg || svg.getAttribute('data-motion')) return;
        svg.setAttribute('data-motion', '1');
        var rects = svg.querySelectorAll('rect'), texts = svg.querySelectorAll('text'), arcs = svg.querySelectorAll(':scope > path');
        for (var i = 0; i < rects.length; i++) {
            var d = (i * 260) + 'ms';
            rects[i].style.setProperty('--d', d);
            if (texts[i]) texts[i].style.setProperty('--d', d);
            if (arcs[i]) arcs[i].style.setProperty('--d', (i * 260 + 130) + 'ms');
        }
    }

    function scan(root) {
        var found = [];
        if (root.matches && root.matches(SELECTOR)) found.push(root);
        if (root.querySelectorAll) Array.prototype.push.apply(found, root.querySelectorAll(SELECTOR));
        var groups = new Map();
        found.forEach(function (node) {
            if (seen.has(node)) return;
            seen.add(node);
            var parent = node.parentNode;
            var index = groups.get(parent) || 0;
            groups.set(parent, index + 1);
            node.style.setProperty('--d', Math.min(index * STEP, MAX_DELAY) + 'ms');
            if (node.classList.contains('cycle-fig')) loopDelays(node);
            io.observe(node);
        });
    }

    function start() {
        scan(document.body);
        new MutationObserver(function (mutations) {
            mutations.forEach(function (m) {
                Array.prototype.forEach.call(m.addedNodes, function (n) { if (n.nodeType === 1) scan(n); });
            });
        }).observe(document.body, { childList: true, subtree: true });
    }

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
    else start();
})();
