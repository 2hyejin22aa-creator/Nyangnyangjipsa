(function () {
    'use strict';

    var PRICING_URL = 'data/pricing.json';
    var WON_PER_MAN = 10000;
    var PLAN_MONTHS = 3; // 올인원 플랜 선결제 개월 수

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

    // 패키지 그룹 (id 기준 분류. 금액·구성은 JSON에서만 가져옴)
    var PACKAGE_GROUPS = {
        'packages-pick': ['academy', 'naver', 'insta'],
        'packages-all': ['allin_basic', 'allin_premium']
    };

    // 패키지: "이름 · 대상 · 가격" 한 줄 행, 구성은 펼침(<details>)
    function buildPackageRow(pkg) {
        var row = el('details', 'pkg-row');
        row.id = 'pkg-' + pkg.id;

        var summary = el('summary');
        var info = el('span', 'pkg-info');
        info.appendChild(el('span', 'pkg-name', pkg.name));
        info.appendChild(el('span', 'audience', pkg.audience));
        summary.appendChild(info);

        var price = el('span', 'pkg-price');
        if (pkg.listPrice > pkg.price) {
            price.appendChild(el('s', 'list-price', '정가 ' + formatMoney(pkg.listPrice)));
        }
        var value = el('span', 'price-value', formatMoney(pkg.price));
        price.appendChild(value);
        price.appendChild(el('span', 'price-unit', ' / 월'));
        if (pkg.listPrice > pkg.price) {
            var saved = pkg.listPrice - pkg.price;
            var percent = Math.round(saved / pkg.listPrice * 100);
            price.appendChild(el('span', 'discount', formatMoney(saved) + ' · ' + percent + '% 할인'));
        }
        price.appendChild(el('span', 'card-posts', '월 총 게시물 ' + pkg.monthlyPosts + '건'));
        summary.appendChild(price);
        row.appendChild(summary);

        var body = el('div', 'pkg-body');
        var list = el('ul', 'card-items');
        pkg.items.forEach(function (item) {
            list.appendChild(el('li', null, item));
        });
        body.appendChild(list);
        if (pkg.note) body.appendChild(el('p', 'card-note', pkg.note));
        row.appendChild(body);

        return row;
    }

    function renderPackages(data) {
        Object.keys(PACKAGE_GROUPS).forEach(function (hostId) {
            var host = document.getElementById(hostId);
            PACKAGE_GROUPS[hostId].forEach(function (id) {
                var pkg = data.packages.filter(function (p) { return p.id === id; })[0];
                if (pkg) host.appendChild(buildPackageRow(pkg));
            });
        });
    }

    function renderAllInOne(data) {
        var plan = data.allInOnePlan;
        var host = document.getElementById('allin-plan');
        if (!plan) return;

        host.appendChild(el('h3', null, plan.title));
        [].concat(plan.text).forEach(function (line) {
            host.appendChild(el('p', null, line));
        });

        // 결제 방식별 금액: 월 결제 = price, 선결제 = prepayMonthly × 개월 수 (모두 JSON 값)
        var list = el('ul', 'plan-prices');
        Object.keys(plan.prepayMonthly).forEach(function (id) {
            var pkg = data.packages.filter(function (p) { return p.id === id; })[0];
            if (!pkg) return;
            list.appendChild(el('li', null, pkg.name + ' — 월 결제 월 ' + formatMoney(pkg.price)
                + ' / 선결제 ' + formatMoney(plan.prepayMonthly[id] * PLAN_MONTHS)));
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

        Array.prototype.forEach.call(document.querySelectorAll('[data-referral-amount]'), function (node) {
            if (data.referral && typeof data.referral.amount === 'number') {
                node.textContent = formatMoney(data.referral.amount);
            }
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
