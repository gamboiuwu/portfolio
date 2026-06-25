/*!
 * analytics.js — lightweight client-side analytics for antryab.com
 * Events stored in localStorage._gam_analytics_v1 (max 3000, oldest rotated)
 * Artwork viewport tracking stored in localStorage._gam_spotlight_v1
 * Exposes window.GamAnalytics for admin consumption.
 * Admin page (/admin/) is excluded automatically.
 */
(function () {
  'use strict';

  var KEY       = '_gam_analytics_v1';
  var SP_KEY    = '_gam_spotlight_v1';
  var MAX_EVTS  = 3000;
  var MAX_SP    = 2000;

  /* Skip tracking on the admin page */
  if (location.pathname.indexOf('/admin') !== -1) return;

  /* ── Storage helpers ── */
  function load() {
    try { return JSON.parse(localStorage.getItem(KEY) || '[]'); } catch (e) { return []; }
  }
  function push(evt) {
    var list = load();
    list.push(evt);
    if (list.length > MAX_EVTS) list = list.slice(list.length - MAX_EVTS);
    try { localStorage.setItem(KEY, JSON.stringify(list)); } catch (e) {}
  }

  function loadSpotlight() {
    try { return JSON.parse(localStorage.getItem(SP_KEY) || '[]'); } catch (e) { return []; }
  }
  function pushSpotlight(evt) {
    var list = loadSpotlight();
    list.push(evt);
    if (list.length > MAX_SP) list = list.slice(list.length - MAX_SP);
    try { localStorage.setItem(SP_KEY, JSON.stringify(list)); } catch (e) {}
  }

  /* ── Session ID (per browser tab) ── */
  var sid        = sessionStorage.getItem('_gam_sid');
  var newSession = !sid;            /* true the first pageview of a fresh tab session */
  if (!sid) {
    sid = 's' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
    sessionStorage.setItem('_gam_sid', sid);
  }

  /* ── Persistent visitor identity (survives across sessions; powers the Orbit
        loyalty / return-cadence tool). Stored in localStorage so it persists
        between visits, unlike the per-tab `sid`. ── */
  var VID_KEY   = '_gam_vid';
  var VISIT_KEY = '_gam_visit_v1';
  var vid = localStorage.getItem(VID_KEY);
  if (!vid) {
    vid = 'v' + Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
    try { localStorage.setItem(VID_KEY, vid); } catch (e) {}
  }
  /* Visit ledger: { first: ts, last: ts, count: n } — count is lifetime visits */
  var visitLedger;
  try { visitLedger = JSON.parse(localStorage.getItem(VISIT_KEY) || 'null'); } catch (e) { visitLedger = null; }
  if (!visitLedger || typeof visitLedger.count !== 'number') {
    visitLedger = { first: 0, last: 0, count: 0 };
  }
  /* Days since the previous visit, computed before we overwrite `last` (−1 = first ever) */
  var vgap = visitLedger.last ? Math.floor((Date.now() - visitLedger.last) / 86400000) : -1;
  /* A fresh tab session counts as a new visit; bump the lifetime ledger once */
  if (newSession) {
    visitLedger.count += 1;
    if (!visitLedger.first) visitLedger.first = Date.now();
    visitLedger.last = Date.now();
    try { localStorage.setItem(VISIT_KEY, JSON.stringify(visitLedger)); } catch (e) {}
  }
  var vnum = visitLedger.count || 1;   /* lifetime visit number for this session */
  var vnew = vnum <= 1;                 /* first-ever visit for this browser */

  /* ── Normalise page path ── */
  var page = location.pathname
    .replace(/\/index\.html$/, '/')
    .replace(/([^/])$/, '$1');
  if (!page) page = '/';

  var ref       = document.referrer ? document.referrer.replace(/^https?:\/\/[^/]+/, '') || 'direct' : 'direct';
  /* Full referrer host (kept alongside the path-only `ref` for the Compass acquisition tool) */
  var refHost   = 'direct';
  if (document.referrer) {
    var rm = document.referrer.match(/^https?:\/\/([^/]+)/);
    if (rm) refHost = rm[1].replace(/^www\./i, '').toLowerCase();
  }
  var pageStart = Date.now();

  /* ── Device fingerprint for pageview ── */
  var ua  = navigator.userAgent || '';
  var dev = /Mobi|Android|iPhone|iPad|iPod/i.test(ua) ? 'mobile' : 'desktop';
  if (/iPad|Tablet/i.test(ua)) dev = 'tablet';
  var sw  = window.screen ? window.screen.width  : 0;
  var sh  = window.screen ? window.screen.height : 0;

  /* ── Pageview ── */
  push({ sid: sid, type: 'pv', page: page, ref: ref, refHost: refHost, dev: dev, sw: sw, sh: sh,
         vid: vid, vnum: vnum, vnew: vnew, vgap: vgap, ts: pageStart });

  /* ── Click tracking ── */
  document.addEventListener('click', function (e) {
    var el = e.target;
    for (var i = 0; i < 5; i++) {
      if (!el || el === document.body) break;
      var tag = (el.tagName || '').toUpperCase();
      if (tag === 'A' || tag === 'BUTTON' || el.getAttribute('role') === 'button') break;
      el = el.parentElement;
    }
    if (!el || el === document.body) el = e.target;

    var cls   = (el.className && typeof el.className === 'string')
      ? '.' + el.className.trim().split(/\s+/)[0]
      : '';
    var label = (el.tagName || '').toLowerCase() + cls;
    var text  = (el.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 60);
    var href  = el.getAttribute('href') || '';

    push({
      sid:  sid,
      type: 'click',
      page: page,
      el:   label,
      text: text,
      href: href,
      xp:   Math.round((e.clientX / Math.max(window.innerWidth,  1)) * 100) / 100,
      yp:   Math.round((e.clientY / Math.max(window.innerHeight, 1)) * 100) / 100,
      ts:   Date.now()
    });
  }, { passive: true });

  /* ── Scroll depth (logged at 25 / 50 / 75 / 100 %) ── */
  var scrollLogged = {};
  var scrollTimer;
  window.addEventListener('scroll', function () {
    clearTimeout(scrollTimer);
    scrollTimer = setTimeout(function () {
      var doc     = document.documentElement;
      var scrolled = doc.scrollTop + window.innerHeight;
      var total    = Math.max(doc.scrollHeight, 1);
      var depth    = Math.min(100, Math.round((scrolled / total) * 100));
      [25, 50, 75, 100].forEach(function (t) {
        if (depth >= t && !scrollLogged[t]) {
          scrollLogged[t] = true;
          push({ sid: sid, type: 'scroll', page: page, depth: t, ts: Date.now() });
        }
      });
    }, 250);
  }, { passive: true });

  /* ── Artwork tile hover (fires after 1 s sustained hover) ── */
  var hoverTimers = {};
  function findTileArticle(el) {
    for (var i = 0; i < 6; i++) {
      if (!el || el === document.body) return null;
      var par = el.parentElement;
      if (el.tagName === 'ARTICLE' && par && par.className && par.className.indexOf('tiles') !== -1) return el;
      el = par;
    }
    return null;
  }
  document.addEventListener('mouseover', function (e) {
    var art = findTileArticle(e.target);
    if (!art) return;
    var key = art.className + '|' + (art.offsetTop || 0);
    if (hoverTimers[key]) return;
    hoverTimers[key] = setTimeout(function () {
      var h2 = art.querySelector('h2');
      push({ sid: sid, type: 'tile_hover', page: page, title: h2 ? h2.textContent.trim().slice(0, 60) : '', ts: Date.now() });
      delete hoverTimers[key];
    }, 1000);
  }, { passive: true });
  document.addEventListener('mouseout', function (e) {
    var art = findTileArticle(e.target);
    if (!art) return;
    var key = art.className + '|' + (art.offsetTop || 0);
    if (hoverTimers[key]) { clearTimeout(hoverTimers[key]); delete hoverTimers[key]; }
  }, { passive: true });

  /* ── Exit event ── */
  var exitFired = false;
  function fireExit() {
    if (exitFired) return;
    exitFired = true;
    push({ sid: sid, type: 'exit', page: page, ms: Date.now() - pageStart, ts: Date.now() });
  }
  window.addEventListener('beforeunload', fireExit);
  document.addEventListener('visibilitychange', function () {
    if (document.visibilityState === 'hidden') fireExit();
  });

  /* ── Spotlight: artwork viewport-time tracker ── */
  if ('IntersectionObserver' in window) {
    var spTimers  = {};  /* artId -> entry timestamp */
    var spCounted = {};  /* artId -> set of sessionIds already counted to avoid re-counting rapid flickers */

    var artObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        var el    = entry.target;
        var artId = el.dataset.spId || '';
        if (!artId) return;

        if (entry.isIntersecting) {
          spTimers[artId] = Date.now();
        } else if (spTimers[artId]) {
          var ms = Date.now() - spTimers[artId];
          delete spTimers[artId];
          if (ms < 400) return; /* ignore rapid flickers < 400ms */
          pushSpotlight({
            sid:   sid,
            artId: artId,
            alt:   el.dataset.spAlt  || '',
            label: el.dataset.spLabel || '',
            page:  page,
            ms:    ms,
            ts:    Date.now()
          });
        }
      });
    }, { threshold: 0.25 }); /* fire when 25% of element is visible */

    /* Assign IDs and observe artwork elements */
    function observeArtworks() {
      var counter = 0;

      /* Featured cards (.featured-card) */
      document.querySelectorAll('.featured-card').forEach(function (card) {
        if (card.dataset.spId) return;
        var titleEl = card.querySelector('.featured-title');
        var tagEl   = card.querySelector('.featured-tagline');
        var label   = (titleEl ? titleEl.textContent.trim() : '') ||
                      (tagEl   ? tagEl.textContent.trim()   : '') ||
                      'featured-' + (++counter);
        card.dataset.spId    = 'feat::' + label.slice(0, 50);
        card.dataset.spLabel = label.slice(0, 60);
        card.dataset.spAlt   = label.slice(0, 60);
        artObserver.observe(card);
      });

      /* Project tiles (.tiles article) */
      document.querySelectorAll('.tiles article').forEach(function (art) {
        if (art.dataset.spId) return;
        var h2 = art.querySelector('h2');
        var label = (h2 ? h2.textContent.trim() : '') || 'tile-' + (++counter);
        art.dataset.spId    = 'tile::' + label.slice(0, 50);
        art.dataset.spLabel = label.slice(0, 60);
        art.dataset.spAlt   = label.slice(0, 60);
        artObserver.observe(art);
      });

      /* Commission gallery images */
      document.querySelectorAll('.comm-gallery-item img').forEach(function (img) {
        if (img.dataset.spId) return;
        var label = img.getAttribute('alt') || img.src.split('/').pop() || 'comm-' + (++counter);
        img.dataset.spId    = 'comm::' + label.slice(0, 50);
        img.dataset.spLabel = label.slice(0, 60);
        img.dataset.spAlt   = img.getAttribute('alt') || '';
        artObserver.observe(img);
      });

      /* Sticker gallery images */
      document.querySelectorAll('.sticker-gallery-item img').forEach(function (img) {
        if (img.dataset.spId) return;
        var label = img.getAttribute('alt') || img.src.split('/').pop() || 'sticker-' + (++counter);
        img.dataset.spId    = 'sticker::' + label.slice(0, 50);
        img.dataset.spLabel = label.slice(0, 60);
        img.dataset.spAlt   = img.getAttribute('alt') || '';
        artObserver.observe(img);
      });

      /* Expertise grid items */
      document.querySelectorAll('.expertise-item').forEach(function (item) {
        if (item.dataset.spId) return;
        var titleEl = item.querySelector('.expertise-item-title');
        var label   = (titleEl ? titleEl.textContent.trim() : '') || 'expertise-' + (++counter);
        item.dataset.spId    = 'expertise::' + label.slice(0, 50);
        item.dataset.spLabel = label.slice(0, 60);
        item.dataset.spAlt   = label.slice(0, 60);
        artObserver.observe(item);
      });
    }

    /* Initial scan — also re-scan after dynamic content renders */
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', function () {
        observeArtworks();
        setTimeout(observeArtworks, 800);
      });
    } else {
      observeArtworks();
      setTimeout(observeArtworks, 800);
    }

    /* Flush any in-progress timers on page exit */
    window.addEventListener('beforeunload', function () {
      Object.keys(spTimers).forEach(function (artId) {
        var ms = Date.now() - spTimers[artId];
        if (ms < 400) return;
        pushSpotlight({
          sid:   sid,
          artId: artId,
          alt:   '',
          label: artId.split('::')[1] || artId,
          page:  page,
          ms:    ms,
          ts:    Date.now()
        });
      });
    });
  }

  /* ── Public API ── */
  window.GamAnalytics = {
    get:          load,
    clear:        function () { localStorage.removeItem(KEY); },
    getKey:       function () { return KEY; },
    getSpotlight: loadSpotlight,
    clearSpotlight: function () { localStorage.removeItem(SP_KEY); },
    getVid:   function () { return vid; },
    getVisit: function () { return visitLedger; }
  };

}());
