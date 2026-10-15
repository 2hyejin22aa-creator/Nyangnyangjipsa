(function () {
    'use strict';

    // 가격 혜택 4칸과 패키지 한 줄: 숫자는 모두 data/pricing.json에서 계산 (홈, SNS 마케팅 페이지)
    var P = window.Pricing;
    if (!P) return;

    function min(list) { return Math.min.apply(null, list); }
    function max(list) { return Math.max.apply(null, list); }

    function benefits(d) {
        var pkgs = d.packages;
        var plan = d.plan;
        var diffs = pkgs.map(function (p) { return p.listPrice - p.price; });
        var waivers = pkgs.map(function (p) { return plan.waiver[p.id]; });
        var saves = pkgs.map(function (p) {
            var prepay = plan.prepayMonthly[p.id];
            return (p.price * 3 + plan.waiver[p.id]) - prepay * 3;
        });
        var percents = pkgs.map(function (p) { return Math.round((p.price - plan.prepayMonthly[p.id]) / p.price * 100); });

        var items = [
            ['묶음 가격', '단건보다 저렴', '패키지에 따라 ' + P.rangeMan(min(diffs), max(diffs)) + ' 저렴'],
            ['3개월 이용', '세팅비 면제', '패키지에 따라 ' + P.rangeMan(min(waivers), max(waivers)) + ', 3개월 이용 시 적용'],
            ['3개월 선결제', '월 금액 약 ' + min(percents) + '% 할인', '월 단위 이용 대비 ' + P.rangeMan(min(saves), max(saves)) + ' 절약']
        ];
        if (d.referral && typeof d.referral.amount === 'number') {
            items.push(['지인 소개', P.formatMoney(d.referral.amount) + ' 할인', '소개한 분, 소개받은 분 모두 첫 달 월 금액']);
        }
        return items;
    }

    function init(d) {
        Array.prototype.forEach.call(document.querySelectorAll('[data-benefits]'), function (host) {
            benefits(d).forEach(function (b) {
                var card = P.el('div', 'benefit');
                card.appendChild(P.el('span', 'benefit-title', b[0]));
                card.appendChild(P.el('strong', 'benefit-big', b[1]));
                card.appendChild(P.el('span', 'benefit-note', b[2]));
                host.appendChild(card);
            });
            host.hidden = false;
        });
        // 예: "패키지명 금액 · 패키지명 금액 (세전)" 형식
        Array.prototype.forEach.call(document.querySelectorAll('[data-package-line]'), function (node) {
            node.textContent = d.packages.map(function (p) { return p.name + ' ' + P.formatMoney(p.price); }).join(' · ') + ' (세전)';
        });
    }

    P.onReady(init);
})();
