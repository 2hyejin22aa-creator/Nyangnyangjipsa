(function () {
    'use strict';

    var el = Pricing.el;
    var formatMoney = Pricing.formatMoney;
    var PLAN_MONTHS = 3; // 3개월 플랜 개월 수

    // 필수 패키지: 이름·대상 / 가격 / 구성 3단 (구성 항목은 JSON 그대로)
    function buildPackageFeature(pkg) {
        var box = el('article', 'pkg-feature');
        box.id = 'pkg-' + pkg.id;

        var head = el('div', 'pkg-head');
        head.appendChild(el('h3', 'pkg-name', pkg.name));
        head.appendChild(el('p', 'audience', pkg.audience));
        box.appendChild(head);

        var price = el('div', 'pkg-price');
        if (pkg.listPrice > pkg.price) {
            price.appendChild(el('span', 'list-price', '따로 주문하면 ' + formatMoney(pkg.listPrice)));
        }
        var value = el('span', 'price-value', formatMoney(pkg.price));
        value.appendChild(el('span', 'price-unit', '/ 월'));
        price.appendChild(value);
        if (pkg.listPrice > pkg.price) {
            var saved = pkg.listPrice - pkg.price;
            var percent = Math.round(saved / pkg.listPrice * 100);
            price.appendChild(el('span', 'discount', '묶음 할인 ' + formatMoney(saved) + ' · ' + percent + '%'));
        }
        price.appendChild(el('span', 'card-posts', '월 총 게시물 ' + pkg.monthlyPosts + '건'));
        box.appendChild(price);

        var list = el('ul', 'card-items');
        pkg.items.forEach(function (item) {
            list.appendChild(el('li', null, item));
        });
        box.appendChild(list);
        if (pkg.note) box.appendChild(el('p', 'card-note', pkg.note));
        return box;
    }

    function renderPackages(data) {
        var host = document.getElementById('packages-list');
        data.packages.forEach(function (pkg) {
            host.appendChild(buildPackageFeature(pkg));
        });
    }

    // 3개월 플랜: 문구는 JSON, 금액·할인율은 모두 JSON 값으로 계산해 채움 (Pricing.planValues)
    function renderPlan(data) {
        var plan = data.plan;
        var host = document.getElementById('plan-box');
        if (!plan) return;

        var id = Object.keys(plan.prepayMonthly)[0];
        var v = Pricing.planValues(data, id);
        var lines = plan.text.map(function (line) { return Pricing.fill(line, v); });

        host.appendChild(el('h3', null, plan.title));
        host.appendChild(el('p', null, lines[0]));

        // 결제 방식 탭: 월 결제 / 3개월 선결제
        var tabs = el('div', 'price-tabs');
        tabs.setAttribute('role', 'tablist');
        var panels = el('div', 'price-panels');
        var defs = [
            { name: '월 결제', big: v.price, unit: '/ 월', sub: v.months + '개월 ' + v.price3 + ' · 월 단위 이용 대비 ' + v.saveMonthly + ' 절약', note: '기본 결제 방식입니다.' },
            { name: '3개월 선결제', big: v.prepay3, unit: '/ ' + v.months + '개월', sub: '월 ' + v.prepayMonthly + ' 꼴 · 월 단위 이용 대비 ' + v.savePrepay + ' 절약', note: '월 금액 약 ' + v.prepayPercent + '% 할인이 적용됩니다.' }
        ];
        var buttons = [], bodies = [];
        defs.forEach(function (def, index) {
            var button = el('button', 'price-tab', def.name);
            button.type = 'button';
            button.setAttribute('role', 'tab');
            button.setAttribute('aria-selected', index === 0 ? 'true' : 'false');
            tabs.appendChild(button);
            buttons.push(button);

            var panel = el('div', 'price-panel');
            panel.setAttribute('role', 'tabpanel');
            panel.hidden = index !== 0;
            var value = el('p', 'price-panel-value', def.big);
            value.appendChild(el('span', 'price-panel-unit', def.unit));
            panel.appendChild(value);
            panel.appendChild(el('p', 'price-panel-sub', def.sub));
            panel.appendChild(el('p', 'price-panel-note', def.note));
            panels.appendChild(panel);
            bodies.push(panel);

            button.addEventListener('click', function () {
                buttons.forEach(function (b, i) {
                    b.setAttribute('aria-selected', i === index ? 'true' : 'false');
                    bodies[i].hidden = i !== index;
                });
            });
        });
        host.appendChild(tabs);
        host.appendChild(panels);

        // 해지 조건은 접어 둠
        var terms = el('details', 'plan-terms-box');
        terms.appendChild(el('summary', null, '중도 해지 조건'));
        var body = el('div', 'plan-terms-body');
        [2, 5].forEach(function (i) { body.appendChild(el('p', 'plan-terms', lines[i])); });
        terms.appendChild(body);
        host.appendChild(terms);
        host.hidden = false;
    }

    Pricing.onReady(function (data) {
        renderPackages(data);
        renderPlan(data);
    });

})();
