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
            box.appendChild(el('p', 'pkg-list-price', '단건으로 따로 맡기면 ' + formatMoney(pkg.listPrice)));
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

    // 3개월 플랜: 패키지 탭 + 결제 방식 탭. 문구는 JSON, 금액은 모두 Pricing.planValues로 계산
    function renderPlan(data) {
        var plan = data.plan;
        var host = document.getElementById('plan-box');
        if (!plan) return;

        var ids = data.packages.map(function (p) { return p.id; });
        var current = (data.packages.filter(function (p) { return p.recommended; })[0] || data.packages[0]).id;
        var method = 0; // 0 월 결제, 1 3개월 선결제

        host.appendChild(el('h3', null, plan.title));
        host.appendChild(el('p', null, plan.text[0]));

        var pkgTabs = el('div', 'price-tabs pkg-tabs');
        pkgTabs.setAttribute('role', 'tablist');
        pkgTabs.setAttribute('aria-label', '패키지');
        var methodTabs = el('div', 'price-tabs');
        methodTabs.setAttribute('role', 'tablist');
        methodTabs.setAttribute('aria-label', '결제 방식');
        var panel = el('div', 'price-panel');
        panel.setAttribute('role', 'tabpanel');
        var waiverLine = el('p', 'plan-waiver');
        var terms = el('details', 'plan-terms-box');
        terms.appendChild(el('summary', null, '중도 해지 조건'));
        var termsBody = el('div', 'plan-terms-body');
        terms.appendChild(termsBody);

        var pkgButtons = data.packages.map(function (pkg) {
            var b = el('button', 'price-tab', pkg.name);
            b.type = 'button';
            b.setAttribute('role', 'tab');
            b.addEventListener('click', function () { current = pkg.id; update(); });
            pkgTabs.appendChild(b);
            return b;
        });
        var methodButtons = ['월 결제', '3개월 선결제'].map(function (name, index) {
            var b = el('button', 'price-tab', name);
            b.type = 'button';
            b.setAttribute('role', 'tab');
            b.addEventListener('click', function () { method = index; update(); });
            methodTabs.appendChild(b);
            return b;
        });

        function update() {
            var v = Pricing.planValues(data, current);
            pkgButtons.forEach(function (b, i) { b.setAttribute('aria-selected', ids[i] === current ? 'true' : 'false'); });
            methodButtons.forEach(function (b, i) { b.setAttribute('aria-selected', i === method ? 'true' : 'false'); });

            panel.textContent = '';
            var value = el('p', 'price-panel-value', method === 0 ? v.price : v.prepayMonthly);
            value.appendChild(el('span', 'price-panel-unit', '/ 월'));
            panel.appendChild(value);
            if (method === 0) {
                panel.appendChild(el('p', 'price-panel-sub', v.months + '개월 ' + v.price3 + ' · 월 단위 이용 대비 ' + v.saveMonthly + ' 절약'));
                panel.appendChild(el('p', 'price-panel-note', '기본 결제 방식입니다.'));
            } else {
                panel.appendChild(el('p', 'price-panel-sub', v.months + '개월 ' + v.prepay3 + ' · 월 단위 이용 대비 ' + v.savePrepay + ' 절약'));
            }
            waiverLine.textContent = '면제되는 세팅비: ' + (plan.waiverDetail ? plan.waiverDetail[current] : '');

            termsBody.textContent = '';
            plan.text.slice(2).forEach(function (line) { termsBody.appendChild(el('p', 'plan-terms', Pricing.fill(line, v))); });
        }

        host.appendChild(pkgTabs);
        host.appendChild(methodTabs);
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
