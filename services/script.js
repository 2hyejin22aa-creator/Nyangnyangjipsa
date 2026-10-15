(function () {
    'use strict';

    var el = Pricing.el;
    var formatMoney = Pricing.formatMoney;
    var PLAN_MONTHS = 3; // 3개월 플랜 개월 수

    // 패키지: "이름 · 대상 · 가격" 한 줄 행, 구성은 펼침(<details>), 첫 행은 펼친 상태
    function buildPackageRow(pkg, open) {
        var row = el('details', 'pkg-row');
        row.id = 'pkg-' + pkg.id;
        if (open) row.open = true;

        var summary = el('summary');
        var info = el('span', 'pkg-info');
        info.appendChild(el('span', 'pkg-name', pkg.name));
        info.appendChild(el('span', 'audience', pkg.audience));
        summary.appendChild(info);

        var price = el('span', 'pkg-price');
        if (pkg.listPrice > pkg.price) {
            price.appendChild(el('s', 'list-price', '정가 ' + formatMoney(pkg.listPrice)));
        }
        price.appendChild(el('span', 'price-value', formatMoney(pkg.price)));
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
        var host = document.getElementById('packages-list');
        data.packages.forEach(function (pkg, index) {
            host.appendChild(buildPackageRow(pkg, index === 0));
        });
    }

    // 3개월 플랜: 문구는 JSON, 금액·할인율은 모두 JSON 값으로 계산해 채움
    function planValues(data, id) {
        var plan = data.plan;
        var pkg = data.packages.filter(function (p) { return p.id === id; })[0];
        var price = pkg.price;
        var prepay = plan.prepayMonthly[id];
        var waiver = plan.waiver[id];
        var price3 = price * PLAN_MONTHS;
        var prepay3 = prepay * PLAN_MONTHS;
        var normal3 = price3 + waiver; // 월 단위 이용 시 3개월 합계(세팅비 포함)
        var paid = prepay3;
        var cancel1 = price * 1 + waiver;
        var cancel2 = price * 2 + waiver;
        return {
            prepayPercent: String(Math.round((price - prepay) / price * 100)),
            months: String(PLAN_MONTHS),
            price: formatMoney(price),
            price3: formatMoney(price3),
            saveMonthly: formatMoney(normal3 - price3),
            prepay3: formatMoney(prepay3),
            savePrepay: formatMoney(normal3 - prepay3),
            waiver: formatMoney(waiver),
            cancel1Settle: formatMoney(cancel1),
            cancel1Refund: formatMoney(paid - cancel1),
            cancel2Settle: formatMoney(cancel2),
            cancel2Refund: formatMoney(paid - cancel2)
        };
    }

    function fill(template, values) {
        return template.replace(/\{(\w+)\}/g, function (m, key) {
            return values[key] !== undefined ? values[key] : m;
        });
    }

    function renderPlan(data) {
        var plan = data.plan;
        var host = document.getElementById('plan-box');
        if (!plan) return;

        var id = Object.keys(plan.prepayMonthly)[0];
        var values = planValues(data, id);
        var lines = plan.text.map(function (line) { return fill(line, values); });

        host.appendChild(el('h3', null, plan.title));
        lines.slice(0, 3).forEach(function (line) { host.appendChild(el('p', null, line)); });

        var prices = el('ul', 'plan-prices');
        lines.slice(3, 5).forEach(function (line) { prices.appendChild(el('li', null, line)); });
        host.appendChild(prices);

        lines.slice(5).forEach(function (line) { host.appendChild(el('p', 'plan-terms', line)); });
        host.hidden = false;
    }

    Pricing.onReady(function (data) {
        renderPackages(data);
        renderPlan(data);
    });

})();
