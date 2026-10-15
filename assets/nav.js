(function () {
    'use strict';

    var script = document.currentScript || document.querySelector('script[src$="assets/nav.js"]');
    var ROOT = new URL('../', script.src);
    var MIN_WORKS = 3; // 작업물이 이 개수 이상일 때만 탭을 보여 줌

    function normalize(path) {
        return path.replace(/index\.html$/, '').replace(/\/?$/, '/');
    }

    // 현재 페이지 탭 표시 (aria-current)
    var here = normalize(location.pathname);
    var tabs = document.querySelector('.tabs');
    var links = document.querySelectorAll('.tabs a');
    Array.prototype.forEach.call(links, function (link) {
        if (normalize(link.pathname) === here) {
            link.setAttribute('aria-current', 'page');
        } else {
            link.removeAttribute('aria-current');
        }
    });

    // 모바일 가로 스크롤 탭 바: 현재 탭이 보이도록 이동
    var current = document.querySelector('.tabs a[aria-current="page"]');
    if (tabs && current) {
        tabs.scrollLeft = current.offsetLeft - (tabs.clientWidth - current.offsetWidth) / 2;
    }

    // 작업물이 MIN_WORKS개 미만이면 탭과 홈 카드를 숨김 (기본은 숨김 상태)
    fetch(new URL('data/works.json', ROOT).href)
        .then(function (res) { return res.ok ? res.json() : []; })
        .catch(function () { return []; })
        .then(function (list) {
            if (Array.isArray(list) && list.length >= MIN_WORKS) {
                Array.prototype.forEach.call(document.querySelectorAll('[data-tab="works"]'), function (node) {
                    node.hidden = false;
                });
            }
        });
})();
