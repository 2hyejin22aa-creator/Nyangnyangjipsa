(function () {
    'use strict';

    // 홈의 성과 데이터: data/results.json에 업체가 있을 때만 보임. 값은 통계 화면에 보이는 그대로 적습니다.
    var script = document.currentScript || document.querySelector('script[src$="assets/results.js"]');
    var ROOT = new URL('../', script.src);

    function el(tag, className, text) {
        var node = document.createElement(tag);
        if (className) node.className = className;
        if (text !== undefined) node.textContent = text;
        return node;
    }

    function times(n) { return Number(n).toLocaleString('ko-KR') + '회'; }

    function row(label, item, extra) {
        var li = el('li', extra ? 'stat-extra' : null);
        li.appendChild(el('span', 'stat-label', label));
        var right = el('span', 'stat-right');
        var top = el('span', 'stat-top');
        top.appendChild(el('span', 'stat-pill', '↑' + item.change + '%'));
        top.appendChild(el('strong', 'stat-value', times(item.value)));
        right.appendChild(top);
        right.appendChild(el('span', 'stat-prev', '지난 기간 ' + times(item.prev)));
        li.appendChild(right);
        return li;
    }

    function card(company) {
        var article = el('article', 'stat-card');
        var head = el('header', 'stat-head');
        head.appendChild(el('h3', null, company.label));
        var sub = [company.title, company.subtitle].filter(Boolean).join(' · ');
        if (sub) head.appendChild(el('p', null, sub));
        article.appendChild(head);
        var list = el('ul', 'stat-rows');
        (company.rows || []).forEach(function (r) { list.appendChild(row(r.period, r)); });
        (company.metrics || []).forEach(function (m) { list.appendChild(row(m.name, m)); });
        (company.extra || []).forEach(function (x) { list.appendChild(row(x.label, x, true)); });
        article.appendChild(list);
        return article;
    }

    window.Results = { card: card };

    function init() {
        var section = document.querySelector('[data-results]');
        if (!section) return;
        fetch(new URL('data/results.json', ROOT).href)
            .then(function (res) { return res.ok ? res.json() : null; })
            .catch(function () { return null; })
            .then(function (data) {
                var companies = data && Array.isArray(data.companies) ? data.companies : [];
                if (!companies.length) return;
                var grid = section.querySelector('[data-results-grid]');
                companies.forEach(function (c) { grid.appendChild(card(c)); });
                section.hidden = false;
            });
    }

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
    else init();
})();
