(function () {
    'use strict';

    var PRICING_URL = 'data/pricing.json';
    var WON_PER_MAN = 10000;

    // 원 단위 정수 → "36만원", "1.5만원"
    function formatMoney(won) {
        if (won % 1000 !== 0) {
            return won.toLocaleString('ko-KR') + '원';
        }
        var man = won / WON_PER_MAN;
        return (Number.isInteger(man) ? String(man) : String(Math.round(man * 10) / 10)) + '만원';
    }

    function el(tag, className, text) {
        var node = document.createElement(tag);
        if (className) node.className = className;
        if (text !== undefined) node.textContent = text;
        return node;
    }

    function findByName(data, listName, name) {
        var list = data[listName] || [];
        for (var i = 0; i < list.length; i++) {
            if (list[i].name === name) return list[i];
        }
        return null;
    }

    function renderPackages(data) {
        var host = document.getElementById('package-cards');
        data.packages.forEach(function (pkg) {
            var card = el('article', 'card');
            card.id = 'pkg-' + pkg.id;

            card.appendChild(el('h3', null, pkg.name));
            card.appendChild(el('p', 'audience', pkg.audience));

            var price = el('p', 'price');
            price.appendChild(el('span', 'price-value', formatMoney(pkg.price)));
            price.appendChild(el('span', 'price-unit', ' / 월'));
            card.appendChild(price);

            var list = el('ul', 'card-items');
            pkg.items.forEach(function (item) {
                list.appendChild(el('li', null, item));
            });
            card.appendChild(list);

            if (pkg.note) card.appendChild(el('p', 'card-note', pkg.note));
            card.appendChild(el('p', 'card-posts', '월 총 게시물 ' + pkg.monthlyPosts + '건'));

            host.appendChild(card);
        });
    }

    function renderAllInOne(data) {
        var plan = data.allInOnePlan;
        var host = document.getElementById('allin-plan');
        if (!plan) return;

        host.appendChild(el('h3', null, plan.title));
        host.appendChild(el('p', null, plan.text));

        var list = el('ul', 'waivers');
        Object.keys(plan.waiver).forEach(function (id) {
            var pkg = data.packages.filter(function (p) { return p.id === id; })[0];
            var li = el('li');
            li.appendChild(el('strong', null, (pkg ? pkg.name : id) + ' · 세팅비 ' + formatMoney(plan.waiver[id]) + ' 면제'));
            if (plan.waiverDetail && plan.waiverDetail[id]) {
                li.appendChild(el('span', null, plan.waiverDetail[id]));
            }
            list.appendChild(li);
        });
        host.appendChild(list);
        host.hidden = false;
    }

    function renderTable(tableId, rows, withUnit) {
        var body = document.querySelector('#' + tableId + ' tbody');
        rows.forEach(function (row) {
            var tr = el('tr');

            var name = el('th', null, row.name);
            name.scope = 'row';
            name.setAttribute('data-label', '항목');
            tr.appendChild(name);

            var price = el('td', 'cell-price', formatMoney(row.price) + (withUnit && row.unit ? ' / ' + row.unit : ''));
            price.setAttribute('data-label', '금액');
            tr.appendChild(price);

            var note = el('td', 'cell-note', row.note || '');
            note.setAttribute('data-label', '내용');
            tr.appendChild(note);

            body.appendChild(tr);
        });
    }

    function fillInlineValues(data) {
        var moneyNodes = document.querySelectorAll('[data-money]');
        Array.prototype.forEach.call(moneyNodes, function (node) {
            var parts = node.getAttribute('data-money').split('|');
            var row = findByName(data, parts[0], parts[1]);
            if (row) node.textContent = formatMoney(row.price);
        });

        var discount = data.singlesDiscount || {};
        Array.prototype.forEach.call(document.querySelectorAll('[data-discount]'), function (node) {
            var value = discount[node.getAttribute('data-discount')];
            if (value !== undefined) node.textContent = value + '%';
        });
        Array.prototype.forEach.call(document.querySelectorAll('[data-discount-note]'), function (node) {
            if (discount.note) node.textContent = discount.note;
        });
    }

    function renderLastUpdated(data) {
        var node = document.getElementById('last-updated');
        if (/^\d{4}-\d{2}-\d{2}$/.test(data.lastUpdated || '')) {
            node.textContent = '가격 기준일 ' + data.lastUpdated;
            node.hidden = false;
        }
    }

    function showError() {
        var node = document.getElementById('load-error');
        node.textContent = '가격 정보를 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.';
        node.hidden = false;
    }

    fetch(PRICING_URL)
        .then(function (res) {
            if (!res.ok) throw new Error('HTTP ' + res.status);
            return res.json();
        })
        .then(function (data) {
            renderPackages(data);
            renderAllInOne(data);
            renderTable('setup-table', data.setup, false);
            renderTable('options-table', data.options, true);
            renderTable('singles-table', data.singles, false);
            fillInlineValues(data);
            renderLastUpdated(data);
        })
        .catch(showError);
})();
