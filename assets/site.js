(function () {
    'use strict';

    // 상단 로고·푸터·운영자 표기는 모두 data/site.json 한 곳에서 읽습니다.
    //   brandName: 로고 텍스트   brandSub: 로고 옆 작은 글씨   ownerName: /services/ 맨 아래 "운영: ○○" (비어 있으면 표시 안 함)
    var script = document.currentScript || document.querySelector('script[src$="assets/site.js"]');
    var ROOT = new URL('../', script.src);

    function each(selector, fn) {
        Array.prototype.forEach.call(document.querySelectorAll(selector), fn);
    }

    function text(value) { return typeof value === 'string' ? value.trim() : ''; }

    function apply(data) {
        var name = text(data.brandName), sub = text(data.brandSub), owner = text(data.ownerName);

        each('[data-brand-name]', function (node) { node.textContent = name; });
        each('[data-brand-sub]', function (node) {
            // data-brand-sub="sep": 뒤에 구분점을 붙여 한 줄 문구 앞에 이어 씀
            node.textContent = sub ? (node.getAttribute('data-brand-sub') === 'sep' ? sub + ' \u00B7 ' : sub) : '';
        });
        each('[data-owner]', function (node) {
            if (!owner) { node.hidden = true; return; }
            node.textContent = '운영: ' + owner;
            node.hidden = false;
        });
    }

    fetch(new URL('data/site.json', ROOT).href)
        .then(function (res) { return res.ok ? res.json() : null; })
        .catch(function () { return null; })
        .then(function (data) { if (data) apply(data); });
})();
