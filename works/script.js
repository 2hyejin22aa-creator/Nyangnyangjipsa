(function () {
    'use strict';

    var ALL_LABEL = '전체';
    var grid = document.getElementById('works-grid');
    var filters = document.getElementById('works-filters');

    function el(tag, className, text) {
        var node = document.createElement(tag);
        if (className) node.className = className;
        if (text !== undefined) node.textContent = text;
        return node;
    }

    function renderFilters(channels) {
        if (channels.length < 2) return;
        [ALL_LABEL].concat(channels).forEach(function (name, index) {
            var button = el('button', null, name);
            button.type = 'button';
            button.setAttribute('aria-pressed', index === 0 ? 'true' : 'false');
            button.addEventListener('click', function () {
                Array.prototype.forEach.call(filters.children, function (b) { b.setAttribute('aria-pressed', 'false'); });
                button.setAttribute('aria-pressed', 'true');
                Array.prototype.forEach.call(grid.children, function (li) {
                    li.hidden = index !== 0 && li.getAttribute('data-channel') !== name;
                });
            });
            filters.appendChild(button);
        });
        filters.hidden = false;
    }

    Media.load().then(function (media) {
        var gallery = Array.isArray(media.gallery) ? media.gallery : [];
        return Promise.all(gallery.map(function (item) {
            return Media.renderGalleryItem(item).then(function (fig) { return fig ? { item: item, fig: fig } : null; });
        }));
    }).then(function (results) {
        var channels = [];
        results.filter(Boolean).forEach(function (r) {
            var li = el('li');
            li.setAttribute('data-channel', r.item.channel || '');
            li.appendChild(r.fig);
            grid.appendChild(li);
            if (r.item.channel && channels.indexOf(r.item.channel) === -1) channels.push(r.item.channel);
        });
        renderFilters(channels);
    });

    // 성과 사례: data/results.json의 업체별 카드 (한 일 목록 "did"가 있으면 함께 보여 줌)
    (function renderCases() {
        var host = document.getElementById('cases-grid');
        if (!host || !window.Results) return;
        fetch(new URL('../data/results.json', document.currentScript ? document.currentScript.src : location.href).href)
            .then(function (res) { return res.ok ? res.json() : null; })
            .catch(function () { return null; })
            .then(function (data) {
                var companies = data && Array.isArray(data.companies) ? data.companies : [];
                if (!companies.length) return;
                companies.forEach(function (company, index) {
                    var wrap = el('div', 'case');
                    wrap.appendChild(el('p', 'case-no', 'Case ' + String(index + 1).padStart(2, '0')));
                    wrap.appendChild(window.Results.card(company));
                    if (Array.isArray(company.did) && company.did.length) {
                        var did = el('div', 'case-did');
                        did.appendChild(el('h4', null, '한 일'));
                        var ul = el('ul');
                        company.did.forEach(function (line) { ul.appendChild(el('li', null, line)); });
                        did.appendChild(ul);
                        wrap.appendChild(did);
                    }
                    host.appendChild(wrap);
                });
                host.closest('section').hidden = false;
            });
    })();
})();
