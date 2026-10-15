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
})();
