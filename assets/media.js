(function () {
    'use strict';

    // 이미지·영상 슬롯: data/media.json에 파일이 있을 때만 화면에 나타남.
    // 파일이 없으면 슬롯과 그 구역(section[data-slots]) 전체를 숨기고 아무 흔적도 남기지 않음.
    var script = document.currentScript || document.querySelector('script[src$="assets/media.js"]');
    var ROOT = new URL('../', script.src);
    var MEDIA_URL = new URL('data/media.json', ROOT).href;
    var MAX_VIDEOS = 3; // 릴스 샘플 영상 최대 개수
    var COMPARE_LABELS = ['전', '후'];

    function el(tag, className, text) {
        var node = document.createElement(tag);
        if (className) node.className = className;
        if (text !== undefined) node.textContent = text;
        return node;
    }

    function url(path) {
        return new URL(path, ROOT).href;
    }

    // 파일이 실제로 있는지 확인 (없으면 슬롯을 만들지 않음)
    function exists(path) {
        if (!path) return Promise.resolve(false);
        return fetch(url(path), { method: 'HEAD' })
            .then(function (res) { return res.ok; })
            .catch(function () { return false; });
    }

    function allExist(paths) {
        return Promise.all(paths.map(exists)).then(function (results) {
            return results.length > 0 && results.every(Boolean);
        });
    }

    function setSize(node, entry) {
        var w = Number(entry.width), h = Number(entry.height);
        if (w > 0 && h > 0) {
            node.setAttribute('width', String(w));
            node.setAttribute('height', String(h));
        } else {
            // 크기를 적지 않은 경우: 불러온 뒤 실제 크기를 기록
            var set = function () {
                var nw = node.naturalWidth || node.videoWidth, nh = node.naturalHeight || node.videoHeight;
                if (nw && nh) { node.setAttribute('width', String(nw)); node.setAttribute('height', String(nh)); }
            };
            node.addEventListener('load', set);
            node.addEventListener('loadedmetadata', set);
        }
    }

    function buildImage(path, alt, entry) {
        var img = el('img');
        img.src = url(path);
        img.alt = alt;
        img.loading = 'lazy';
        img.decoding = 'async';
        setSize(img, entry);
        return img;
    }

    function buildVideo(path, poster, entry, controls) {
        var video = el('video');
        video.src = url(path);
        if (poster) video.poster = url(poster);
        video.muted = true;
        video.autoplay = true;
        video.loop = true;
        video.setAttribute('muted', '');
        video.setAttribute('playsinline', '');
        video.preload = 'metadata';
        if (controls) { video.controls = true; video.muted = false; video.removeAttribute('muted'); }
        setSize(video, entry);
        return video;
    }

    // ----- 크게 보기 (<dialog>: Esc, 닫기 버튼, 바깥 클릭으로 닫힘, 닫으면 열었던 버튼으로 포커스 복귀) -----
    var dialog = null;
    var dialogBody = null;

    function ensureDialog() {
        if (dialog) return;
        dialog = el('dialog', 'lightbox');
        dialogBody = el('div', 'lightbox-body');
        var close = el('button', 'lightbox-close', '닫기');
        close.type = 'button';
        close.addEventListener('click', function () { dialog.close(); });
        dialog.appendChild(close);
        dialog.appendChild(dialogBody);
        dialog.addEventListener('click', function (e) { if (e.target === dialog) dialog.close(); });
        dialog.addEventListener('close', function () { dialogBody.textContent = ''; });
        document.body.appendChild(dialog);
    }

    function openLightbox(kind, path, poster, alt, entry) {
        ensureDialog();
        dialogBody.textContent = '';
        var node = kind === 'video' ? buildVideo(path, poster, {}, true) : buildImage(path, alt, entry || {});
        if (kind !== 'video') node.loading = 'eager';
        dialogBody.appendChild(node);
        dialog.setAttribute('aria-label', alt);
        if (typeof dialog.showModal === 'function') dialog.showModal();
        else dialog.setAttribute('open', '');
    }

    function zoomable(node, kind, path, poster, alt, entry) {
        var button = el('button', 'zoom');
        button.type = 'button';
        button.setAttribute('aria-label', alt);
        button.appendChild(node);
        button.addEventListener('click', function () { openLightbox(kind, path, poster, alt, entry); });
        return button;
    }

    // ----- 슬롯 한 개를 그림 (파일이 없거나 alt가 비어 있으면 null) -----
    function renderSlot(def) {
        var files = (def.files || []).filter(Boolean);
        if (!files.length) return Promise.resolve(null);
        if (!def.alt) {
            if (window.console) console.warn('[media] alt가 비어 있어 표시하지 않습니다:', def.id);
            return Promise.resolve(null);
        }

        if (def.type === 'compare') {
            if (files.length < 2) return Promise.resolve(null);
            files = files.slice(0, 2);
            return allExist(files).then(function (ok) {
                if (!ok) return null;
                var wrap = el('figure', 'media-slot media-compare');
                var pair = el('div', 'compare-pair');
                files.forEach(function (path, i) {
                    var fig = el('figure');
                    var alt = def.alt + ' ' + COMPARE_LABELS[i];
                    fig.appendChild(zoomable(buildImage(path, alt, def), 'image', path, null, alt, def));
                    fig.appendChild(el('figcaption', null, COMPARE_LABELS[i]));
                    pair.appendChild(fig);
                });
                wrap.appendChild(pair);
                if (def.caption) wrap.appendChild(el('figcaption', 'media-caption', def.caption));
                return wrap;
            });
        }

        if (def.type === 'video') {
            files = files.slice(0, MAX_VIDEOS);
            var posters = def.posters || [];
            return allExist(files).then(function (ok) {
                if (!ok) return null;
                return Promise.all(files.map(function (_, i) { return exists(posters[i]); })).then(function (posterOk) {
                    var wrap = el('figure', 'media-slot media-videos');
                    var row = el('div', 'video-row');
                    files.forEach(function (path, i) {
                        var poster = posterOk[i] ? posters[i] : null;
                        row.appendChild(zoomable(buildVideo(path, poster, def, false), 'video', path, poster, def.alt, def));
                    });
                    wrap.appendChild(row);
                    if (def.caption) wrap.appendChild(el('figcaption', 'media-caption', def.caption));
                    return wrap;
                });
            });
        }

        // image
        return exists(files[0]).then(function (ok) {
            if (!ok) return null;
            var wrap = el('figure', 'media-slot media-image');
            wrap.appendChild(zoomable(buildImage(files[0], def.alt, def), 'image', files[0], null, def.alt, def));
            if (def.caption) wrap.appendChild(el('figcaption', 'media-caption', def.caption));
            return wrap;
        });
    }

    // ----- 작업물(gallery) 한 칸 -----
    function renderGalleryItem(item) {
        if (!item || !item.file || !item.alt) return Promise.resolve(null);
        var isVideo = item.type === 'video';
        return exists(item.file).then(function (ok) {
            if (!ok) return null;
            return (isVideo && item.poster ? exists(item.poster) : Promise.resolve(false)).then(function (posterOk) {
                var fig = el('figure');
                var node = isVideo
                    ? buildVideo(item.file, posterOk ? item.poster : null, item, false)
                    : buildImage(item.file, item.alt, item);
                fig.appendChild(zoomable(node, isVideo ? 'video' : 'image', item.file, posterOk ? item.poster : null, item.alt, item));
                if (item.caption || item.channel) {
                    var cap = el('figcaption');
                    if (item.channel) cap.appendChild(el('span', 'cap-tag', item.channel));
                    if (item.caption) cap.appendChild(el('strong', 'cap-text', item.caption));
                    fig.appendChild(cap);
                }
                return fig;
            });
        });
    }

    var mediaPromise = null;
    function load() {
        if (!mediaPromise) {
            mediaPromise = fetch(MEDIA_URL)
                .then(function (res) { return res.ok ? res.json() : { slots: [], gallery: [] }; })
                .catch(function () { return { slots: [], gallery: [] }; });
        }
        return mediaPromise;
    }

    // 페이지의 [data-slot] 자리를 채우고, 비어 있는 구역은 통째로 숨김 (구역은 기본이 숨김 상태)
    function initSlots() {
        var hosts = document.querySelectorAll('[data-slot]');
        if (!hosts.length) return;
        load().then(function (media) {
            var slots = media.slots || [];
            return Promise.all(Array.prototype.map.call(hosts, function (host) {
                var def = slots.filter(function (s) { return s.id === host.getAttribute('data-slot'); })[0];
                return (def ? renderSlot(def) : Promise.resolve(null)).then(function (node) {
                    if (node) { host.appendChild(node); host.hidden = false; }
                });
            }));
        }).then(function () {
            Array.prototype.forEach.call(document.querySelectorAll('section[data-slots]'), function (section) {
                section.hidden = !section.querySelector('[data-slot]:not([hidden])');
            });
        });
    }

    // 홈의 작업물 미리보기: 실제 파일이 있는 항목이 MIN_GALLERY개 이상일 때만 구역을 보여 줌
    var MIN_GALLERY = 3;
    function initGalleryPreview() {
        var hosts = document.querySelectorAll('[data-gallery-preview]');
        if (!hosts.length) return;
        load().then(function (media) {
            var gallery = Array.isArray(media.gallery) ? media.gallery : [];
            return Promise.all(gallery.map(function (item) {
                return renderGalleryItem(item).then(function (fig) { return fig ? { item: item, fig: fig } : null; });
            }));
        }).then(function (results) {
            var ready = results.filter(Boolean);
            if (ready.length < MIN_GALLERY) return;
            Array.prototype.forEach.call(hosts, function (host) {
                var limit = Number(host.getAttribute('data-limit')) || ready.length;
                ready.slice(0, limit).forEach(function (r) {
                    var li = el('li');
                    li.appendChild(r.fig.cloneNode(true));
                    host.appendChild(li);
                });
                var section = host.closest('[data-gallery-section]');
                if (section) section.hidden = false;
            });
        });
    }


    // 홈의 소개 구역: data/profile.json에 내용이 있을 때만 보임
    function initProfile() {
        var section = document.querySelector('[data-profile]');
        if (!section) return;
        fetch(new URL('data/profile.json', ROOT).href)
            .then(function (res) { return res.ok ? res.json() : null; })
            .catch(function () { return null; })
            .then(function (data) {
                if (!data) return;
                var lines = Array.isArray(data.lines) ? data.lines.filter(Boolean) : [];
                var headline = (data.headline || '').trim();
                if (!headline && !lines.length) return;
                var lead = section.querySelector('[data-profile-lead]');
                var list = section.querySelector('[data-profile-lines]');
                if (headline) { lead.textContent = headline; lead.hidden = false; }
                lines.forEach(function (line) { list.appendChild(el('li', null, line)); });
                list.hidden = !lines.length;
                section.hidden = false;
            });
    }

    window.Media = { load: load, renderGalleryItem: renderGalleryItem };

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', function () { initSlots(); initGalleryPreview(); initProfile(); });
    else { initSlots(); initGalleryPreview(); initProfile(); }
})();
