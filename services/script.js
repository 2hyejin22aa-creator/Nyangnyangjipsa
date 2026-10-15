(function () {
    'use strict';

    var el = Pricing.el;
    var formatMoney = Pricing.formatMoney;

    // 패키지 카드 3개: 이름 / 대상 / 월 금액 / 단건 합계(listPrice) / 구성 (모두 JSON)
    function buildPackageCard(pkg) {
        var box = el('article', 'pkg-card' + (pkg.recommended ? ' recommended' : ''));
        box.id = 'pkg-' + pkg.id;
        if (pkg.recommended) box.appendChild(el('span', 'pkg-flag', '추천'));
        box.appendChild(el('h3', 'pkg-name', pkg.name));
        box.appendChild(el('p', 'audience', pkg.audience));

        var price = el('p', 'pkg-price-big', formatMoney(pkg.price));
        price.appendChild(el('span', 'price-unit', '/ 월'));
        box.appendChild(price);
        if (pkg.listPrice > pkg.price) {
            box.appendChild(el('p', 'pkg-list-price', '단건 결제 시 ' + formatMoney(pkg.listPrice)));
        }

        var list = el('ul', 'card-items');
        pkg.items.forEach(function (item) { list.appendChild(el('li', null, item)); });
        box.appendChild(list);
        if (pkg.note) box.appendChild(el('p', 'card-note', pkg.note));
        return box;
    }

    function renderPackages(data) {
        var host = document.getElementById('packages-list');
        var grid = el('div', 'pkg-cards');
        data.packages.forEach(function (pkg) { grid.appendChild(buildPackageCard(pkg)); });
        host.appendChild(grid);
    }

    // 3개월 플랜(선결제): 패키지 탭만 제공. 문구는 JSON, 금액은 모두 Pricing.planCalc로 계산
    function renderPlan(data) {
        var plan = data.plan;
        var host = document.getElementById('plan-box');
        if (!plan) return;

        var ids = data.packages.map(function (p) { return p.id; });
        var current = (data.packages.filter(function (p) { return p.recommended; })[0] || data.packages[0]).id;

        host.appendChild(el('h3', null, plan.title));
        host.appendChild(el('p', null, plan.text[0]));

        var pkgTabs = el('div', 'price-tabs pkg-tabs');
        pkgTabs.setAttribute('role', 'tablist');
        pkgTabs.setAttribute('aria-label', '패키지');
        var panel = el('div', 'price-panel');
        panel.setAttribute('role', 'tabpanel');
        var waiverLine = el('p', 'plan-waiver');
        var terms = el('details', 'plan-terms-box');
        terms.appendChild(el('summary', null, '중도 해지 조건'));
        var termsBody = el('div', 'plan-terms-body');
        terms.appendChild(termsBody);

        var buttons = data.packages.map(function (pkg) {
            var b = el('button', 'price-tab', pkg.name);
            b.type = 'button';
            b.setAttribute('role', 'tab');
            b.addEventListener('click', function () { current = pkg.id; update(); });
            pkgTabs.appendChild(b);
            return b;
        });

        function update() {
            var c = Pricing.planCalc(data, current);
            buttons.forEach(function (b, i) { b.setAttribute('aria-selected', ids[i] === current ? 'true' : 'false'); });

            panel.textContent = '';
            var value = el('p', 'price-panel-value', formatMoney(c.total));
            value.appendChild(el('span', 'price-panel-unit', '/ ' + c.months + '개월'));
            panel.appendChild(value);
            panel.appendChild(el('p', 'price-panel-monthly', '월 약 ' + Pricing.manOne(c.monthlyEq)));
            panel.appendChild(el('p', 'price-panel-sub', '월 단위 이용 대비 ' + formatMoney(c.save) + ' 절약 (세팅비 ' + formatMoney(c.waiver) + ' 면제 포함)'));
            waiverLine.textContent = '면제되는 세팅비: ' + (plan.waiverDetail ? plan.waiverDetail[current] : '');

            termsBody.textContent = '';
            termsBody.appendChild(el('p', 'plan-terms', plan.text[1]));
            var list = el('ul', 'settle-list');
            list.appendChild(el('li', null, '1개월 이용 후 해지: 정상가 정산 ' + formatMoney(c.settle1) + ' (월 금액 + 세팅비) → 환불 ' + formatMoney(c.refund1)));
            list.appendChild(el('li', null, '2개월 이용 후 해지: 정상가 정산 ' + formatMoney(c.settle2) + ' (월 금액 × 2 + 세팅비) → 환불 ' + formatMoney(c.refund2)));
            list.appendChild(el('li', null, c.months + '개월 이용: 환불 없음'));
            termsBody.appendChild(list);
        }

        host.appendChild(pkgTabs);
        host.appendChild(panel);
        host.appendChild(waiverLine);
        host.appendChild(terms);
        update();
        host.hidden = false;
    }

    // "단건·옵션을 확인하세요" 링크: 해당 접힘 영역을 열고 이동
    function bindExtrasLinks() {
        Array.prototype.forEach.call(document.querySelectorAll('a.extras-link'), function (link) {
            link.addEventListener('click', function (event) {
                var target = document.querySelector(link.getAttribute('href'));
                if (!target) return;
                event.preventDefault();
                target.open = true;
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            });
        });
    }

    bindExtrasLinks();
    Pricing.onReady(function (data) {
        renderPackages(data);
        renderPlan(data);
    });

})();
