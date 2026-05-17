/*!
 * commission-data.js
 * Gallery data, font, and style manager via localStorage.
 * Used by commissions/index.html and admin/index.html.
 */
window.CommissionData = (function () {
  'use strict';

  var KEYS = {
    data:     '_gam_data_v1',
    fonts:    '_gam_fonts_v1',
    styles:   '_gam_styles_v1',
    inquiries: '_gam_inquiries_v1',
    prices:   '_gam_prices_v1'
  };

  var DEFAULTS = {
    data: {
      commissions: [
        { src: '../images/fullcomm/comm1.png',  alt: 'Complex full body with environment', caption: 'Complex Full Body w/ Environment' },
        { src: '../images/fullcomm/comm2.jpeg', alt: 'Complex full body',                  caption: 'Complex Full Body'               },
        { src: '../images/fullcomm/comm3.png',  alt: 'Flat headshot',                      caption: 'Flat Headshot'                   }
      ],
      stickers: [
        { src: '../images/stickers/sticker1.png', alt: 'Simple sticker 1',  category: 'Simple'  },
        { src: '../images/stickers/sticker3.png', alt: 'Simple sticker 2',  category: 'Simple'  },
        { src: '../images/stickers/sticker2.png', alt: 'Complex sticker 1', category: 'Complex' },
        { src: '../images/stickers/sticker4.png', alt: 'Complex sticker 2', category: 'Complex' },
        { src: '../images/stickers/sticker5.png', alt: 'Complex sticker 3', category: 'Complex' }
      ],
      featured: [
        {
          title: 'To Prove You Are Everything',
          tagline: 'Senior Project · 2026',
          statement: 'An interdisciplinary studio art senior thesis exploring identity, self-expression, and the tension between what is seen and what is felt.',
          src: '',
          link: '',
          images: [],
          visible: true
        }
      ]
    },
    fonts:  { heading: '', body: '', custom: [] },
    styles: { accentColor: '', customCSS: '' },
    prices: {
      digital: {
        status: 'open',
        cols: ['Sketch', 'Flat', 'Flat Shade', 'Complex'],
        rows: [
          { label: 'Headshot (Bust)',         prices: [19, 48, 77, 96]    },
          { label: 'Half Body',               prices: [37, 93, 149, 186]  },
          { label: 'Full Body / Environment', prices: [54, 134, 214, 268] }
        ],
        addons: [
          { label: 'Physical Print 13×19in', price: '+$10' },
          { label: 'NSFW',       price: '+$20' },
          { label: 'Rush 48hr',  price: '+$10' },
          { label: 'Rush 24hr',  price: '+$20' },
          { label: 'Rush 12hr',  price: '+$30' }
        ]
      },
      stickers: {
        status: 'open',
        cols: ['1 Pack', '3 Pack', '5 Pack', '10 Pack'],
        rows: [
          { label: 'Simple (flat)', prices: [17, 45, 59, 101] },
          { label: 'Complex',       prices: [24, 65, 90, 144] }
        ],
        addons: [
          { label: 'No additional upcharge for NSFW stickers', price: '' }
        ]
      },
      animation: {
        status: 'closed',
        cols: ['Sketch', 'Shaded', 'Complex'],
        rows: [
          { label: 'Loop',      prices: [100, 200, 280] },
          { label: '5 Seconds', prices: [150, 320, 510] }
        ],
        addons: [
          { label: 'NSFW Animation', price: '+$100' },
          { label: 'Must be discussed prior to animation work', price: '' }
        ]
      }
    }
  };

  function clone(obj) { return JSON.parse(JSON.stringify(obj)); }

  function read(key, def) {
    try {
      var v = localStorage.getItem(key);
      if (!v) return clone(def);
      var stored = JSON.parse(v);
      /* Shallow-merge: stored values win, but any key missing from the
         stored object (e.g. "featured" added after first save) falls
         back to the default value so callers never see undefined. */
      if (stored && typeof stored === 'object' && !Array.isArray(stored)) {
        var merged = clone(def);
        Object.keys(stored).forEach(function (k) { merged[k] = stored[k]; });
        return merged;
      }
      return stored;
    } catch (e) {
      return clone(def);
    }
  }

  function write(key, val) {
    localStorage.setItem(key, JSON.stringify(val));
  }

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;')
      .replace(/"/g, '&quot;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }

  /* ---- Font loading ---- */

  function loadGoogleFont(name) {
    if (!name) return;
    var id = 'gf-' + name.toLowerCase().replace(/\s+/g, '-');
    if (document.getElementById(id)) return;
    var link = document.createElement('link');
    link.id   = id;
    link.rel  = 'stylesheet';
    link.href = 'https://fonts.googleapis.com/css2?family=' +
                encodeURIComponent(name) +
                ':ital,wght@0,300;0,400;0,700;1,400&display=swap';
    document.head.appendChild(link);
  }

  /* ---- Apply persisted fonts + styles to the current page ---- */

  function applyAll() {
    var fonts  = CD.getFonts();
    var styles = CD.getStyles();
    var css    = '';

    /* Custom @font-face blocks from uploaded files */
    (fonts.custom || []).forEach(function (f) { css += f.face + '\n'; });

    /* Google Font assignments */
    if (fonts.heading) {
      loadGoogleFont(fonts.heading);
      css += 'h1,h2,h3,h4,h5,h6{font-family:"' + fonts.heading + '",sans-serif!important}';
    }
    if (fonts.body) {
      loadGoogleFont(fonts.body);
      css += 'body,p,td,li{font-family:"' + fonts.body + '",sans-serif!important}';
    }

    /* Accent color override */
    if (styles.accentColor) {
      var c = styles.accentColor;
      css += '.button.primary,.button.primary:visited{background-color:' + c + '!important;border-color:' + c + '!important}';
      css += 'a:hover{color:' + c + '!important}';
      css += '.status-badge.open{background:' + c + '22!important;border-color:' + c + '!important;color:' + c + '!important}';
    }

    /* User custom CSS */
    if (styles.customCSS) css += '\n' + styles.customCSS;

    var tag = document.getElementById('_gam_dynamic');
    if (!tag) {
      tag = document.createElement('style');
      tag.id = '_gam_dynamic';
      document.head.appendChild(tag);
    }
    tag.textContent = css;
  }

  /* ---- Gallery renderers ---- */

  function renderCommissions() {
    var el = document.getElementById('comm-gallery-container');
    if (!el) return;
    var items = CD.get().commissions || [];
    el.innerHTML = items.map(function (it) {
      return '<figure class="comm-gallery-item">' +
        '<img src="' + esc(it.src) + '" alt="' + esc(it.alt) + '" />' +
        (it.caption ? '<figcaption>' + esc(it.caption) + '</figcaption>' : '') +
        '</figure>';
    }).join('');
  }

  function renderStickers() {
    var el = document.getElementById('sticker-gallery-container');
    if (!el) return;
    var items = CD.get().stickers || [];
    el.innerHTML = items.map(function (it) {
      return '<figure class="sticker-gallery-item">' +
        '<img src="' + esc(it.src) + '" alt="' + esc(it.alt) + '" />' +
        '</figure>';
    }).join('');
  }

  function renderFeatured() {
    var el = document.getElementById('featured-container');
    if (!el) return;
    var allItems = CD.get().featured || [];
    var items = allItems.filter(function(it){ return it.visible !== false; });
    if (!items.length) { el.innerHTML = ''; return; }
    el.innerHTML = items.map(function (it) {
      /* find the real index so the detail page can look it up */
      var realIdx = allItems.indexOf(it);
      var detailHref = 'featured/?i=' + realIdx;
      var imgStyle  = it.src ? ' style="background-image:url(\'' + it.src.replace(/'/g, "\\'") + '\')"' : '';
      var imgClass  = it.src ? 'featured-img' : 'featured-img featured-img-empty';
      /* Stretched-link pattern: card keeps its flex layout intact;
         the <a> inside .featured-body gets a ::after that covers the whole card */
      return '<article class="featured-card">' +
        '<div class="' + imgClass + '"' + imgStyle + '></div>' +
        '<div class="featured-body">' +
          (it.tagline   ? '<span class="featured-tagline">' + esc(it.tagline) + '</span>'  : '') +
          '<h3 class="featured-title">' + esc(it.title) + '</h3>' +
          (it.statement ? '<p class="featured-statement">' + esc(it.statement) + '</p>'    : '') +
          '<a href="' + detailHref + '" class="featured-cta">Read More &rarr;</a>' +
        '</div>' +
      '</article>';
    }).join('');
  }

  /* ---- Price table helpers ---- */

  function buildPriceTable(cols, rows, firstHeader) {
    var html = '<div class="table-wrapper"><table><thead><tr><th>' + esc(firstHeader) + '</th>';
    cols.forEach(function(c){ html += '<th>' + esc(c) + '</th>'; });
    html += '</tr></thead><tbody>';
    rows.forEach(function(r) {
      html += '<tr><td>' + esc(r.label) + '</td>';
      (r.prices || []).forEach(function(p){ html += '<td>$' + p + '</td>'; });
      html += '</tr>';
    });
    html += '</tbody></table></div>';
    return html;
  }

  function buildPriceAddons(addons) {
    if (!addons || !addons.length) return '';
    var html = '<ul class="addons-list">';
    addons.forEach(function(a) {
      if (a.price) {
        html += '<li><strong>' + esc(a.label) + '</strong>  ' + esc(a.price) + '</li>';
      } else {
        html += '<li>' + esc(a.label) + '</li>';
      }
    });
    return html + '</ul>';
  }

  function renderPriceTables() {
    var pr = CD.getPrices();

    function applySection(secKey, tableId, addonsId, startingId, badgeId, firstHeader) {
      var s = pr[secKey];
      var tableEl = document.getElementById(tableId);
      if (tableEl) tableEl.innerHTML = buildPriceTable(s.cols, s.rows, firstHeader);
      var addonsEl = document.getElementById(addonsId);
      if (addonsEl) addonsEl.innerHTML = buildPriceAddons(s.addons);
      if (startingId) {
        var startEl = document.getElementById(startingId);
        if (startEl) {
          var min = Infinity;
          (s.rows || []).forEach(function(r){ if ((r.prices || [])[0] < min) min = r.prices[0]; });
          startEl.innerHTML = 'Starting from <strong>$' + (isFinite(min) ? min : '—') + '</strong>';
        }
      }
      if (badgeId) {
        var badgeEl = document.getElementById(badgeId);
        if (badgeEl) {
          badgeEl.className = 'status-badge ' + (s.status === 'open' ? 'open' : 'closed');
          badgeEl.textContent = s.status === 'open' ? 'Open' : 'Closed';
        }
      }
    }

    applySection('digital',   'digital-table-wrap',   'digital-addons-wrap',   'digital-starting',  null,                    'Art (Digital)');
    applySection('stickers',  'sticker-table-wrap',   'sticker-addons-wrap',   'sticker-starting',  null,                    'Sticker Type');
    applySection('animation', 'animation-table-wrap', 'animation-addons-wrap', null,                'animation-status-badge','Animation');

    var overallBadge = document.getElementById('overall-status-badge');
    if (overallBadge) {
      var anyOpen = ['digital','stickers','animation'].some(function(k){ return pr[k].status === 'open'; });
      overallBadge.className = 'status-badge ' + (anyOpen ? 'open' : 'closed');
      overallBadge.textContent = anyOpen ? 'Open' : 'Closed';
    }
  }

  var CD = {
    /* Data */
    get:         function ()  { return read(KEYS.data,   DEFAULTS.data);   },
    save:        function (d) { write(KEYS.data,   d);                      },
    reset:       function ()  { localStorage.removeItem(KEYS.data);         },
    /* Fonts */
    getFonts:    function ()  { return read(KEYS.fonts,  DEFAULTS.fonts);  },
    saveFonts:   function (f) { write(KEYS.fonts,  f);                      },
    /* Styles */
    getStyles:   function ()  { return read(KEYS.styles, DEFAULTS.styles); },
    saveStyles:  function (s) { write(KEYS.styles, s);                      },
    /* Inquiries */
    getInquiries: function () {
      try {
        var v = localStorage.getItem(KEYS.inquiries);
        return v ? JSON.parse(v) : [];
      } catch(e) { return []; }
    },
    saveInquiry: function (inq) {
      var list = CD.getInquiries();
      list.unshift(inq);           // newest first
      localStorage.setItem(KEYS.inquiries, JSON.stringify(list));
    },
    deleteInquiry: function (id) {
      var list = CD.getInquiries().filter(function(i){ return i.id !== id; });
      localStorage.setItem(KEYS.inquiries, JSON.stringify(list));
    },
    markInquiryRead: function (id) {
      var list = CD.getInquiries().map(function(i){
        return i.id === id ? Object.assign({}, i, {read: true}) : i;
      });
      localStorage.setItem(KEYS.inquiries, JSON.stringify(list));
    },
    /* Prices */
    getPrices:  function()  {
      try {
        var v = localStorage.getItem(KEYS.prices);
        if (!v) return clone(DEFAULTS.prices);
        var stored = JSON.parse(v);
        var merged = clone(DEFAULTS.prices);
        ['digital','stickers','animation'].forEach(function(k){
          if (stored && stored[k]) merged[k] = stored[k];
        });
        return merged;
      } catch(e) { return clone(DEFAULTS.prices); }
    },
    savePrices: function(p) { write(KEYS.prices, p); },
    renderPriceTables: renderPriceTables,
    /* Utilities */
    loadGoogleFont: loadGoogleFont,
    applyAll:       applyAll,
    renderCommissions: renderCommissions,
    renderStickers:    renderStickers,
    renderFeatured:    renderFeatured,
    esc:     esc,
    DEFAULTS: DEFAULTS
  };

  return CD;
}());
