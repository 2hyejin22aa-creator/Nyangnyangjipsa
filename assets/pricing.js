(function () {
    'use strict';

    // 사이트 어느 폴더에서 불러와도 같은 JSON을 읽도록 이 스크립트 위치 기준으로 경로를 계산합니다.
    var script = document.currentScript || document.querySelector('script[src$="assets/pricing.js"]');
    var DATA_URL = new URL('../data/pricing.json', script.src).href;
    var WON_PER_MAN = 10000;

    var data = null;
    var listeners = [];

    // 원 단위 정수 → "N만원" (소수 한 자리까지)
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

    function findByName(d, listName, name) {
        var list = d[listName] || [];
        for (var i = 0; i < list.length; i++) {
            if (list[i].name === name) return list[i];
        }
        return null;
    }

    function each(selector, fn) {
        Array.prototype.forEach.call(document.querySelectorAll(selector), fn);
    }

    // <span data-money="setup|현황 진단"> 같은 자리표시를 JSON 금액으로 채움
    function fillTokens(d) {
        each('[data-money]', function (node) {
            var parts = node.getAttribute('data-money').split('|');
            var row = findByName(d, parts[0], parts[1]);
            if (row) node.textContent = formatMoney(row.price);
        });

        // <p data-spec="blog"> → data/pricing.json의 contentSpec 문구 (없으면 숨김)
        each('[data-spec]', function (node) {
            var text = (d.contentSpec || {})[node.getAttribute('data-spec')];
            if (text) node.textContent = text; else node.hidden = true;
        });

        var discount = d.singlesDiscount || {};
        each('[data-discount]', function (node) {
            var value = discount[node.getAttribute('data-discount')];
            if (value !== undefined) node.textContent = value + '%';
        });

        each('[data-referral-amount]', function (node) {
            if (d.referral && typeof d.referral.amount === 'number') {
                node.textContent = formatMoney(d.referral.amount);
            }
        });
    }

    // <table data-pricing-table="setup,options" data-category="sns"> → 해당 카테고리 항목만 표로 그림
    function renderTables(d) {
        each('[data-pricing-table]', function (table) {
            var lists = table.getAttribute('data-pricing-table').split(',');
            var category = table.getAttribute('data-category');
            var body = table.querySelector('tbody');

            lists.forEach(function (listName) {
                (d[listName] || []).forEach(function (row) {
                    if (row.category !== category) return;
                    var tr = el('tr');

                    var name = el('th', null, row.name);
                    name.scope = 'row';
                    name.setAttribute('data-label', '항목');
                    tr.appendChild(name);

                    var price = el('td', 'cell-price', formatMoney(row.price) + (row.unit ? ' / ' + row.unit : ''));
                    price.setAttribute('data-label', '금액');
                    tr.appendChild(price);

                    var note = el('td', 'cell-note', row.note || '');
                    note.setAttribute('data-label', '내용');
                    tr.appendChild(note);

                    body.appendChild(tr);
                });
            });
        });
    }

    // <span data-note="singles|릴스·클립 편집 (15~30초)"> → JSON note를 그대로 표시
    function fillNotes(d) {
        each('[data-note]', function (node) {
            var parts = node.getAttribute('data-note').split('|');
            var row = findByName(d, parts[0], parts[1]);
            if (row && row.note) node.textContent = row.note;
        });
    }

    function renderLastUpdated(d) {
        var node = document.getElementById('last-updated');
        if (node && /^\d{4}-\d{2}-\d{2}$/.test(d.lastUpdated || '')) {
            node.textContent = '가격 기준일 ' + d.lastUpdated;
            node.hidden = false;
        }
    }

    function showError() {
        var node = document.getElementById('load-error');
        if (!node) return;
        node.textContent = '가격 정보를 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.';
        node.hidden = false;
    }

    var PLAN_MONTHS = 3; // 3개월 플랜 개월 수

    // 두 금액(원)을 "최소~최대만원" 범위로 표기 (같으면 한 값)
    function rangeMan(a, b) {
        function man(won) {
            var v = won / WON_PER_MAN;
            return Number.isInteger(v) ? String(v) : String(Math.round(v * 10) / 10);
        }
        return a === b ? man(a) + '만원' : man(a) + '~' + man(b) + '만원';
    }

    // 원 단위 금액 → 소수 한 자리 만원 ("N만원", 정수면 소수점 없음)
    function manOne(won) {
        var v = Math.round(won / 1000) / 10;
        return (Number.isInteger(v) ? String(v) : v.toFixed(1)) + '만원';
    }

    // 3개월 선결제 플랜 계산: 모두 JSON 값(월 금액, waiver, prepayTotal)에서 계산
    function planCalc(d, id) {
        var plan = d.plan;
        var pkg = d.packages.filter(function (p) { return p.id === id; })[0];
        var price = pkg.price;
        var waiver = plan.waiver[id];
        var total = plan.prepayTotal[id];
        var normal = price * PLAN_MONTHS + waiver; // 월 단위 이용 시 3개월 합계(세팅비 포함)
        var settle1 = price * 1 + waiver;
        var settle2 = price * 2 + waiver;
        return {
            months: PLAN_MONTHS,
            price: price,
            waiver: waiver,
            total: total,
            monthlyEq: total / PLAN_MONTHS,
            save: normal - total,
            percent: Math.round((price - total / PLAN_MONTHS) / price * 100),
            settle1: settle1,
            refund1: Math.max(0, total - settle1),
            settle2: settle2,
            refund2: Math.max(0, total - settle2)
        };
    }

    window.Pricing = {
        formatMoney: formatMoney,
        planCalc: planCalc,
        rangeMan: rangeMan,
        manOne: manOne,
        el: el,
        findByName: findByName,
        onReady: function (callback) {
            if (data) callback(data);
            else listeners.push(callback);
        }
    };

    fetch(DATA_URL)
        .then(function (res) {
            if (!res.ok) throw new Error('HTTP ' + res.status);
            return res.json();
        })
        .then(function (d) {
            data = d;
            fillTokens(d);
            renderTables(d);
            fillNotes(d);
            renderLastUpdated(d);
            listeners.forEach(function (callback) { callback(d); });
            listeners = [];
        })
        .catch(showError);
})();
