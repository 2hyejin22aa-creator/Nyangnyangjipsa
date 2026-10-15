(function () {
    'use strict';

    // 이 파일 기준으로 사이트 루트를 계산 (data/works.json, 미디어 경로 모두 루트 기준)
    var script = document.currentScript || document.querySelector('script[src$="works/script.js"]');
    var ROOT = new URL('../', script.src);
    var ALL_LABEL = '전체';

    var grid = document.getElementById('works-grid');
    var filters = document.getElementById('works-filters');

    function el(tag, className, text) {
        var node = document.createElement(tag);
        if (className) node.className = className;
        if (text !== undefined) node.textContent = text;
        return node;
    }

    function buildMedia(item) {
        var src = new URL(item.src, ROOT).href;
        if (item.type === 'video') {
            var video = el('video');
            video.src = src;
            video.muted = true;
            video.autoplay = true;
            video.loop = true;
            video.setAttribute('playsinline', '');
            video.setAttribute('muted', '');
            if (item.poster) video.poster = new URL(item.poster, ROOT).href;
            video.setAttribute('aria-label', item.caption || '');
            return video;
        }
        var img = el('img');
        img.src = src;
        img.alt = item.caption || '';
        img.loading = 'lazy';
        img.decoding = 'async';
        return img;
    }

    function render(list) {
        list.forEach(function (item) {
            var li = el('li');
            li.setAttribute('data-channel', item.channel || '');
            var figure = el('figure');
            figure.appendChild(buildMedia(item));
            if (item.caption) figure.appendChild(el('figcaption', null, item.caption));
            li.appendChild(figure);
            grid.appendChild(li);
        });
    }

    function renderFilters(list) {
        var channels = [];
        list.forEach(function (item) {
            if (item.channel && channels.indexOf(item.channel) === -1) channels.push(item.channel);
        });
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

    fetch(new URL('data/works.json', ROOT).href)
        .then(function (res) { return res.ok ? res.json() : []; })
        .catch(function () { return []; })
        .then(function (list) {
            if (!Array.isArray(list)) return;
            render(list);
            renderFilters(list);
        });
})();
