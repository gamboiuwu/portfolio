/*!
 * analytics.js — lightweight client-side analytics for antryab.com
 * Events stored in localStorage._gam_analytics_v1 (max 3000, oldest rotated)
 * Exposes window.GamAnalytics for admin consumption.
 * Admin page (/admin/) is excluded automatically.
 */
(function () {
  'use strict';

  var KEY       = '_gam_analytics_v1';
  var MAX_EVTS  = 3000;

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

  /* ── Session ID (per browser tab) ── */
  var sid = sessionStorage.getItem('_gam_sid');
  if (!sid) {
    sid = 's' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
    sessionStorage.setItem('_gam_sid', sid);
  }

  /* ── Normalise page path ── */
  var page = location.pathname
    .replace(/\/index\.html$/, '/')
    .replace(/([^/])$/, '$1');   /* ensure no trailing noise */
  if (!page) page = '/';

  var ref       = document.referrer ? document.referrer.replace(/^https?:\/\/[^/]+/, '') || 'direct' : 'direct';
  var pageStart = Date.now();

  /* ── Pageview ── */
  push({ sid: sid, type: 'pv', page: page, ref: ref, ts: pageStart });

  /* ── Click tracking ── */
  document.addEventListener('click', function (e) {
    /* Walk up the DOM to find the most meaningful element (up to 5 levels) */
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

  /* ── Public API ── */
  window.GamAnalytics = {
    get:    load,
    clear:  function () { localStorage.removeItem(KEY); },
    getKey: function () { return KEY; }
  };

}());
