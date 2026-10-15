(function () {
    'use strict';

    // 가격 혜택 카드: data/pricing.json 값으로만 채움 (홈, SNS 마케팅 페이지)
    var P = window.Pricing;
    if (!P) return;

    function benefits(d) {
        var pkg = d.packages[0];
        var id = pkg.id;
        var v = P.planValues(d, id);
        var items = [];
        if (pkg.listPrice > pkg.price) {
            var saved = pkg.listPrice - pkg.price;
            items.push(['묶음 할인', P.formatMoney(saved) + ' 할인', '따로 주문하는 것보다 ' + Math.round(saved / pkg.listPrice * 100) + '% 저렴']);
        }
        items.push(['3개월 이용', '세팅비 ' + v.waiver + ' 면제', '3개월 이용 시 적용']);
        items.push(['3개월 선결제', '월 금액 약 ' + v.prepayPercent + '% 할인', '월 단위 이용 대비 ' + v.savePrepay + ' 절약']);
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
    }

    P.onReady(init);
})();
